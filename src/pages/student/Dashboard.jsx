import { ArrowRight, BookOpen, CheckCircle2, Clock, Target } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';
import { formatDateTime, percent } from '../../utils/formatters';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [available, setAvailable] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [availableRes, performanceRes] = await Promise.all([
          api.get('/exams/student/available'),
          api.get('/exams/student/performance'),
        ]);
        setAvailable(availableRes.data);
        setSubmissions(performanceRes.data);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const completed = submissions.length;
    const avg = completed
      ? submissions.reduce((sum, submission) => sum + ((submission.score / submission.total_questions) * 100), 0) / completed
      : 0;
    return {
      completed,
      average: avg,
      active: available.filter((exam) => exam.effective_status === 'live' && !exam.submitted).length,
    };
  }, [available, submissions]);

  const scoreData = submissions.slice().reverse().map((submission) => ({
    exam: submission.exam_id?.title || 'Exam',
    score: Number(((submission.score / submission.total_questions) * 100).toFixed(1)),
  }));

  const topicData = useMemo(() => {
    const topics = {};
    submissions.forEach((submission) => {
      submission.answers?.forEach((answer) => {
        const topic = answer.question_id?.topic || 'General';
        if (!topics[topic]) topics[topic] = { topic, total: 0, correct: 0 };
        topics[topic].total += 1;
        if (answer.is_correct) topics[topic].correct += 1;
      });
    });
    return Object.values(topics).map((topic) => ({
      topic: topic.topic,
      accuracy: topic.total ? Number(((topic.correct / topic.total) * 100).toFixed(1)) : 0,
    }));
  }, [submissions]);

  if (loading) return <div className="panel text-sm font-semibold text-slate-500">Loading dashboard...</div>;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome, ${user?.full_name?.split(' ')[0] || 'student'}`}
        description="Track available exams, completed attempts, and topic-level progress."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Active exams</p><p className="mt-2 text-3xl font-extrabold text-emerald-700">{stats.active}</p></div>
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Average score</p><p className="mt-2 text-3xl font-extrabold">{percent(stats.average)}</p></div>
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Completed</p><p className="mt-2 text-3xl font-extrabold text-sky-700">{stats.completed}</p></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <div className="panel h-80">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-950"><Target className="h-5 w-5" /> Score trend</h2>
            {scoreData.length === 0 ? (
              <div className="grid h-56 place-items-center text-sm font-semibold text-slate-500">Complete an exam to see a score trend.</div>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={scoreData}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="exam" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="panel h-80">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-950"><CheckCircle2 className="h-5 w-5" /> Topic accuracy</h2>
            {topicData.length === 0 ? (
              <div className="grid h-56 place-items-center text-sm font-semibold text-slate-500">Topic accuracy appears after completed exams.</div>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={topicData}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="topic" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="panel">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-950"><Clock className="h-5 w-5" /> Available exams</h2>
            <div className="space-y-3">
              {available.filter((exam) => !exam.submitted).length === 0 ? (
                <p className="rounded-md bg-slate-100 p-4 text-sm font-semibold text-slate-500">No available exams right now.</p>
              ) : available.filter((exam) => !exam.submitted).map((exam) => (
                <div key={exam._id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{exam.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{exam.duration_minutes} mins / {exam.questions?.length || 0} questions</p>
                    </div>
                    <StatusBadge status={exam.effective_status} />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Start: {formatDateTime(exam.start_time)}</p>
                  <button
                    type="button"
                    className="btn-primary mt-4 w-full"
                    disabled={exam.effective_status !== 'live'}
                    onClick={() => navigate(`/student/exam/${exam._id}/instructions`)}
                  >
                    {exam.effective_status === 'live' ? 'Start exam' : 'Not live yet'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-950"><BookOpen className="h-5 w-5" /> Completed attempts</h2>
            {submissions.length === 0 ? (
              <EmptyState title="No attempts yet" description="Submitted exams will appear here." />
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <button key={submission._id} type="button" className="w-full rounded-md border border-slate-200 p-3 text-left hover:bg-slate-50" onClick={() => navigate(`/student/exam/${submission.exam_id?._id}/summary`)}>
                    <p className="font-bold text-slate-950">{submission.exam_id?.title || 'Exam'}</p>
                    <p className="mt-1 text-sm font-semibold text-teal-700">{submission.score} / {submission.total_questions}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

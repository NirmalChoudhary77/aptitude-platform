import { Activity, BarChart3, BookOpen, CalendarClock, FilePlus2, FileQuestion, Play, Square, Trash2, Trophy, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/client';
import { examQuestionCount, formatDateTime, percent } from '../../utils/formatters';

function ScheduleModal({ exam, onClose, onSave }) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const save = () => {
    if (!startTime || !endTime) return;
    onSave(exam._id, startTime, endTime);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
      <div className="panel w-full max-w-md p-6">
        <h2 className="text-xl font-extrabold text-slate-950">Schedule exam</h2>
        <p className="mt-1 text-sm text-slate-500">{exam.title}</p>
        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="start_time">Start time</label>
            <input id="start_time" className="input" type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="end_time">End time</label>
            <input id="end_time" className="input" type="datetime-local" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={save} disabled={!startTime || !endTime}>Save schedule</button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [analyticsByExam, setAnalyticsByExam] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const [{ data: examData }, { data: questionData }, { data: pyqData }] = await Promise.all([
        api.get('/exams/teacher'),
        api.get('/questions'),
        api.get('/pyq'),
      ]);
      setExams(examData);
      setQuestions(questionData);
      setPyqs(pyqData);

      const analyticsEntries = await Promise.all(
        examData.map(async (exam) => {
          try {
            const { data } = await api.get(`/exams/teacher/${exam._id}/analytics`);
            return [exam._id, data];
          } catch {
            return [exam._id, null];
          }
        }),
      );
      setAnalyticsByExam(Object.fromEntries(analyticsEntries));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const stats = useMemo(() => {
    const analytics = Object.values(analyticsByExam).filter(Boolean);
    const submissions = analytics.reduce((sum, entry) => sum + (entry.totalSubmissions || 0), 0);
    const weightedScore = analytics.reduce((sum, entry) => sum + ((entry.averageScore || 0) * (entry.totalSubmissions || 0)), 0);
    return {
      total: exams.length,
      live: exams.filter((exam) => exam.effective_status === 'live').length,
      scheduled: exams.filter((exam) => exam.effective_status === 'scheduled').length,
      completed: exams.filter((exam) => exam.effective_status === 'completed').length,
      questions: questions.length,
      pyqs: pyqs.length,
      submissions,
      averageScore: submissions ? weightedScore / submissions : 0,
    };
  }, [analyticsByExam, exams, pyqs.length, questions.length]);

  const enrichedExams = useMemo(() => exams.map((exam) => {
    const analytics = analyticsByExam[exam._id];
    return {
      ...exam,
      analytics,
      submissionCount: analytics?.totalSubmissions || 0,
      averageScore: analytics?.averageScore || 0,
    };
  }), [analyticsByExam, exams]);

  const topExams = useMemo(
    () => enrichedExams
      .filter((exam) => exam.submissionCount > 0)
      .sort((a, b) => b.submissionCount - a.submissionCount || b.averageScore - a.averageScore)
      .slice(0, 4),
    [enrichedExams],
  );

  const recentSubmissions = useMemo(() => Object.entries(analyticsByExam)
    .flatMap(([examId, analytics]) => {
      const exam = exams.find((item) => item._id === examId);
      return (analytics?.scores || []).map((submission) => ({
        ...submission,
        examTitle: exam?.title || 'Exam',
      }));
    })
    .sort((a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0))
    .slice(0, 5), [analyticsByExam, exams]);

  const topicMix = useMemo(() => questions.reduce((acc, question) => {
    acc[question.topic] = (acc[question.topic] || 0) + 1;
    return acc;
  }, {}), [questions]);

  const updateStatus = async (examId, payload) => {
    await api.put(`/exams/teacher/${examId}/status`, payload);
    await fetchExams();
  };

  const deleteExam = async (examId) => {
    if (!window.confirm('Delete this exam and its submissions?')) return;
    await api.delete(`/exams/teacher/${examId}`);
    setExams((current) => current.filter((exam) => exam._id !== examId));
  };

  const saveSchedule = async (examId, start_time, end_time) => {
    await updateStatus(examId, { status: 'scheduled', start_time, end_time });
    setSelectedExam(null);
  };

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Teacher dashboard"
        title="Exam operations"
        description="Create, schedule, monitor, and close aptitude assessments from one workspace."
        actions={(
          <Link to="/teacher/exams/create" className="btn-primary">
            <FilePlus2 className="h-4 w-4" />
            Create exam
          </Link>
        )}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Total exams</p><p className="mt-2 text-3xl font-extrabold">{stats.total}</p></div>
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Live</p><p className="mt-2 text-3xl font-extrabold text-emerald-700">{stats.live}</p></div>
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Scheduled</p><p className="mt-2 text-3xl font-extrabold text-amber-700">{stats.scheduled}</p></div>
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Completed</p><p className="mt-2 text-3xl font-extrabold text-sky-700">{stats.completed}</p></div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="metric"><FileQuestion className="h-5 w-5 text-sky-700" /><p className="mt-3 text-sm font-semibold text-slate-500">Question bank</p><p className="mt-2 text-3xl font-extrabold">{stats.questions}</p></div>
        <div className="metric"><Users className="h-5 w-5 text-teal-700" /><p className="mt-3 text-sm font-semibold text-slate-500">Submissions</p><p className="mt-2 text-3xl font-extrabold">{stats.submissions}</p></div>
        <div className="metric"><Trophy className="h-5 w-5 text-amber-700" /><p className="mt-3 text-sm font-semibold text-slate-500">Average score</p><p className="mt-2 text-3xl font-extrabold">{percent(stats.averageScore)}</p></div>
        <div className="metric"><BookOpen className="h-5 w-5 text-indigo-700" /><p className="mt-3 text-sm font-semibold text-slate-500">PYQ sets</p><p className="mt-2 text-3xl font-extrabold">{stats.pyqs}</p></div>
      </section>

      {loading ? (
        <div className="panel text-sm font-semibold text-slate-500">Loading exams...</div>
      ) : exams.length === 0 ? (
        <EmptyState
          title="No exams yet"
          description="Start by creating an exam from bank questions, custom questions, or Gemini-assisted generation."
          action={<Link to="/teacher/exams/create" className="btn-primary">Create first exam</Link>}
        />
      ) : (
        <>
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950"><Activity className="h-5 w-5 text-teal-700" /> Recent submissions</h2>
              <Link className="text-sm font-bold text-teal-700 hover:text-teal-900" to="/teacher/analytics">Open analytics</Link>
            </div>
            {recentSubmissions.length === 0 ? (
              <p className="rounded-md bg-slate-100 p-4 text-sm font-semibold text-slate-500">No submissions yet.</p>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-950">{submission.studentName}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">{submission.examTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-teal-700">{submission.score} / {submission.total}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(submission.submitted_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-950"><FileQuestion className="h-5 w-5 text-sky-700" /> Question coverage</h2>
            {Object.keys(topicMix).length === 0 ? (
              <p className="rounded-md bg-slate-100 p-4 text-sm font-semibold text-slate-500">No bank questions yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(topicMix).sort((a, b) => b[1] - a[1]).map(([topic, count]) => (
                  <div key={topic}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700">{topic}</span>
                      <span className="font-extrabold text-slate-950">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-teal-600" style={{ width: `${Math.max(8, (count / Math.max(stats.questions, 1)) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          {topExams.map((exam) => (
            <Link key={exam._id} to={`/teacher/exams/${exam._id}/results`} className="metric transition hover:-translate-y-0.5 hover:border-teal-300">
              <p className="line-clamp-2 text-sm font-extrabold text-slate-950">{exam.title}</p>
              <p className="mt-3 text-3xl font-extrabold text-teal-700">{exam.submissionCount}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">submissions / avg {percent(exam.averageScore)}</p>
            </Link>
          ))}
        </section>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Questions</th>
                  <th className="px-4 py-3">Submissions</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {exams.map((exam) => {
                  const status = exam.effective_status || exam.status;
                  return (
                    <tr key={exam._id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">{exam.title}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{exam.description || 'No description'}</p>
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={status} /></td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{examQuestionCount(exam)}</td>
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-slate-950">{analyticsByExam[exam._id]?.totalSubmissions || 0}</p>
                        <p className="mt-1 text-xs text-slate-500">avg {percent(analyticsByExam[exam._id]?.averageScore || 0)}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        <p>Start: {formatDateTime(exam.start_time)}</p>
                        <p>End: {formatDateTime(exam.end_time)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          {(status === 'draft' || status === 'scheduled') && (
                            <>
                              <button type="button" className="btn-secondary px-3" onClick={() => updateStatus(exam._id, { status: 'live', start_time: new Date().toISOString() })}>
                                <Play className="h-4 w-4" /> Live
                              </button>
                              <button type="button" className="btn-secondary px-3" onClick={() => setSelectedExam(exam)}>
                                <CalendarClock className="h-4 w-4" /> Schedule
                              </button>
                            </>
                          )}
                          {status === 'live' && (
                            <>
                              <Link className="btn-secondary px-3" to={`/teacher/exams/${exam._id}/monitor`}><Users className="h-4 w-4" /> Monitor</Link>
                              <button type="button" className="btn-secondary px-3" onClick={() => updateStatus(exam._id, { status: 'completed', end_time: new Date().toISOString() })}>
                                <Square className="h-4 w-4" /> End
                              </button>
                            </>
                          )}
                          {status === 'completed' && <Link className="btn-secondary px-3" to={`/teacher/exams/${exam._id}/results`}><BarChart3 className="h-4 w-4" /> Results</Link>}
                          <Link className="btn-secondary px-3" to={`/teacher/exams/${exam._id}/edit`}>Edit</Link>
                          <button type="button" className="btn-danger px-3" onClick={() => deleteExam(exam._id)}><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {selectedExam && <ScheduleModal exam={selectedExam} onClose={() => setSelectedExam(null)} onSave={saveSchedule} />}
    </div>
  );
}

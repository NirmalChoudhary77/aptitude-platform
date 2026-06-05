import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../../components/PageHeader';
import api from '../../api/client';
import { percent } from '../../utils/formatters';

export default function ExamAnalytics() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadExams = async () => {
      const { data } = await api.get('/exams/teacher');
      setExams(data);
      if (data[0]?._id) setSelectedExamId(data[0]._id);
    };
    loadExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) {
      setAnalytics(null);
      return;
    }
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/exams/teacher/${selectedExamId}/analytics`);
        setAnalytics(data);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [selectedExamId]);

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Teacher analytics"
        title="Exam analytics"
        description="Compare score distribution and question-level correctness for each exam."
      />

      <div className="panel max-w-md">
        <label className="label" htmlFor="exam-select">Select exam</label>
        <select id="exam-select" className="input" value={selectedExamId} onChange={(event) => setSelectedExamId(event.target.value)}>
          <option value="">Choose an exam</option>
          {exams.map((exam) => <option key={exam._id} value={exam._id}>{exam.title}</option>)}
        </select>
      </div>

      {loading && <div className="panel text-sm font-semibold text-slate-500">Loading analytics...</div>}

      {analytics && !loading && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="metric"><p className="text-sm font-semibold text-slate-500">Submissions</p><p className="mt-2 text-3xl font-extrabold">{analytics.totalSubmissions}</p></div>
            <div className="metric"><p className="text-sm font-semibold text-slate-500">Average</p><p className="mt-2 text-3xl font-extrabold text-teal-700">{percent(analytics.averageScore)}</p></div>
            <div className="metric"><p className="text-sm font-semibold text-slate-500">Questions</p><p className="mt-2 text-3xl font-extrabold">{analytics.question_performance?.length || 0}</p></div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="panel h-96">
              <h2 className="mb-4 text-lg font-extrabold text-slate-950">Score distribution</h2>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={analytics.score_distribution}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="surface overflow-hidden">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="font-extrabold text-slate-950">Question performance</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="table-head sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Question</th>
                      <th className="px-4 py-3">Correct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {analytics.question_performance?.map((question) => (
                      <tr key={question.question_id}>
                        <td className="px-4 py-3 font-semibold text-slate-950">{question.question_text}</td>
                        <td className="px-4 py-3 font-bold text-teal-700">{question.correct_answers} / {analytics.totalSubmissions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

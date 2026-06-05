import { RefreshCw, Square, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/client';
import { percent } from '../../utils/formatters';

export default function MonitorExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [examRes, analyticsRes] = await Promise.all([
        api.get(`/exams/teacher/${id}`),
        api.get(`/exams/teacher/${id}/analytics`),
      ]);
      setExam(examRes.data);
      setAnalytics(analyticsRes.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    const interval = window.setInterval(fetchData, 10000);
    return () => window.clearInterval(interval);
  }, [fetchData]);

  const endExam = async () => {
    await api.put(`/exams/teacher/${id}/status`, { status: 'completed', end_time: new Date().toISOString() });
    navigate('/teacher');
  };

  if (loading) return <div className="panel text-sm font-semibold text-slate-500">Loading live monitor...</div>;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Live monitor"
        title={exam?.title || 'Exam'}
        description="Submissions refresh every 10 seconds while the exam is active."
        actions={(
          <>
            <button type="button" className="btn-secondary" onClick={fetchData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button type="button" className="btn-danger" onClick={endExam}>
              <Square className="h-4 w-4" />
              End exam
            </button>
          </>
        )}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric"><Users className="h-5 w-5 text-sky-700" /><p className="mt-3 text-sm font-semibold text-slate-500">Submissions</p><p className="text-3xl font-extrabold">{analytics?.totalSubmissions || 0}</p></div>
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Average score</p><p className="mt-2 text-3xl font-extrabold text-teal-700">{percent(analytics?.averageScore || 0)}</p></div>
        <div className="metric"><p className="text-sm font-semibold text-slate-500">Status</p><div className="mt-3"><StatusBadge status={exam?.effective_status || exam?.status} /></div></div>
      </section>

      <div className="surface overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-extrabold text-slate-950">Recent submissions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(analytics?.scores || []).map((submission) => (
                <tr key={submission.id}>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-950">{submission.studentName}</p>
                    <p className="text-xs text-slate-500">{submission.email}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">{submission.score} / {submission.total}</td>
                  <td className="px-4 py-3">
                    <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-teal-600" style={{ width: `${submission.percentage}%` }} /></div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(submission.submitted_at).toLocaleString()}</td>
                </tr>
              ))}
              {(analytics?.scores || []).length === 0 && (
                <tr><td colSpan="4" className="px-4 py-10 text-center font-semibold text-slate-500">Waiting for submissions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

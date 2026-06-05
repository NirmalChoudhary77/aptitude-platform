import { BookOpen, CheckCircle2, Home, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import api from '../../api/client';
import { percent } from '../../utils/formatters';

export default function ExamSummary() {
  const { id } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/exams/student/${id}/summary`);
        setSummary(data);
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Could not load summary.');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [id]);

  if (loading) return <div className="panel text-sm font-semibold text-slate-500">Calculating results...</div>;
  if (error) return <div className="panel text-sm font-semibold text-red-700">{error}</div>;

  return (
    <div className="page-shell">
      <PageHeader eyebrow="Attempt summary" title={summary.exam_title} description="Review your score breakdown and open detailed solutions." />
      <section className="grid gap-4 md:grid-cols-4">
        <div className="metric md:col-span-2"><p className="text-sm font-semibold text-slate-500">Score</p><p className="mt-2 text-5xl font-extrabold text-slate-950">{summary.score} / {summary.total_questions}</p><p className="mt-2 text-lg font-bold text-teal-700">{percent(summary.percentage)}</p></div>
        <div className="metric"><CheckCircle2 className="h-5 w-5 text-teal-700" /><p className="mt-3 text-sm font-semibold text-slate-500">Correct</p><p className="text-3xl font-extrabold">{summary.correct}</p></div>
        <div className="metric"><XCircle className="h-5 w-5 text-red-700" /><p className="mt-3 text-sm font-semibold text-slate-500">Incorrect</p><p className="text-3xl font-extrabold">{summary.incorrect}</p></div>
      </section>
      <div className="flex flex-wrap justify-end gap-2">
        <Link to="/student" className="btn-secondary"><Home className="h-4 w-4" /> Dashboard</Link>
        <Link to={`/student/exam/${id}/solutions`} className="btn-primary"><BookOpen className="h-4 w-4" /> View solutions</Link>
      </div>
    </div>
  );
}

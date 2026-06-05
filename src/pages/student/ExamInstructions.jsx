import { ArrowRight, Clock, FileQuestion, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import api from '../../api/client';

export default function ExamInstructions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadExam = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/exams/student/${id}/attempt`);
        setExam(data);
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Could not load exam instructions.');
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [id]);

  if (loading) return <div className="panel text-sm font-semibold text-slate-500">Loading instructions...</div>;
  if (error) return <div className="panel text-sm font-semibold text-red-700">{error}</div>;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Exam instructions"
        title={exam.title}
        description={exam.description || 'Read the exam details before starting your attempt.'}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric"><Clock className="h-5 w-5 text-teal-700" /><p className="mt-3 text-sm font-semibold text-slate-500">Duration</p><p className="text-2xl font-extrabold">{exam.duration_minutes} min</p></div>
        <div className="metric"><FileQuestion className="h-5 w-5 text-sky-700" /><p className="mt-3 text-sm font-semibold text-slate-500">Questions</p><p className="text-2xl font-extrabold">{exam.questions?.length || 0}</p></div>
        <div className="metric"><ShieldCheck className="h-5 w-5 text-amber-700" /><p className="mt-3 text-sm font-semibold text-slate-500">Attempts</p><p className="text-2xl font-extrabold">One</p></div>
      </section>

      <section className="panel">
        <h2 className="text-lg font-extrabold text-slate-950">Before you begin</h2>
        <ul className="mt-4 space-y-3">
          {(exam.instructions || []).map((instruction) => (
            <li key={instruction} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">{instruction}</li>
          ))}
        </ul>
      </section>

      <div className="flex justify-end">
        <button type="button" className="btn-primary px-8 py-3" onClick={() => navigate(`/student/exam/${id}/attempt`)}>
          Start exam
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import api from '../../api/client';

export default function SolutionsPage() {
  const { id } = useParams();
  const [solutions, setSolutions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSolutions = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/exams/student/${id}/solutions`);
        setSolutions(data);
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Could not load solutions.');
      } finally {
        setLoading(false);
      }
    };
    loadSolutions();
  }, [id]);

  if (loading) return <div className="panel text-sm font-semibold text-slate-500">Loading solutions...</div>;
  if (error) return <div className="panel text-sm font-semibold text-red-700">{error}</div>;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Detailed solutions"
        title={solutions.exam_title}
        description={`Score: ${solutions.score} / ${solutions.total_questions}`}
      />

      <div className="space-y-4">
        {solutions.answers.map((answer, index) => {
          const question = answer.question;
          return (
            <article key={answer.question_id || index} className="panel">
              <div className="flex items-start gap-3">
                {answer.is_correct ? <CheckCircle2 className="mt-1 h-5 w-5 text-teal-700" /> : <XCircle className="mt-1 h-5 w-5 text-red-700" />}
                <div className="flex-1">
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Question {index + 1}</p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-950">{question?.text}</h2>
                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {question?.options?.map((option) => {
                      const correct = option === question.correct_option;
                      const selected = option === answer.selected_option;
                      return (
                        <div key={option} className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                          correct ? 'border-teal-300 bg-teal-50 text-teal-900' : selected ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}>
                          {option}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-sm text-slate-600"><span className="font-bold">Your answer:</span> {answer.selected_option || 'Unanswered'}</p>
                  <p className="mt-1 text-sm text-slate-600"><span className="font-bold">Correct answer:</span> {question?.correct_option}</p>
                  {question?.explanation && <p className="mt-3 rounded-md bg-slate-100 p-3 text-sm text-slate-700">{question.explanation}</p>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

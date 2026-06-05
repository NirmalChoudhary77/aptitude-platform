import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import api from '../../api/client';
import { percent } from '../../utils/formatters';

export default function ResultPage() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/exams/teacher/${id}/results`);
        setResults(data);
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [id]);

  if (loading) return <div className="panel text-sm font-semibold text-slate-500">Loading results...</div>;
  if (!results) return <div className="panel text-sm font-semibold text-red-700">No results found.</div>;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Ranked results"
        title={results.exam_title}
        description="Student submissions ranked by score and submission time."
      />

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {results.results.map((student) => (
                <tr key={student.submission_id}>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-2 font-extrabold text-slate-950">
                      {student.rank <= 3 && <Trophy className="h-4 w-4 text-amber-600" />}
                      #{student.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-950">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.email}</p>
                  </td>
                  <td className="px-4 py-4 font-bold">{student.score} / {student.total}</td>
                  <td className="px-4 py-4 font-bold text-teal-700">{percent(student.percentage)}</td>
                </tr>
              ))}
              {results.results.length === 0 && (
                <tr><td colSpan="4" className="px-4 py-10 text-center font-semibold text-slate-500">No submissions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

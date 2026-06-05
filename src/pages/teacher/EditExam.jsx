import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import ExamBuilder from '../../components/ExamBuilder';
import api from '../../api/client';

export default function EditExam() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExam = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/exams/teacher/${id}`);
        setExam(data);
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [id]);

  if (loading) return <div className="panel text-sm font-semibold text-slate-500">Loading exam...</div>;
  if (!exam) return <div className="panel text-sm font-semibold text-red-700">Exam not found.</div>;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Exam builder"
        title="Edit exam"
        description="Update details and question composition before publishing or scheduling."
      />
      <ExamBuilder mode="edit" initialExam={exam} />
    </div>
  );
}

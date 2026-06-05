import PageHeader from '../../components/PageHeader';
import ExamBuilder from '../../components/ExamBuilder';

export default function CreateExam() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Exam builder"
        title="Create exam"
        description="Build an assessment from bank questions, custom questions, or a Gemini-generated set."
      />
      <ExamBuilder mode="create" />
    </div>
  );
}

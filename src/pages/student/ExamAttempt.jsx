import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import useExamStore from '../../store/examStore';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.max(0, seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

export default function ExamAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { draftAnswers, setDraftAnswer, clearDraft } = useExamStore();
  const [exam, setExam] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const answers = useMemo(() => draftAnswers[id] || {}, [draftAnswers, id]);

  useEffect(() => {
    const loadExam = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/exams/student/${id}/attempt`);
        setExam(data);
        setTimeLeft(data.duration_minutes * 60);
      } catch (error) {
        window.alert(error.response?.data?.error || 'Could not open exam.');
        navigate('/student', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [id, navigate]);

  const questions = exam?.questions || [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const submitExam = useCallback(async (force = false) => {
    if (submitting || questions.length === 0) return;
    const unanswered = questions.length - answeredCount;
    if (!force && unanswered > 0 && !window.confirm(`Submit with ${unanswered} unanswered question(s)?`)) return;

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([question_id, selected_option]) => ({ question_id, selected_option }));
      await api.post(`/exams/student/${id}/submit`, { answers: formattedAnswers });
      clearDraft(id);
      navigate(`/student/exam/${id}/summary`, { replace: true });
    } catch (error) {
      window.alert(error.response?.data?.error || 'Submission failed.');
      setSubmitting(false);
    }
  }, [answeredCount, answers, clearDraft, id, navigate, questions.length, submitting]);

  useEffect(() => {
    if (timeLeft === null || submitting) return undefined;
    if (timeLeft <= 0) {
      submitExam(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [submitExam, submitting, timeLeft]);

  const progress = useMemo(() => questions.length ? (answeredCount / questions.length) * 100 : 0, [answeredCount, questions.length]);

  if (loading) return <div className="panel text-sm font-semibold text-slate-500">Loading exam...</div>;
  if (!currentQuestion) return <div className="panel text-sm font-semibold text-red-700">No questions available.</div>;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_20rem]">
      <section className="surface overflow-hidden">
        <div className="h-1 bg-slate-100"><div className="h-full bg-teal-600" style={{ width: `${progress}%` }} /></div>
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Question {currentIndex + 1} of {questions.length}</p>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-950">{exam.title}</h1>
            </div>
            <div className={`flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-lg font-extrabold ${timeLeft < 300 ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-950'}`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft || 0)}
            </div>
          </div>

          <div className="py-8">
            <p className="text-xl font-bold leading-relaxed text-slate-950">{currentQuestion.text}</p>
            <div className="mt-8 space-y-3">
              {currentQuestion.options.map((option, index) => {
                const selected = answers[currentQuestion._id] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDraftAnswer(id, currentQuestion._id, option)}
                    className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition ${
                      selected ? 'border-teal-600 bg-teal-50 text-teal-950' : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <span className={`grid h-8 w-8 place-items-center rounded-md text-sm font-extrabold ${selected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 font-semibold">{option}</span>
                    {selected && <CheckCircle2 className="h-5 w-5 text-teal-700" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4">
          <button type="button" className="btn-secondary" disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button type="button" className="btn-secondary" disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))}>
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="panel">
          <p className="text-sm font-semibold text-slate-500">Answered</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-950">{answeredCount} / {questions.length}</p>
        </div>
        <div className="panel">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => (
              <button
                key={question._id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`aspect-square rounded-md text-sm font-extrabold ${
                  index === currentIndex ? 'bg-slate-950 text-white' : answers[question._id] ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="btn-primary w-full py-3" onClick={() => submitExam(false)} disabled={submitting}>
          <Send className="h-4 w-4" />
          {submitting ? 'Submitting...' : 'Submit exam'}
        </button>
      </aside>
    </div>
  );
}

import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Send, ShieldAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [sessionId, setSessionId] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const submittingRef = useRef(false);
  const violationRef = useRef(0);
  const sessionRef = useRef('');
  const autoSubmittingRef = useRef(false);
  const answers = useMemo(() => draftAnswers[id] || {}, [draftAnswers, id]);

  useEffect(() => {
    const loadExam = async () => {
      setLoading(true);
      try {
        const { data } = await api.post(`/exams/student/${id}/start`);
        setExam(data.exam);
        setSessionId(data.session_id);
        sessionRef.current = data.session_id;
        setTimeLeft(data.exam.duration_minutes * 60);
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
  const integrity = exam?.integrity || {};

  const submitExam = useCallback(async (force = false, autoSubmitReason = '') => {
    if (submittingRef.current || questions.length === 0) return;
    const unanswered = questions.length - answeredCount;
    if (!force && unanswered > 0 && !window.confirm(`Submit with ${unanswered} unanswered question(s)?`)) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([question_id, selected_option]) => ({ question_id, selected_option }));
      await api.post(`/exams/student/${id}/submit`, {
        answers: formattedAnswers,
        session_id: sessionRef.current || sessionId,
        auto_submit_reason: autoSubmitReason,
      });
      clearDraft(id);
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
      navigate(`/student/exam/${id}/summary`, { replace: true });
    } catch (error) {
      window.alert(error.response?.data?.error || 'Submission failed.');
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [answeredCount, answers, clearDraft, id, navigate, questions.length, sessionId]);

  const logEvent = useCallback(async ({ type, severity = 'info', message = '', metadata = {} }) => {
    if (!sessionRef.current) return null;
    try {
      const { data } = await api.post(`/exams/student/${id}/activity`, {
        session_id: sessionRef.current,
        type,
        severity,
        message,
        metadata,
      });
      return data;
    } catch {
      return null;
    }
  }, [id]);

  const recordViolation = useCallback(async (type, message, metadata = {}) => {
    if (submittingRef.current || autoSubmittingRef.current) return;
    const nextCount = violationRef.current + 1;
    violationRef.current = nextCount;
    setViolationCount(nextCount);
    await logEvent({ type, severity: 'critical', message, metadata });

    const limit = Number(integrity.auto_submit_violation_limit || 3);
    if (nextCount >= limit) {
      autoSubmittingRef.current = true;
      await submitExam(true, `Auto-submitted after ${nextCount} integrity violation(s). Last event: ${message}`);
    }
  }, [integrity.auto_submit_violation_limit, logEvent, submitExam]);

  useEffect(() => {
    if (timeLeft === null || submitting) return undefined;
    if (timeLeft <= 0) {
      submitExam(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [submitExam, submitting, timeLeft]);

  useEffect(() => {
    if (!sessionId) return undefined;
    const heartbeat = window.setInterval(() => {
      api.post(`/exams/student/${id}/sessions/${sessionId}/heartbeat`).catch(() => {});
    }, 15000);
    return () => window.clearInterval(heartbeat);
  }, [id, sessionId]);

  useEffect(() => {
    if (!exam || !sessionId) return undefined;

    const handleVisibility = () => {
      if (document.hidden) {
        recordViolation('tab_switch', 'Student switched away from the exam tab.');
      }
    };

    const handleBlur = () => {
      recordViolation('window_blur', 'Exam window lost focus.');
    };

    const handleFullscreen = () => {
      if (integrity.fullscreen_required && !document.fullscreenElement) {
        recordViolation('fullscreen_exit', 'Student exited full-screen mode.');
      }
    };

    const blockInteraction = (event) => {
      if (!integrity.block_copy_paste) return;
      event.preventDefault();
      recordViolation(event.type, `Blocked ${event.type} during exam.`);
    };

    const blockKeys = (event) => {
      const key = event.key.toLowerCase();
      const devToolsCombo = event.key === 'F12'
        || (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key))
        || (event.ctrlKey && ['u', 's', 'p'].includes(key));
      if (devToolsCombo) {
        event.preventDefault();
        recordViolation('restricted_shortcut', 'Blocked restricted browser shortcut.', { key: event.key });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreen);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', blockInteraction);
    document.addEventListener('cut', blockInteraction);
    document.addEventListener('paste', blockInteraction);
    document.addEventListener('contextmenu', blockInteraction);
    document.addEventListener('keydown', blockKeys);

    if (integrity.fullscreen_required && document.fullscreenEnabled && !document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => logEvent({ type: 'fullscreen_entered', message: 'Student entered full-screen mode.' }))
        .catch(() => recordViolation('fullscreen_blocked', 'Browser blocked full-screen entry.'));
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreen);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', blockInteraction);
      document.removeEventListener('cut', blockInteraction);
      document.removeEventListener('paste', blockInteraction);
      document.removeEventListener('contextmenu', blockInteraction);
      document.removeEventListener('keydown', blockKeys);
    };
  }, [exam, id, integrity.block_copy_paste, integrity.fullscreen_required, logEvent, recordViolation, sessionId]);

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
        <div className={`panel ${violationCount > 0 ? 'border-red-200 bg-red-50' : ''}`}>
          <div className="flex items-center gap-2">
            {violationCount > 0 ? <ShieldAlert className="h-5 w-5 text-red-700" /> : <CheckCircle2 className="h-5 w-5 text-teal-700" />}
            <p className="text-sm font-semibold text-slate-500">Integrity</p>
          </div>
          <p className={`mt-2 text-3xl font-extrabold ${violationCount > 0 ? 'text-red-700' : 'text-slate-950'}`}>
            {violationCount} / {integrity.auto_submit_violation_limit || 3}
          </p>
          {violationCount > 0 && (
            <p className="mt-2 flex gap-2 text-xs font-semibold text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Auto-submit triggers at the limit.
            </p>
          )}
        </div>
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

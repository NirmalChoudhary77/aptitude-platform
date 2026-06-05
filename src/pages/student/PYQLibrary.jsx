import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

const emptyPyq = {
  title: '',
  year: new Date().getFullYear(),
  exam_type: '',
  topic: 'General',
  description: '',
  questions: [],
};

export default function PYQLibrary() {
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'teacher';
  const [pyqs, setPyqs] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyPyq);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPyqs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pyq');
      setPyqs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPyqs();
  }, []);

  useEffect(() => {
    if (!isTeacher) return;
    const loadQuestions = async () => {
      const { data } = await api.get('/questions');
      setQuestions(data);
    };
    loadQuestions();
  }, [isTeacher]);

  const filtered = useMemo(() => pyqs.filter((pyq) => {
    const query = search.toLowerCase();
    return pyq.title.toLowerCase().includes(query)
      || pyq.topic.toLowerCase().includes(query)
      || pyq.exam_type.toLowerCase().includes(query)
      || String(pyq.year).includes(query);
  }), [pyqs, search]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const toggleQuestion = (id) => setForm((current) => ({
    ...current,
    questions: current.questions.includes(id)
      ? current.questions.filter((questionId) => questionId !== id)
      : [...current.questions, id],
  }));

  const savePyq = async (event) => {
    event.preventDefault();
    await api.post('/pyq', form);
    setForm(emptyPyq);
    setShowForm(false);
    await loadPyqs();
  };

  const deletePyq = async (id) => {
    if (!window.confirm('Delete this PYQ set?')) return;
    await api.delete(`/pyq/${id}`);
    setPyqs((current) => current.filter((pyq) => pyq._id !== id));
  };

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={isTeacher ? 'Teacher workspace' : 'Student library'}
        title="PYQ library"
        description="Browse previous-year question sets by exam, topic, and year."
        actions={isTeacher && (
          <button type="button" className="btn-primary" onClick={() => setShowForm((value) => !value)}>
            <Plus className="h-4 w-4" />
            Add PYQ set
          </button>
        )}
      />

      {isTeacher && showForm && (
        <form onSubmit={savePyq} className="panel space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <input className="input md:col-span-2" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Set title" required />
            <input className="input" type="number" value={form.year} onChange={(event) => update('year', Number(event.target.value))} required />
            <input className="input" value={form.exam_type} onChange={(event) => update('exam_type', event.target.value)} placeholder="Exam type" required />
          </div>
          <input className="input" value={form.topic} onChange={(event) => update('topic', event.target.value)} placeholder="Topic" />
          <textarea className="input min-h-20" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Description" />
          <div className="max-h-64 overflow-y-auto rounded-md border border-slate-200">
            {questions.map((question) => (
              <label key={question._id} className="flex gap-3 border-b border-slate-100 p-3 text-sm last:border-b-0">
                <input type="checkbox" checked={form.questions.includes(question._id)} onChange={() => toggleQuestion(question._id)} />
                <span>
                  <span className="font-semibold text-slate-950">{question.text}</span>
                  <span className="mt-1 block text-xs text-slate-500">{question.topic} / {question.difficulty}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save PYQ set</button>
          </div>
        </form>
      )}

      <div className="panel">
        <label className="label" htmlFor="pyq-search">Search library</label>
        <input id="pyq-search" className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, topic, exam type, or year" />
      </div>

      {loading ? (
        <div className="panel text-sm font-semibold text-slate-500">Loading PYQ library...</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No PYQ sets found" description={isTeacher ? 'Create the first previous-year set from question bank items.' : 'No previous-year sets are available yet.'} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((pyq) => (
            <article key={pyq._id} className="panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{pyq.exam_type} / {pyq.year}</p>
                  <h2 className="mt-1 text-xl font-extrabold text-slate-950">{pyq.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">{pyq.description || 'No description'}</p>
                </div>
                {isTeacher && <button type="button" className="btn-danger px-3" onClick={() => deletePyq(pyq._id)}><Trash2 className="h-4 w-4" /></button>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-700">{pyq.topic}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{pyq.questions?.length || 0} questions</span>
              </div>
              <div className="mt-4 space-y-2">
                {(pyq.questions || []).slice(0, 5).map((question, index) => (
                  <p key={question._id} className="rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">{index + 1}. {question.text}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

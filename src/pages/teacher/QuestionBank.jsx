import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import api from '../../api/client';

const emptyQuestion = {
  topic: '',
  subtopic: 'General',
  difficulty: 'Medium',
  text: '',
  options: ['', '', '', ''],
  correct_option: '',
  explanation: '',
};

function QuestionForm({ initialQuestion, onCancel, onSave }) {
  const [question, setQuestion] = useState(initialQuestion || emptyQuestion);
  const [generating, setGenerating] = useState(false);

  const update = (field, value) => setQuestion((current) => ({ ...current, [field]: value }));
  const updateOption = (index, value) => {
    const options = [...question.options];
    options[index] = value;
    setQuestion((current) => ({ ...current, options }));
  };

  const generate = async () => {
    if (!question.topic) return;
    setGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-question', {
        topic: question.topic,
        subtopic: question.subtopic,
        difficulty: question.difficulty,
      });
      setQuestion(data);
    } finally {
      setGenerating(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    onSave(question);
  };

  return (
    <form onSubmit={submit} className="panel space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="label" htmlFor="topic">Topic</label>
          <input id="topic" className="input" value={question.topic} onChange={(event) => update('topic', event.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="subtopic">Subtopic</label>
          <input id="subtopic" className="input" value={question.subtopic} onChange={(event) => update('subtopic', event.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="difficulty">Difficulty</label>
          <select id="difficulty" className="input" value={question.difficulty} onChange={(event) => update('difficulty', event.target.value)}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="text">Question</label>
        <textarea id="text" className="input min-h-24" value={question.text} onChange={(event) => update('text', event.target.value)} required />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {question.options.map((option, index) => (
          <label key={index} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
            <input type="radio" name="correct_option" checked={question.correct_option === option && option !== ''} onChange={() => update('correct_option', option)} />
            <input className="w-full bg-transparent text-sm outline-none" value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Option ${index + 1}`} required />
          </label>
        ))}
      </div>

      <div>
        <label className="label" htmlFor="explanation">Explanation</label>
        <textarea id="explanation" className="input min-h-20" value={question.explanation} onChange={(event) => update('explanation', event.target.value)} />
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" className="btn-secondary" onClick={generate} disabled={!question.topic || generating}>
          <Sparkles className="h-4 w-4" />
          {generating ? 'Generating...' : 'Generate with Gemini'}
        </button>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary">Save question</button>
        </div>
      </div>
    </form>
  );
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/questions');
      setQuestions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filtered = useMemo(() => questions.filter((question) => {
    const query = search.toLowerCase();
    return question.text.toLowerCase().includes(query)
      || question.topic.toLowerCase().includes(query)
      || question.subtopic.toLowerCase().includes(query);
  }), [questions, search]);

  const saveQuestion = async (question) => {
    if (question._id) {
      const { data } = await api.put(`/questions/${question._id}`, question);
      setQuestions((current) => current.map((item) => (item._id === data._id ? data : item)));
    } else {
      const { data } = await api.post('/questions', question);
      setQuestions((current) => [data, ...current]);
    }
    setEditing(null);
    setShowForm(false);
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    await api.delete(`/questions/${id}`);
    setQuestions((current) => current.filter((question) => question._id !== id));
  };

  const activeForm = showForm || editing;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Teacher workspace"
        title="Question bank"
        description="Create reusable questions for exams and PYQ sets. Gemini generation stays server-side."
        actions={(
          <button type="button" className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="h-4 w-4" />
            Add question
          </button>
        )}
      />

      {activeForm && (
        <QuestionForm
          initialQuestion={editing || emptyQuestion}
          onCancel={() => { setEditing(null); setShowForm(false); }}
          onSave={saveQuestion}
        />
      )}

      <div className="panel">
        <label className="label" htmlFor="question-search">Search bank</label>
        <input id="question-search" className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by topic, subtopic, or question text" />
      </div>

      {loading ? (
        <div className="panel text-sm font-semibold text-slate-500">Loading questions...</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No questions found" description="Add a question or adjust the search filter." />
      ) : (
        <div className="surface divide-y divide-slate-200">
          {filtered.map((question) => (
            <div key={question._id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-semibold leading-relaxed text-slate-950">{question.text}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{question.topic}</span>
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-700">{question.subtopic}</span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">{question.difficulty}</span>
                </div>
              </div>
              <div className="flex items-start justify-end gap-2">
                <button type="button" className="btn-secondary px-3" onClick={() => { setEditing(question); setShowForm(false); }}>Edit</button>
                <button type="button" className="btn-danger px-3" onClick={() => deleteQuestion(question._id)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

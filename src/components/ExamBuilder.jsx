import { Plus, Save, Search, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const emptyCustomQuestion = {
  topic: '',
  subtopic: 'General',
  difficulty: 'Medium',
  text: '',
  options: ['', '', '', ''],
  correct_option: '',
  explanation: '',
};

function QuestionEditor({ onAdd, onSaveToBank, onClose }) {
  const [question, setQuestion] = useState(emptyCustomQuestion);
  const [generating, setGenerating] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

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
      const { data } = await api.post('/ai/generate-question', question);
      setQuestion(data);
    } finally {
      setGenerating(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    onAdd({ ...question, _id: `local-${Date.now()}`, isNew: true });
  };

  const saveToBank = async () => {
    setSavingBank(true);
    try {
      await onSaveToBank(question);
      setQuestion(emptyCustomQuestion);
    } finally {
      setSavingBank(false);
    }
  };

  return (
    <form onSubmit={submit} className="panel space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <input className="input" value={question.topic} onChange={(event) => update('topic', event.target.value)} placeholder="Topic" required />
        <input className="input" value={question.subtopic} onChange={(event) => update('subtopic', event.target.value)} placeholder="Subtopic" required />
        <select className="input" value={question.difficulty} onChange={(event) => update('difficulty', event.target.value)}>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>
      <textarea className="input min-h-24" value={question.text} onChange={(event) => update('text', event.target.value)} placeholder="Question text" required />
      <div className="grid gap-3 md:grid-cols-2">
        {question.options.map((option, index) => (
          <label key={index} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
            <input type="radio" name="builder-correct" checked={question.correct_option === option && option !== ''} onChange={() => update('correct_option', option)} />
            <input className="w-full bg-transparent text-sm outline-none" value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Option ${index + 1}`} required />
          </label>
        ))}
      </div>
      <textarea className="input min-h-20" value={question.explanation} onChange={(event) => update('explanation', event.target.value)} placeholder="Explanation" />
      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" className="btn-secondary" onClick={generate} disabled={!question.topic || generating}>
          <Sparkles className="h-4 w-4" />
          {generating ? 'Generating...' : 'Gemini assist'}
        </button>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-secondary" onClick={saveToBank} disabled={savingBank || !question.text || !question.correct_option}>
            {savingBank ? 'Saving...' : 'Save to bank'}
          </button>
          <button type="submit" className="btn-primary">Add question</button>
        </div>
      </div>
    </form>
  );
}

function BankPicker({ bankQuestions, selectedIds, onAdd }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => bankQuestions.filter((question) => {
    const query = search.toLowerCase();
    return question.text.toLowerCase().includes(query)
      || question.topic.toLowerCase().includes(query)
      || question.subtopic.toLowerCase().includes(query);
  }), [bankQuestions, search]);

  return (
    <div className="panel">
      <label className="label" htmlFor="bank-search">Add from bank</label>
      <input id="bank-search" className="input mb-4" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions" />
      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {filtered.map((question) => {
          const selected = selectedIds.includes(question._id);
          return (
            <button
              type="button"
              key={question._id}
              onClick={() => !selected && onAdd(question)}
              disabled={selected}
              className={`w-full rounded-md border p-3 text-left text-sm transition ${
                selected ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-slate-200 bg-white hover:border-slate-400'
              }`}
            >
              <p className="font-semibold">{question.text}</p>
              <p className="mt-1 text-xs text-slate-500">{question.topic} / {question.subtopic} / {question.difficulty}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ExamBuilder({ mode, initialExam }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialExam?.title || '');
  const [description, setDescription] = useState(initialExam?.description || '');
  const [duration, setDuration] = useState(initialExam?.duration_minutes || 60);
  const [questions, setQuestions] = useState(initialExam?.questions || []);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [showCustom, setShowCustom] = useState(false);
  const [generatingExam, setGeneratingExam] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiSettings, setAiSettings] = useState({ topic: '', subtopic: 'General', difficulty: 'Medium', num_questions: 5 });
  const [integrity, setIntegrity] = useState({
    fullscreen_required: initialExam?.integrity?.fullscreen_required ?? true,
    randomize_questions: initialExam?.integrity?.randomize_questions ?? true,
    auto_submit_violation_limit: initialExam?.integrity?.auto_submit_violation_limit ?? 3,
    block_copy_paste: initialExam?.integrity?.block_copy_paste ?? true,
    one_active_session: initialExam?.integrity?.one_active_session ?? true,
  });

  useEffect(() => {
    const loadBank = async () => {
      const { data } = await api.get('/questions');
      setBankQuestions(data);
    };
    loadBank();
  }, []);

  const selectedIds = questions.map((question) => question._id);
  const addQuestion = (question) => setQuestions((current) => current.some((item) => item._id === question._id) ? current : [...current, question]);
  const removeQuestion = (id) => setQuestions((current) => current.filter((question) => question._id !== id));
  const updateIntegrity = (field, value) => setIntegrity((current) => ({ ...current, [field]: value }));

  const saveQuestionToBank = async (question) => {
    const { data } = await api.post('/questions', question);
    setBankQuestions((current) => [data, ...current]);
    addQuestion(data);
    setShowCustom(false);
  };

  const generateExam = async () => {
    if (!aiSettings.topic) return;
    setGeneratingExam(true);
    try {
      const { data } = await api.post('/ai/generate-exam', aiSettings);
      setQuestions(data.map((question, index) => ({ ...question, _id: `ai-${Date.now()}-${index}`, isNew: true })));
    } finally {
      setGeneratingExam(false);
    }
  };

  const saveExam = async (event) => {
    event.preventDefault();
    if (questions.length === 0) return;
    setSaving(true);
    try {
      const newQuestions = questions.filter((question) => question.isNew).map(({ _id, isNew, ...rest }) => rest);
      const existingIds = questions.filter((question) => !question.isNew).map((question) => question._id);
      let createdIds = [];

      if (newQuestions.length > 0) {
        const { data } = await api.post('/questions', newQuestions);
        createdIds = Array.isArray(data) ? data.map((question) => question._id) : [data._id];
      }

      const payload = {
        title,
        description,
        duration_minutes: Number(duration),
        questions: [...existingIds, ...createdIds],
        integrity,
      };

      if (mode === 'edit') {
        await api.put(`/exams/teacher/${initialExam._id}`, payload);
      } else {
        await api.post('/exams/teacher', payload);
      }

      navigate('/teacher');
    } finally {
      setSaving(false);
    }
  };

  const updateAi = (field, value) => setAiSettings((current) => ({ ...current, [field]: value }));

  return (
    <form onSubmit={saveExam} className="space-y-6">
      <section className="panel space-y-4">
        <h2 className="text-lg font-extrabold text-slate-950">Exam details</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_12rem]">
          <div>
            <label className="label" htmlFor="exam-title">Title</label>
            <input id="exam-title" className="input" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="duration">Duration</label>
            <input id="duration" className="input" type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} required />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" className="input min-h-20" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
      </section>

      <section className="panel space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">Exam integrity</h2>
          <p className="mt-1 text-sm text-slate-500">Configure anti-cheat controls for student attempts and live monitoring.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={integrity.fullscreen_required} onChange={(event) => updateIntegrity('fullscreen_required', event.target.checked)} />
            Full-screen required
          </label>
          <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={integrity.randomize_questions} onChange={(event) => updateIntegrity('randomize_questions', event.target.checked)} />
            Randomize questions
          </label>
          <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={integrity.block_copy_paste} onChange={(event) => updateIntegrity('block_copy_paste', event.target.checked)} />
            Block copy/paste
          </label>
          <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={integrity.one_active_session} onChange={(event) => updateIntegrity('one_active_session', event.target.checked)} />
            One active session
          </label>
        </div>
        <div className="max-w-xs">
          <label className="label" htmlFor="violation-limit">Auto-submit after violations</label>
          <input
            id="violation-limit"
            className="input"
            type="number"
            min="1"
            max="10"
            value={integrity.auto_submit_violation_limit}
            onChange={(event) => updateIntegrity('auto_submit_violation_limit', Number(event.target.value))}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <div className="panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-950">Selected questions</h2>
                <p className="text-sm text-slate-500">{questions.length} question(s) in this exam</p>
              </div>
              <button type="button" className="btn-secondary" onClick={() => setShowCustom(true)}>
                <Plus className="h-4 w-4" />
                Custom question
              </button>
            </div>
          </div>

          {showCustom && (
            <QuestionEditor
              onAdd={(question) => { addQuestion(question); setShowCustom(false); }}
              onSaveToBank={saveQuestionToBank}
              onClose={() => setShowCustom(false)}
            />
          )}

          <div className="surface divide-y divide-slate-200">
            {questions.length === 0 ? (
              <div className="p-8 text-center text-sm font-semibold text-slate-500">No questions selected yet.</div>
            ) : questions.map((question, index) => (
              <div key={question._id} className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto]">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-slate-100 text-sm font-extrabold text-slate-600">{index + 1}</span>
                <div>
                  <p className="font-semibold text-slate-950">{question.text}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{question.topic} / {question.subtopic} / {question.difficulty}</p>
                </div>
                <button type="button" className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-700" onClick={() => removeQuestion(question._id)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="panel space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950"><Sparkles className="h-5 w-5" /> Generate exam</h2>
            <input className="input" value={aiSettings.topic} onChange={(event) => updateAi('topic', event.target.value)} placeholder="Topic" />
            <input className="input" value={aiSettings.subtopic} onChange={(event) => updateAi('subtopic', event.target.value)} placeholder="Subtopic" />
            <div className="grid grid-cols-2 gap-2">
              <select className="input" value={aiSettings.difficulty} onChange={(event) => updateAi('difficulty', event.target.value)}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
              <input className="input" type="number" min="1" max="25" value={aiSettings.num_questions} onChange={(event) => updateAi('num_questions', Number(event.target.value))} />
            </div>
            <button type="button" className="btn-primary w-full" onClick={generateExam} disabled={!aiSettings.topic || generatingExam}>
              {generatingExam ? 'Generating...' : 'Generate set'}
            </button>
          </div>

          <BankPicker bankQuestions={bankQuestions} selectedIds={selectedIds} onAdd={addQuestion} />
        </aside>
      </section>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary px-8 py-3" disabled={saving || !title || questions.length === 0}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create exam'}
        </button>
      </div>
    </form>
  );
}

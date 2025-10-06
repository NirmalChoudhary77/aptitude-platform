import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../supabaseClient";

// --- Modal for Generating a Full Exam with AI ---
const AIExamGeneratorModal = ({ onClose, onComplete }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return alert('Please enter a topic.');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, num_questions: numQuestions, difficulty }),
      });
      if (!response.ok) throw new Error('AI request failed');
      const generatedQuestions = await response.json();
      onComplete(generatedQuestions);
    } catch (error) {
      alert("AI failed to generate the exam. Please check if the AI server is running and try again.");
    }
    setIsLoading(false);
  };

  return (
    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 w-full max-w-lg" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h2 className="text-2xl font-bold text-white mb-6">Generate Exam with AI</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-neutral-300 mb-1">Topic</label><input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., World History" className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 text-white" /></div>
          <div><label className="block text-sm font-semibold text-neutral-300 mb-1">Number of Questions</label><input type="number" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 text-white" /></div>
          <div><label className="block text-sm font-semibold text-neutral-300 mb-1">Difficulty</label><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 text-white"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-700">
          <button onClick={onClose} className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg">Cancel</button>
          <button onClick={handleGenerate} disabled={isLoading} className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg disabled:bg-neutral-600">{isLoading ? 'Generating...' : '✨ Generate Exam'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Modal for selecting questions from the bank ---
const QuestionBankModal = ({ bankQuestions, onAdd, onClose, existingQuestionIds }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const handleToggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]);
  const handleAddSelected = () => { onAdd(bankQuestions.filter(q => selectedIds.includes(q.id))); };
  return (
    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 w-full max-w-2xl flex flex-col h-[90vh]" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h2 className="text-xl font-bold text-white mb-4">Select Questions from Bank</h2>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {bankQuestions.map(q => {
            const isSelected = selectedIds.includes(q.id); const isAlreadyInExam = existingQuestionIds.includes(q.id);
            return (<div key={q.id} onClick={() => !isAlreadyInExam && handleToggleSelect(q.id)} className={`p-3 border-2 rounded-lg transition-all ${isAlreadyInExam ? 'border-neutral-600 bg-neutral-700/50 opacity-50 cursor-not-allowed' : isSelected ? 'border-primary bg-primary/10 cursor-pointer' : 'border-neutral-700 hover:border-primary-light cursor-pointer'}`}><p className="font-semibold text-neutral-200">{q.question_text}</p><span className="text-xs text-neutral-400">{q.topic} - {q.difficulty}</span></div>);
          })}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700"><button onClick={onClose} className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg">Cancel</button><button onClick={handleAddSelected} className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg">Add Selected</button></div>
      </motion.div>
    </motion.div>
  );
};

// --- Modal for creating a new custom question (with Explanation field) ---
const AddCustomQuestionModal = ({ onClose, onSave }) => {
  const [text, setText] = useState(''); const [topic, setTopic] = useState(''); const [difficulty, setDifficulty] = useState('Easy'); const [options, setOptions] = useState(['', '']); const [correctAnswer, setCorrectAnswer] = useState(''); const [explanation, setExplanation] = useState(''); const [isLoadingAI, setIsLoadingAI] = useState(false);
  const handleGenerateWithAI = async () => { if (!topic) return alert("Please enter a topic first."); setIsLoadingAI(true); try { const response = await fetch('http://localhost:3001/generate-question', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic }), }); if (!response.ok) throw new Error('AI request failed'); const aiData = await response.json(); setText(aiData.question_text); setOptions(aiData.options); setCorrectAnswer(aiData.correct_answer); setExplanation(aiData.explanation); } catch (error) { alert("AI failed to generate a question. Please check if your AI server is running."); } setIsLoadingAI(false); };
  const handleOptionChange = (index, value) => { const newOptions = [...options]; newOptions[index] = value; setOptions(newOptions); }; const handleAddOption = () => setOptions([...options, '']); const handleRemoveOption = (index) => setOptions(options.filter((_, i) => i !== index));
  const handleSaveClick = () => { if (!text || !topic || options.some(opt => opt === '') || !correctAnswer) return alert('Please fill all fields.'); if (!options.includes(correctAnswer)) return alert('Correct answer must be one of the options.'); onSave({ question_text: text, topic, difficulty, options, correct_answer: correctAnswer, explanation }); };
  return (
    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 w-full max-w-2xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h2 className="text-2xl font-bold text-white mb-4">Add Custom Question</h2><div className="flex gap-4 mb-4"><input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter Topic (e.g., Algebra)" className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 text-white" /><button type="button" onClick={handleGenerateWithAI} disabled={isLoadingAI} className="bg-primary/80 hover:bg-primary text-white font-semibold py-2 px-4 rounded-lg whitespace-nowrap disabled:bg-neutral-600">{isLoadingAI ? 'Generating...' : '✨ Generate with AI'}</button></div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Question Text" className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 text-white" rows="3" /><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 text-white"><option>Easy</option><option>Medium</option><option>Hard</option></select>
          <h3 className="text-lg font-semibold text-neutral-300 pt-2">Options</h3>{options.map((opt, index) => (<div key={index} className="flex items-center gap-2"><input type="radio" name="correctAnswer" value={opt} checked={correctAnswer === opt} onChange={() => setCorrectAnswer(opt)} className="form-radio text-primary" /><input type="text" value={opt} onChange={(e) => handleOptionChange(index, e.target.value)} className="flex-1 bg-neutral-700 border-2 border-neutral-600 rounded-lg p-2 text-white" placeholder={`Option ${index + 1}`} /><button type="button" onClick={() => handleRemoveOption(index)} className="text-neutral-400 hover:text-red-400">✖</button></div>))}<button type="button" onClick={handleAddOption} className="text-sm font-semibold text-primary-light hover:text-primary">+ Add Option</button>
          <div><h3 className="text-lg font-semibold text-neutral-300 pt-2">Explanation</h3><textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explanation for the correct answer..." className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 text-white" rows="4" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-700"><button onClick={onClose} className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg">Cancel</button><button onClick={handleSaveClick} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg">Add to Exam</button></div>
      </motion.div>
    </motion.div>
  );
};

export default function CreateExam() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBankQuestions = async () => { const { data, error } = await supabase.from('questions').select('*'); if (error) console.error("Error fetching question bank:", error); else setBankQuestions(data); };
    fetchBankQuestions();
  }, []);

  const handleAddFromBank = useCallback((selectedQs) => { const newQuestions = selectedQs.filter(bq => !questions.some(q => q.id === bq.id)); setQuestions(prev => [...prev, ...newQuestions]); setModal(null); }, [questions]);
  const handleAddCustomQuestion = useCallback((newQuestionData) => { const newQ = { ...newQuestionData, id: `custom-${Date.now()}`, isNew: true }; setQuestions(prev => [...prev, newQ]); setModal(null); }, []);
  const handleAIGenerateExam = useCallback((generatedQuestions) => { const questionsWithIds = generatedQuestions.map(q => ({ ...q, id: `ai-${Date.now()}-${Math.random()}`, isNew: true })); setQuestions(questionsWithIds); setModal(null); }, []);
  const handleRemoveQuestion = (id) => setQuestions(questions.filter((q) => q.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) return alert("Please add at least one question to the exam.");
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("You must be logged in."); setLoading(false); return; }

    try {
      const newQuestionsToSave = questions.filter(q => q.isNew);
      const existingQuestionIds = questions.filter(q => !q.isNew).map(q => q.id);
      let savedNewQuestionIds = [];

      if (newQuestionsToSave.length > 0) {
        const payload = newQuestionsToSave.map(({ question_text, options, correct_answer, topic, difficulty, explanation }) => ({ question_text, options, correct_answer, topic, difficulty, explanation, created_by: user.id }));
        const { data: savedQs, error: qError } = await supabase.from('questions').insert(payload).select('id');
        if (qError) throw qError;
        savedNewQuestionIds = savedQs.map(q => q.id);
      }
      const allQuestionIds = [...existingQuestionIds, ...savedNewQuestionIds];

      const { data: examData, error: examError } = await supabase.from('exams').insert({ title, duration_minutes: duration, created_by: user.id, status: 'draft' }).select('id').single();
      if (examError) throw examError;

      const questionsToLink = allQuestionIds.map(qId => ({ exam_id: examData.id, question_id: qId }));
      const { error: linkError } = await supabase.from('exam_questions').insert(questionsToLink);
      if (linkError) throw linkError;

      alert("Exam created successfully!");
      navigate("/teacher");
    } catch (error) {
      console.error("Error during exam creation:", error);
      alert(`Failed to save the exam: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-4xl font-extrabold text-neutral-100">Create a New Exam</h1>
        <motion.button onClick={() => setModal('ai-generate-exam')} className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          ✨ Generate Full Exam with AI
        </motion.button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700">
          <h2 className="text-2xl font-bold text-neutral-200 mb-4">Exam Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-semibold text-neutral-300 mb-1">Exam Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-light" required /></div>
            <div><label className="block text-sm font-semibold text-neutral-300 mb-1">Duration (minutes)</label><input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-light" required /></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-neutral-200">Selected Questions ({questions.length})</h2><div className="flex gap-3"><button type="button" onClick={() => setModal('bank')} className="font-semibold bg-primary-dark hover:bg-primary text-white py-2 px-4 rounded-lg">+ Add from Bank</button><button type="button" onClick={() => setModal('custom')} className="font-semibold bg-neutral-700 hover:bg-neutral-600 text-white py-2 px-4 rounded-lg">+ Add Custom</button></div></div>
          <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700 min-h-[10rem]">
            {questions.length === 0 ? <p className="text-center text-neutral-500">No questions selected yet.</p> :
              <AnimatePresence>{questions.map((q) => (<motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} layout className="p-3 mb-2 flex justify-between items-center bg-neutral-800 rounded-lg"><p className="text-neutral-200">{q.question_text}</p><button type="button" onClick={() => handleRemoveQuestion(q.id)} className="text-red-400 hover:text-red-300 font-semibold text-sm">Remove</button></motion.div>))}</AnimatePresence>}
          </div>
        </div>
        <div className="flex justify-end"><motion.button type="submit" className="bg-primary-dark hover:bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg transition-all shadow-lg shadow-primary/20 disabled:bg-neutral-600" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={loading || questions.length === 0}>{loading ? "Saving..." : "Save Exam"}</motion.button></div>
      </form>
      <AnimatePresence>{modal === 'ai-generate-exam' && <AIExamGeneratorModal onClose={() => setModal(null)} onComplete={handleAIGenerateExam} />}</AnimatePresence>
      <AnimatePresence>{modal === 'bank' && <QuestionBankModal bankQuestions={bankQuestions} onClose={() => setModal(null)} onAdd={handleAddFromBank} existingQuestionIds={questions.map(q => q.id)} />}</AnimatePresence>
      <AnimatePresence>{modal === 'custom' && <AddCustomQuestionModal onClose={() => setModal(null)} onSave={handleAddCustomQuestion} />}</AnimatePresence>
    </div>
  );
}
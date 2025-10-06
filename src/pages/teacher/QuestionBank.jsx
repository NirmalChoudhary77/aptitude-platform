import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';

const AddEditQuestionModal = ({ onClose, onSave, questionToEdit }) => {
  const [text, setText] = useState(questionToEdit?.question_text || '');
  const [topic, setTopic] = useState(questionToEdit?.topic || '');
  const [difficulty, setDifficulty] = useState(questionToEdit?.difficulty || 'Easy');
  const [options, setOptions] = useState(questionToEdit?.options || ['', '']);
  const [correctAnswer, setCorrectAnswer] = useState(questionToEdit?.correct_answer || '');
  const [explanation, setExplanation] = useState(questionToEdit?.explanation || '');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // --- AI Generation Logic ---
  const handleGenerateWithAI = async () => {
    if (!topic) return alert("Please enter a topic first.");
    setIsLoadingAI(true);
    try {
      const response = await fetch('http://localhost:3001/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      if (!response.ok) throw new Error('AI request failed');
      const aiData = await response.json();
      setText(aiData.question_text);
      setOptions(aiData.options);
      setCorrectAnswer(aiData.correct_answer);
      setExplanation(aiData.explanation || '');
    } catch (error) {
      alert("AI failed to generate a question. Please check if your AI server is running.");
    }
    setIsLoadingAI(false);
  };

  const handleOptionChange = (index, value) => { const newOptions = [...options]; newOptions[index] = value; setOptions(newOptions); };
  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (index) => setOptions(options.filter((_, i) => i !== index));

  const handleSaveClick = () => {
    if (!text || !topic || options.some(opt => opt === '') || !correctAnswer) return alert('Please fill all fields and select a correct answer.');
    if (!options.includes(correctAnswer)) return alert('The correct answer must be one of the options.');
    
    // Pass back the original question ID if we are editing
    const questionData = { id: questionToEdit?.id, question_text: text, topic, difficulty, options, correct_answer: correctAnswer, explanation };
    onSave(questionData);
  };

  return (
    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 w-full max-w-2xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h2 className="text-2xl font-bold text-white mb-4">{questionToEdit ? 'Edit Question' : 'Add New Question'}</h2>
        <div className="flex gap-4 mb-4"><input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter Topic" className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 text-white" /><button type="button" onClick={handleGenerateWithAI} disabled={isLoadingAI} className="bg-primary/80 hover:bg-primary text-white font-semibold py-2 px-4 rounded-lg whitespace-nowrap disabled:bg-neutral-600">{isLoadingAI ? 'Generating...' : '✨ Generate with AI'}</button></div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Question Text" className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 text-white" rows="3" />
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 text-white"><option>Easy</option><option>Medium</option><option>Hard</option></select>
          <h3 className="text-lg font-semibold text-neutral-300 pt-2">Options</h3>
          {options.map((opt, index) => (<div key={index} className="flex items-center gap-2"><input type="radio" name="correctAnswer" value={opt} checked={correctAnswer === opt} onChange={() => setCorrectAnswer(opt)} className="form-radio text-primary" /><input type="text" value={opt} onChange={(e) => handleOptionChange(index, e.target.value)} className="flex-1 bg-neutral-700 border-2 border-neutral-600 rounded-lg p-2 text-white" placeholder={`Option ${index + 1}`} /><button type="button" onClick={() => handleRemoveOption(index)} className="text-neutral-400 hover:text-red-400">✖</button></div>))}<button type="button" onClick={handleAddOption} className="text-sm font-semibold text-primary-light hover:text-primary">+ Add Option</button>
          <div><h3 className="text-lg font-semibold text-neutral-300 pt-2">Explanation</h3><textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explanation for the correct answer..." className="w-full bg-neutral-900 border-2 border-neutral-700 rounded-lg p-2 text-white" rows="4" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-700"><button onClick={onClose} className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg">Cancel</button><button onClick={handleSaveClick} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg">{questionToEdit ? 'Save Changes' : 'Save to Bank'}</button></div>
      </motion.div>
    </motion.div>
  );
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
    if (error) console.error("Error fetching questions:", error);
    else setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSaveQuestion = async (questionData) => {
    if (questionData.id) { // This is an existing question to update
      const { id, ...updateData } = questionData;
      const { data, error } = await supabase.from('questions').update(updateData).eq('id', id).select().single();
      if (error) alert(error.message);
      else setQuestions(questions.map(q => q.id === id ? data : q));
    } else { // This is a new question to add
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("You must be logged in.");
      const { data, error } = await supabase.from('questions').insert([{ ...questionData, created_by: user.id }]).select().single();
      if (error) alert(error.message);
      else setQuestions([data, ...questions]);
    }
    closeModal();
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question permanently?")) return;
    const { error } = await supabase.from('questions').delete().eq('id', questionId);
    if (error) alert(error.message);
    else setQuestions(questions.filter(q => q.id !== questionId));
  };
  
  const openEditModal = (question) => {
    setQuestionToEdit(question);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setQuestionToEdit(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setQuestionToEdit(null);
    setIsModalOpen(false);
  };

  const filteredQuestions = useMemo(() =>
    questions.filter(q =>
      q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase())
    ), [questions, searchTerm]);
  
  if (loading) return <div className="text-center text-neutral-400 p-8">Loading Question Bank...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-neutral-100">Question Bank</h1>
        <motion.button onClick={openAddModal} className="bg-primary-dark hover:bg-primary text-white font-semibold py-2 px-5 rounded-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          + Add New Question
        </motion.button>
      </div>
      <div className="mb-6"><input type="text" placeholder="Search by text or topic..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-neutral-800 border-2 border-neutral-700 rounded-lg px-4 py-2 text-neutral-100" /></div>
      <div className="space-y-4">
        <AnimatePresence>
          {filteredQuestions.map(q => (
            <motion.div key={q.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700 flex justify-between items-center">
              <div>
                <p className="text-neutral-200">{q.question_text}</p>
                <div className="flex items-center gap-2 mt-2"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-sky-500/20 text-sky-400">{q.topic}</span><span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 capitalize">{q.difficulty}</span></div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => openEditModal(q)} className="font-semibold text-primary-light hover:text-primary">Edit</button>
                <button onClick={() => handleDelete(q.id)} className="font-semibold text-red-500/80 hover:text-red-500">Delete</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {isModalOpen && <AddEditQuestionModal onClose={closeModal} onSave={handleSaveQuestion} questionToEdit={questionToEdit} />}
      </AnimatePresence>
    </div>
  );
}
// src/pages/teacher/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../supabaseClient";

const ScheduleExamModal = ({ exam, onClose, onSave }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSave = async () => {
    if (!startTime || !endTime) return alert("Please set both a start and end time.");
    if (new Date(startTime) >= new Date(endTime)) return alert("End time must be after the start time.");
    await onSave(exam.id, startTime, endTime);
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 w-full max-w-md" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h2 className="text-xl font-bold text-white mb-4">Schedule "{exam.title}"</h2>
        <div className="space-y-4">
          <div><label className="block text-sm text-neutral-300 mb-1">Start Time</label><input type="datetime-local" onChange={(e) => setStartTime(e.target.value)} className="w-full bg-neutral-900 p-2 rounded-lg border border-neutral-700 text-neutral-200" /></div>
          <div><label className="block text-sm text-neutral-300 mb-1">End Time</label><input type="datetime-local" onChange={(e) => setEndTime(e.target.value)} className="w-full bg-neutral-900 p-2 rounded-lg border border-neutral-700 text-neutral-200" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-700">
          <button onClick={onClose} className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg">Cancel</button>
          <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg">Set Schedule</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatusBadge = ({ status }) => {
  const baseClass = "px-2 py-1 text-xs font-bold rounded-full capitalize";
  const statusClasses = { live: "bg-sky-500/20 text-sky-400", completed: "bg-emerald-500/20 text-emerald-400", draft: "bg-neutral-500/20 text-neutral-400", scheduled: "bg-amber-500/20 text-amber-400" };
  return <span className={`${baseClass} ${statusClasses[status]}`}>{status}</span>;
};

export default function TeacherDashboard() {
  const navigate = useNavigate(); const [auth, setAuth] = useState(null); const [exams, setExams] = useState([]); const [loading, setLoading] = useState(true); const [selectedExam, setSelectedExam] = useState(null);

  const fetchExams = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase.from('exams').select('id, title, status, exam_questions(count)').eq('created_by', userId).order('created_at', { ascending: false });
    if (error) { console.error("Error fetching exams:", error); } 
    else { setExams(data.map(e => ({...e, questions_count: e.exam_questions[0]?.count || 0}))); }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) { navigate("/login"); return; } setAuth({ id: user.id, name: user.user_metadata.full_name }); await fetchExams(user.id); };
    init();
  }, [navigate]);

  const handleMakeLive = async (examId) => {
    if (!window.confirm("Make this exam live immediately?")) return;
    const { error } = await supabase.from('exams').update({ status: 'live', start_time: new Date().toISOString() }).eq('id', examId);
    if (error) alert("Error: " + error.message); else await fetchExams(auth?.id);
  };
  
  const handleDelete = async (examId) => {
    if (!window.confirm("Delete this exam permanently?")) return;
    await supabase.from('exam_questions').delete().eq('exam_id', examId);
    const { error } = await supabase.from('exams').delete().eq('id', examId);
    if (error) alert("Error: " + error.message); else setExams(exams.filter(e => e.id !== examId));
  };

  const handleSchedule = async (examId, startTime, endTime) => {
    const { error } = await supabase.from('exams').update({ status: 'scheduled', start_time: startTime, end_time: endTime }).eq('id', examId);
    if (error) alert("Error: " + error.message); else await fetchExams(auth?.id);
  };

  if (loading) return <div className="text-center text-neutral-400 p-8">Loading Dashboard...</div>;
  
  return (
    <div>
      <motion.div className="flex justify-between items-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div><h2 className="text-4xl font-extrabold text-neutral-100">Welcome, {auth?.name}!</h2><p className="text-lg text-neutral-400">Manage your exams and monitor student progress.</p></div>
        <Link to="/teacher/exams/create"><motion.button className="bg-primary-dark hover:bg-primary text-white font-semibold py-2 px-5 rounded-lg shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>+ Create New Exam</motion.button></Link>
      </motion.div>
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {exams.map((exam) => (
          <motion.div key={exam.id} whileHover={{ y: -5 }} className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg hover:border-primary-light transition-all duration-300 flex flex-col">
            <div className="flex justify-between items-start mb-3"><h4 className="font-bold text-lg text-neutral-100">{exam.title}</h4><StatusBadge status={exam.status} /></div>
            <p className="text-sm text-neutral-400 mb-4">{exam.questions_count} Questions</p>
            <div className="mt-auto flex flex-wrap items-center gap-2">
              {(exam.status === 'draft' || exam.status === 'scheduled') && <>
                <button onClick={() => handleMakeLive(exam.id)} className="flex-1 text-center bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2 px-3 rounded-md">Make Live</button>
                <button onClick={() => setSelectedExam(exam)} className="flex-1 text-center bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium py-2 px-3 rounded-md">Schedule</button>
              </>}
              {exam.status === 'live' && <Link to={`/teacher/exams/${exam.id}/monitor`} className="flex-1 text-center bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium py-2 px-3 rounded-md">Monitor</Link>}
              {exam.status === 'completed' && <Link to={`/teacher/exams/${exam.id}/results`} className="flex-1 text-center bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2 px-3 rounded-md">Results</Link>}
              <Link to={`/teacher/exams/${exam.id}/edit`} className="text-center bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-sm font-medium py-2 px-3 rounded-md">Edit</Link>
              <button onClick={() => handleDelete(exam.id)} className="text-center bg-red-800 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md">Delete</button>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <AnimatePresence>
        {selectedExam && <ScheduleExamModal exam={selectedExam} onClose={() => setSelectedExam(null)} onSave={handleSchedule} />}
      </AnimatePresence>
    </div>
  );
}
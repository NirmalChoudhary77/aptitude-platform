// src/pages/teacher/MonitorExam.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';

export default function MonitorExam() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    // Fetch initial data for the exam and submissions
    const fetchInitialData = async () => {
      const { data: examData, error: examError } = await supabase.from('exams').select('*, exam_questions(count)').eq('id', examId).single();
      if (examError) { console.error(examError); navigate('/teacher'); return; }
      setExam(examData);

      const { data: submissionsData, error: submissionsError } = await supabase.from('submissions').select('id, student_id, profiles(full_name), student_answers(count)').eq('exam_id', examId);
      if (submissionsError) console.error(submissionsError);
      else setSubmissions(submissionsData);
    };

    fetchInitialData();

    // Set up Supabase Realtime subscription
    const channel = supabase.channel(`submissions:${examId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_answers' }, (payload) => {
        // When a new answer is inserted, refetch the data for that student
        fetchInitialData(); 
      })
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [examId, navigate]);
  
  const handleEndExam = async () => {
    if (!window.confirm("Are you sure you want to end this exam for all students?")) return;
    const { error } = await supabase.from('exams').update({ status: 'completed', end_time: new Date().toISOString() }).eq('id', examId);
    if (error) alert("Error ending exam: " + error.message);
    else navigate('/teacher');
  };

  if (!exam) return <div>Loading Live Monitor...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-100">{exam.title}</h1>
            <p className="text-sm text-sky-400 font-semibold">● Live Monitoring</p>
          </div>
          <button onClick={handleEndExam} className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">End Exam Now</button>
        </div>
        <div className="bg-neutral-800/50 rounded-xl border border-neutral-700">
          <table className="w-full text-left">
            <thead>{/* ... table headers ... */}</thead>
            <tbody>
              {submissions.map((sub) => {
                const progress = sub.student_answers[0]?.count || 0;
                const totalQuestions = exam.exam_questions[0]?.count || 0;
                return (
                  <tr key={sub.id} className="border-b border-neutral-700 last:border-b-0">
                    <td className="p-4 font-medium text-neutral-200">{sub.profiles.full_name}</td>
                    <td className="p-4">
                      <div className="w-full bg-neutral-700 rounded-full h-4">
                        <div className="bg-primary h-4 rounded-full" style={{ width: `${(progress / totalQuestions) * 100}%` }}></div>
                      </div>
                      <span className="text-xs text-neutral-400 mt-1 block">{progress} / {totalQuestions} Answered</span>
                    </td>
                    {/* ... other columns like status, actions ... */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
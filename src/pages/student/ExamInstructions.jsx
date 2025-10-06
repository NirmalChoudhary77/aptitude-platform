// src/pages/student/ExamInstructions.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../supabaseClient";

export default function ExamInstructions() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamDetails = async () => {
      setLoading(true);
      
      // Step 1: Fetch the main exam details from the 'exams' table
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('title, duration_minutes')
        .eq('id', examId)
        .single();

      if (examError) {
        console.error("Error fetching exam details:", examError);
        // Optional: navigate to a not-found page if exam doesn't exist
        navigate("/student"); 
        return;
      }

      // Step 2: Count the number of questions linked to this exam
      const { count: questionCount, error: countError } = await supabase
        .from('exam_questions')
        .select('*', { count: 'exact', head: true })
        .eq('exam_id', examId);
        
      if (countError) {
        console.error("Error fetching question count:", countError);
      }

      setExam({
        ...examData,
        questions: questionCount || 0,
        // We can define static instructions for now
        instructions: [
          "All questions are multiple-choice.",
          "You cannot go back to a previous question.",
          "The exam will auto-submit when the timer runs out.",
          "Do not exit fullscreen mode or switch tabs.",
          "Ensure you have a stable internet connection.",
        ],
      });
      setLoading(false);
    };

    fetchExamDetails();
  }, [examId, navigate]);

  if (loading) {
    return <div className="text-center text-neutral-400 p-8">Loading Exam Details...</div>;
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const DetailItem = ({ icon, label, value }) => (
    <div className="flex flex-col items-center justify-center bg-neutral-800 p-4 rounded-lg">
      <div className="text-3xl mb-2">{icon}</div>
      <span className="text-sm text-neutral-400">{label}</span>
      <span className="text-lg font-bold text-neutral-100">{value}</span>
    </div>
  );

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-3xl bg-neutral-800/50 rounded-2xl shadow-2xl shadow-black/20 p-8 border border-neutral-700"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1 variants={itemVariants} className="text-4xl font-extrabold text-neutral-100 text-center mb-2">
            {exam.title}
          </motion.h1>
          <motion.p variants={itemVariants} className="text-neutral-400 text-center mb-8">
            Read the following instructions carefully before you begin.
          </motion.p>

          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
            <DetailItem icon="⏱️" label="Time Limit" value={`${exam.duration_minutes} mins`} />
            <DetailItem icon="?" label="Total Questions" value={exam.questions} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-neutral-200 mb-4">Instructions</h2>
            <ul className="space-y-3">
              {exam.instructions.map((inst, index) => (
                <motion.li key={index} variants={itemVariants} className="flex items-start">
                  <span className="text-emerald-400 mr-3 mt-1">✔</span>
                  <span className="text-neutral-300">{inst}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 text-center">
            <motion.button
              onClick={() => navigate(`/student/exam/${examId}/attempt`)}
              className="bg-primary-dark hover:bg-primary text-white font-bold py-3 px-12 rounded-lg text-lg transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Exam
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
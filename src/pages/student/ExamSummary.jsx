import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../supabaseClient";

export default function ExamSummary() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Step 1: Find the student's most recent submission for this exam
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .select('id')
        .eq('exam_id', examId)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (submissionError || !submissionData) {
        setError("Could not find your submission for this exam.");
        setLoading(false);
        return;
      }
      
      // Step 2: Call our new database function with the submission ID to get the summary
      const { data: summaryData, error: summaryError } = await supabase.rpc('get_submission_summary', {
        p_submission_id: submissionData.id
      });

      if (summaryError) {
        setError("Could not calculate your results.");
        console.error(summaryError);
      } else {
        const incorrect = summaryData.attempted - summaryData.score;
        const unanswered = summaryData.total_marks - summaryData.attempted;
        setSummary({ ...summaryData, incorrect, unanswered });
      }
      setLoading(false);
    };

    fetchSummary();
  }, [examId, navigate]);

  if (loading) return <div className="text-center text-neutral-400 p-8">Calculating your results...</div>;
  if (error) return <div className="text-center text-red-400 p-8">{error}</div>;
  if (!summary) return <div className="text-center text-neutral-500 p-8">No summary data available.</div>;

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl bg-neutral-800/50 rounded-2xl shadow-2xl shadow-black/20 p-8 border border-neutral-700"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1 variants={itemVariants} className="text-3xl font-extrabold text-neutral-100 text-center">
            Exam Completed!
          </motion.h1>
          <motion.p variants={itemVariants} className="text-neutral-400 text-center mb-6">
            Here's your performance summary for "{summary.exam_title}".
          </motion.p>

          <motion.div variants={itemVariants} className="text-center bg-primary/10 border-2 border-primary-dark rounded-xl p-6 my-8">
            <span className="text-lg text-primary-light">Your Score</span>
            <h2 className="text-7xl font-bold text-white">{summary.score}</h2>
            <span className="text-2xl text-neutral-400">/ {summary.total_marks}</span>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-around bg-neutral-800 p-4 rounded-lg mb-8">
            <div className="text-center">
              <span className="text-emerald-400 font-bold text-2xl">{summary.score}</span>
              <p className="text-sm text-neutral-400">Correct</p>
            </div>
            <div className="text-center">
              <span className="text-red-400 font-bold text-2xl">{summary.incorrect}</span>
              <p className="text-sm text-neutral-400">Incorrect</p>
            </div>
            <div className="text-center">
              <span className="text-neutral-500 font-bold text-2xl">{summary.unanswered}</span>
              <p className="text-sm text-neutral-400">Unanswered</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
            <Link to={`/student/exam/${examId}/solutions`} className="bg-primary-dark hover:bg-primary text-white font-bold py-3 px-6 rounded-lg transition-all">
              View Detailed Solutions
            </Link>
            <Link to="/student" className="bg-neutral-700 hover:bg-neutral-600 text-neutral-200 font-bold py-3 px-6 rounded-lg transition-all">
              Back to Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
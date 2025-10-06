import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../supabaseClient";

export default function ResultPage() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      // Call our new database function to get all results for this exam
      const { data, error } = await supabase.rpc('get_exam_results', {
        p_exam_id: examId
      });

      if (error) {
        console.error("Error fetching exam results:", error);
      } else {
        setResultsData(data);
      }
      setLoading(false);
    };
    fetchResults();
  }, [examId]);

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  if (loading) return <div className="text-center text-neutral-400 p-8">Loading Results...</div>;
  if (!resultsData) return <div className="text-center text-red-400 p-8">Could not load results.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-neutral-100">Results for "{resultsData.exam_title}"</h1>
        <p className="text-neutral-400 mt-1 mb-6">A ranked overview of student performance.</p>
      </motion.div>

      <motion.div
        className="bg-neutral-800/50 rounded-xl border border-neutral-700 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <table className="w-full text-left">
          <thead className="border-b border-neutral-700 bg-neutral-800">
            <tr>
              <th className="p-4 text-sm font-semibold text-neutral-400 text-center">Rank</th>
              <th className="p-4 text-sm font-semibold text-neutral-400">Student Name</th>
              <th className="p-4 text-sm font-semibold text-neutral-400">Score</th>
            </tr>
          </thead>
          <tbody>
            {resultsData.results?.map((student, index) => (
              <motion.tr
                key={index}
                className="border-b border-neutral-700 last:border-b-0 hover:bg-neutral-800 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <td className="p-4 font-bold text-xl text-neutral-200 text-center">{getRankIcon(student.rank)}</td>
                <td className="p-4 font-medium text-neutral-200">{student.name}</td>
                <td className="p-4 font-semibold text-primary-light">
                  {student.score} / {resultsData.total_questions}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
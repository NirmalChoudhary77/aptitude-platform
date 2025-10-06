import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sub-component for the score distribution chart
const ScoreDistributionChart = ({ data }) => (
  <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-80">
    <h3 className="font-bold text-lg text-neutral-100 mb-4">Score Distribution</h3>
    <ResponsiveContainer width="100%" height="90%">
      {!data || data.length === 0 ? (
        <p className="text-center text-neutral-500 pt-16">No score data to display.</p>
      ) : (
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="range" stroke="#A3A3A3" fontSize={12} />
          <YAxis stroke="#A3A3A3" allowDecimals={false} />
          <Tooltip contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040' }} cursor={{ fill: '#404040' }} />
          <Bar dataKey="count" fill="#8B5CF6" name="Number of Students" />
        </BarChart>
      )}
    </ResponsiveContainer>
  </div>
);

// Sub-component for the question performance table
const QuestionPerformanceTable = ({ data, totalSubmissions }) => (
  <div className="bg-neutral-800/50 rounded-xl border border-neutral-700 mt-6 md:mt-0">
    <h3 className="font-bold text-lg text-neutral-100 p-4 border-b border-neutral-700">Question Performance</h3>
    <div className="overflow-x-auto max-h-72">
      {!data || data.length === 0 ? (
        <p className="text-center text-neutral-500 p-8">No questions to analyze.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-4 text-sm font-semibold text-neutral-400">Question</th>
              <th className="p-4 text-sm font-semibold text-neutral-400">Correct Answers</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((q) => (
              <tr key={q.question_id} className="border-t border-neutral-700 hover:bg-neutral-800">
                <td className="p-4 text-neutral-300 w-2/3">{q.question_text}</td>
                <td className="p-4 text-neutral-200">
                  <span className="font-semibold">{q.correct_answers} / {totalSubmissions}</span>
                  <span className="text-sm text-neutral-400 ml-2">({totalSubmissions > 0 ? ((q.correct_answers / totalSubmissions) * 100).toFixed(0) : 0}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

export default function ExamAnalytics() {
  const [examsList, setExamsList] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase.from('exams').select('id, title').eq('created_by', user.id);
      if (error) console.error("Error fetching exams list:", error);
      else setExamsList(data);
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) {
      setAnalytics(null);
      return;
    }
    
    const fetchAnalytics = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_exam_analytics', { p_exam_id: selectedExamId });
      if (error) console.error("Error fetching analytics:", error);
      else setAnalytics(data);
      setLoading(false);
    };
    fetchAnalytics();
  }, [selectedExamId]);

  // Use optional chaining (?.) and provide default values (|| 0) to prevent errors
  const totalSubmissions = analytics?.overall_stats?.submission_count || 0;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-neutral-100 mb-6">Exam Analytics</h1>
      <div className="mb-8">
        <label className="block text-sm font-semibold text-neutral-300 mb-2">Select an Exam to Analyze</label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="w-full max-w-sm bg-neutral-800 border-2 border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          <option value="">-- Choose an Exam --</option>
          {examsList.map(exam => (<option key={exam.id} value={exam.id}>{exam.title}</option>))}
        </select>
      </div>

      {loading && <p className="text-center text-neutral-400">Loading Analytics...</p>}

      <AnimatePresence>
        {analytics && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {totalSubmissions > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScoreDistributionChart data={analytics.score_distribution} />
                <QuestionPerformanceTable data={analytics.question_performance} totalSubmissions={totalSubmissions} />
              </div>
            ) : (
              <div className="text-center text-neutral-500 bg-neutral-800/50 border border-neutral-700 rounded-xl p-12">
                <h3 className="text-xl font-bold text-neutral-200">No Submissions Yet</h3>
                <p>There is no data to analyze for this exam. Results will appear here once students complete it.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
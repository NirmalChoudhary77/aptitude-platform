import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../supabaseClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// A sub-component for the top-level stat cards
const StatCard = ({ icon, label, value }) => (
  <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 flex items-center gap-4">
    <div className="text-3xl bg-primary/20 text-primary-light p-3 rounded-lg">{icon}</div>
    <div>
      <span className="text-sm text-neutral-400">{label}</span>
      <span className="text-2xl font-bold text-neutral-100 block">{value}</span>
    </div>
  </div>
);

// A sub-component for the Score Over Time line chart
const ScoreChart = ({ data }) => (
  <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-80">
    <h4 className="font-bold text-lg text-neutral-100 mb-4">Score Over Time</h4>
    <ResponsiveContainer width="100%" height="90%">
      {!data || data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-neutral-500">Take an exam to see your progress!</div>
      ) : (
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="exam_title" stroke="#A3A3A3" fontSize={12} tick={{ fill: '#A3A3A3' }} />
          <YAxis stroke="#A3A3A3" />
          <Tooltip contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040' }} />
          <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2} name="Your Score" />
        </LineChart>
      )}
    </ResponsiveContainer>
  </div>
);

// A sub-component for the Performance by Topic bar chart
const TopicChart = ({ data }) => {
  const chartData = useMemo(() => data?.map(item => ({ ...item, percentage: ((item.correct / item.total) * 100).toFixed(0) })) || [], [data]);
  return (
    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-80">
      <h4 className="font-bold text-lg text-neutral-100 mb-4">Performance by Topic</h4>
       <ResponsiveContainer width="100%" height="90%">
        {!chartData || chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-500">Complete an exam to analyze topics.</div>
        ) : (
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis type="number" stroke="#A3A3A3" domain={[0, 100]} tick={{ fill: '#A3A3A3' }} />
            <YAxis type="category" dataKey="topic" stroke="#A3A3A3" width={80} fontSize={12} tick={{ fill: '#A3A3A3' }} />
            <Tooltip contentStyle={{ backgroundColor: '#262626', border: '1px solid #404040' }} cursor={{ fill: '#404040' }} />
            <Bar dataKey="percentage" fill="#10B981" name="Accuracy (%)" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// The component for the tabbed exam lists
const ExamListsTabs = ({ activeExams, pastExams }) => {
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();
  const tabContentVariants = { initial: { opacity: 0, y: 10 }, enter: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

  return (
    <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 h-full flex flex-col">
      <div className="flex border-b border-neutral-700 mb-4">
        <button onClick={() => setActiveTab('active')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-white'}`}>🚀 Active Exams</button>
        <button onClick={() => setActiveTab('past')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'past' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-white'}`}>🏁 Past Exams</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} variants={tabContentVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.2 }}>
            {activeTab === 'active' && (
              <div className="space-y-3">{activeExams.length > 0 ? activeExams.map(exam => (<div key={exam.id} className="bg-neutral-800/50 p-3 rounded-lg flex justify-between items-center border border-neutral-700"><div><p className="font-semibold text-neutral-200">{exam.title}</p><p className="text-xs text-neutral-400">{exam.total_questions} Questions</p></div><button onClick={() => navigate(`/student/exam/${exam.id}/instructions`)} className="px-3 py-1 bg-primary-dark hover:bg-primary text-white text-sm rounded-md">Start Now</button></div>)) : <p className="text-sm text-neutral-500 text-center pt-8">No active exams.</p>}</div>
            )}
            {activeTab === 'past' && (
              <div className="space-y-3">{pastExams.length > 0 ? pastExams.map(exam => (<div key={exam.id} className="bg-neutral-800/50 p-3 rounded-lg flex justify-between items-center border border-neutral-700"><div><p className="font-semibold text-neutral-200">{exam.title}</p><p className="text-xs text-neutral-400">{exam.total_questions} Questions</p></div><button onClick={() => navigate(`/student/exam/${exam.id}/summary`)} className="px-3 py-1 bg-neutral-600 hover:bg-neutral-500 text-white text-sm rounded-md">View Summary</button></div>)) : <p className="text-sm text-neutral-500 text-center pt-8">No past exams.</p>}</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(null);
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState({ active: [], past: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setAuth({ name: user.user_metadata.full_name });

      const [statsRes, examsRes] = await Promise.all([
        supabase.rpc('get_student_performance_stats', { p_student_id: user.id }),
        supabase.from('exams').select('id, title, status, exam_questions(count)')
      ]);

      if (statsRes.error) console.error("Error fetching stats:", statsRes.error);
      else setStats(statsRes.data);

      if (examsRes.error) console.error("Error fetching exams:", examsRes.error);
      else {
        const allExams = examsRes.data.map(e => ({...e, total_questions: e.exam_questions[0]?.count || 0 }));
        setExams({
          active: allExams.filter(e => e.status === 'live'),
          past: allExams.filter(e => e.status === 'completed'),
        });
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, [navigate]);

  const overallStats = useMemo(() => {
    if (!stats?.scoreovertime) {
      return { avgScore: 0, examsTaken: 0 };
    }
    const examsTaken = stats.scoreovertime.length;
    if (examsTaken === 0) {
      return { avgScore: 0, examsTaken: 0 };
    }

    const totalPercentageSum = stats.scoreovertime.reduce((sum, exam) => {
      // THIS IS THE FIX: Check if total_marks is greater than 0 before dividing.
      if (exam.total_marks > 0) {
        return sum + (exam.score / exam.total_marks);
      }
      return sum;
    }, 0);

    const avgScore = ((totalPercentageSum / examsTaken) * 100).toFixed(1);
    return { avgScore, examsTaken };
  }, [stats]);

  if (loading) return <div className="text-center text-neutral-400 p-8">Loading Dashboard...</div>;

  return (
    <div>
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-4xl font-extrabold text-neutral-100">Welcome back, {auth?.name}!</h2>
        <p className="text-lg text-neutral-400">Here's an overview of your progress and exams.</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <StatCard icon="🎯" label="Average Score" value={`${overallStats.avgScore}%`} />
        <StatCard icon="✅" label="Exams Completed" value={overallStats.examsTaken} />
        <StatCard icon="🏆" label="Highest Rank" value={stats?.highestrank ? `#${stats.highestrank}` : 'N/A'} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <ScoreChart data={stats?.scoreovertime} />
          <TopicChart data={stats?.performancebytopic} />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <ExamListsTabs activeExams={exams.active} pastExams={exams.past} />
        </motion.div>
      </div>
    </div>
  );
}
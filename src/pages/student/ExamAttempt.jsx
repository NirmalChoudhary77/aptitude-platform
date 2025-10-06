import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../supabaseClient";

export default function ExamAttempt() {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  const [examTitle, setExamTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      // This is the corrected query. It goes from 'exams' through 'exam_questions' to get to 'questions'.
      const { data, error } = await supabase
        .from('exams')
        .select(`
          id,
          title,
          duration_minutes,
          exam_questions ( questions ( id, question_text, options ) )
        `)
        .eq('id', examId)
        .single();

      if (error || !data) {
        console.error("Error fetching exam:", error);
        navigate('/student'); // Redirect if exam not found or error
        return;
      }
      
      // Extract the nested question data
      const fetchedQuestions = data.exam_questions.map(item => item.questions);
      
      setExamTitle(data.title);
      setQuestions(fetchedQuestions);
      setTimeLeft(data.duration_minutes * 60);
      setLoading(false);
    };

    fetchExam();
  }, [examId, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit(); // Auto-submit when time runs out
    }
    if (timeLeft === null) return;
    
    const timer = setInterval(() => setTimeLeft(prevTime => prevTime - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectOption = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    setTimeLeft(null); // Stop the timer
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("User not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create a submission record
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .insert({ exam_id: examId, student_id: user.id, completed_at: new Date().toISOString() })
        .select('id')
        .single();

      if (submissionError) throw submissionError;

      // Step 2: Prepare and insert all the student's answers
      const answersToInsert = Object.entries(answers).map(([question_id, selected_option]) => ({
        submission_id: submissionData.id,
        question_id,
        selected_option,
      }));

      if (answersToInsert.length > 0) {
        const { error: answersError } = await supabase.from('student_answers').insert(answersToInsert);
        if (answersError) throw answersError;
      }
      
      navigate(`/student/exam/${examId}/summary`);

    } catch (error) {
      console.error("Error submitting exam:", error);
      alert(`There was an error submitting your exam: ${error.message}`);
      setLoading(false);
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || questions.length === 0) {
    return <div className="text-center text-neutral-400 p-8">Loading Exam...</div>;
  }

  const question = questions[currentQ];

  return (
    <div className="flex h-full gap-6">
      {/* Main Question Area */}
      <div className="flex-[3] bg-neutral-800/50 rounded-2xl border border-neutral-700 p-8 flex flex-col">
        <div className="mb-6">
          <p className="text-lg font-medium text-neutral-400">Question {currentQ + 1} of {questions.length}</p>
          <h2 className="text-2xl font-bold text-neutral-100 mt-2">{question.question_text}</h2>
        </div>
        
        <div className="space-y-4">
          {question.options.map((option, index) => {
             const isSelected = answers[question.id] === option;
             return (
              <motion.div key={index} onClick={() => handleSelectOption(question.id, option)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 text-primary-light' : 'border-neutral-700 hover:border-primary-light text-neutral-300'}`} whileHover={{ scale: 1.02 }}>
                <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {option}
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-auto flex justify-between items-center pt-6">
          <button onClick={() => setCurrentQ(currentQ - 1)} disabled={currentQ === 0} className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">Previous</button>
          <button onClick={() => setCurrentQ(currentQ + 1)} disabled={currentQ === questions.length - 1} className="bg-primary-dark hover:bg-primary text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex-1 bg-neutral-800/50 rounded-2xl border border-neutral-700 p-6 flex flex-col">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-neutral-300">Time Left</h3>
          <p className={`text-4xl font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-neutral-100'}`}>{timeLeft !== null ? formatTime(timeLeft) : '00:00'}</p>
        </div>
        
        <div className="grid grid-cols-5 gap-2 mb-6">
          {questions.map((q, index) => (
            <button key={q.id} onClick={() => setCurrentQ(index)} className={`w-10 h-10 rounded-md font-bold text-white transition-all ${index === currentQ ? 'bg-primary ring-2 ring-primary-light' : answers[q.id] ? 'bg-emerald-600' : 'bg-neutral-700'}`}>{index + 1}</button>
          ))}
        </div>
        
        <div className="mt-auto">
          <button onClick={handleSubmit} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition">Submit Exam</button>
        </div>
      </div>
    </div>
  );
}
import { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import useAuthStore from './store/authStore';

import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';
import StudentDashboard from './pages/student/Dashboard';
import ExamAttempt from './pages/student/ExamAttempt';
import ExamInstructions from './pages/student/ExamInstructions';
import ExamSummary from './pages/student/ExamSummary';
import PYQLibrary from './pages/student/PYQLibrary';
import CreateExam from './pages/teacher/CreateExam';
import EditExam from './pages/teacher/EditExam';
import ExamAnalytics from './pages/teacher/ExamAnalytics';
import MonitorExam from './pages/teacher/MonitorExam';
import QuestionBank from './pages/teacher/QuestionBank';
import ResultPage from './pages/teacher/ResultPage';
import SolutionsPage from './pages/teacher/SolutionsPage';
import TeacherDashboard from './pages/teacher/Dashboard';

function App() {
  const { fetchUser, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const homePath = user?.role === 'teacher' ? '/teacher' : '/student';

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? homePath : '/login'} replace />} />

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="pyq" element={<PYQLibrary />} />
          <Route path="exam/:id/instructions" element={<ExamInstructions />} />
          <Route path="exam/:id/attempt" element={<ExamAttempt />} />
          <Route path="exam/:id/summary" element={<ExamSummary />} />
          <Route path="exam/:id/solutions" element={<SolutionsPage />} />
        </Route>

        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="exams/create" element={<CreateExam />} />
          <Route path="exams/:id/edit" element={<EditExam />} />
          <Route path="exams/:id/monitor" element={<MonitorExam />} />
          <Route path="exams/:id/results" element={<ResultPage />} />
          <Route path="question-bank" element={<QuestionBank />} />
          <Route path="analytics" element={<ExamAnalytics />} />
          <Route path="pyq" element={<PYQLibrary />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

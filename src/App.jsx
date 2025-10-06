// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StudentLayout from "./layouts/StudentLayout";
import TeacherLayout from "./layouts/TeacherLayout";

// Shared Pages
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import PYQLibrary from "./pages/student/PYQLibrary";
import ExamInstructions from "./pages/student/ExamInstructions";
import ExamAttempt from "./pages/student/ExamAttempt";
import ExamSummary from "./pages/student/ExamSummary";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/Dashboard";
import CreateExam from "./pages/teacher/CreateExam";
import EditExam from "./pages/teacher/EditExam";
import MonitorExam from "./pages/teacher/MonitorExam";
import ResultPage from "./pages/teacher/ResultPage";
import SolutionsPage from "./pages/teacher/SolutionsPage";
import QuestionBank from "./pages/teacher/QuestionBank"; // Import the new component
import ExamAnalytics from "./pages/teacher/ExamAnalytics"; // Import the new component


function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="pyq" element={<PYQLibrary />} />
          <Route path="exam/:id/instructions" element={<ExamInstructions />} />
          <Route path="exam/:id/attempt" element={<ExamAttempt />} />
          <Route path="exam/:id/summary" element={<ExamSummary />} />
          <Route path="exam/:id/result" element={<ResultPage />} />
          <Route path="exam/:id/solutions" element={<SolutionsPage />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="exams/create" element={<CreateExam />} />
          <Route path="exams/:id/edit" element={<EditExam />} />
          <Route path="exams/:id/monitor" element={<MonitorExam />} />
          <Route path="exams/:id/results" element={<ResultPage />} /> 
          <Route path="question-bank" element={<QuestionBank />} /> {/* Add this line */}
          <Route path="analytics" element={<ExamAnalytics />} /> {/* Add this line */}

        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
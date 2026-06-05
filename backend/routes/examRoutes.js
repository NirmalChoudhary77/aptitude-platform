import express from 'express';
import { protect, requireStudent, requireTeacher } from '../middleware/auth.js';
import { 
  createExam, getTeacherExams, getExamById, updateExam, updateExamStatus, deleteExam, getTeacherAnalytics,
  getAvailableExams, getExamAttempt, submitExam, getSubmissionDetails, getStudentPerformance,
  getStudentSolutions, getStudentSummary, getTeacherResults
} from '../controllers/examController.js';

const router = express.Router();

// Teacher Routes
router.post('/teacher', protect, requireTeacher, createExam);
router.get('/teacher', protect, requireTeacher, getTeacherExams);
router.get('/teacher/:id', protect, requireTeacher, getExamById);
router.put('/teacher/:id', protect, requireTeacher, updateExam);
router.put('/teacher/:id/status', protect, requireTeacher, updateExamStatus);
router.delete('/teacher/:id', protect, requireTeacher, deleteExam);
router.get('/teacher/:examId/analytics', protect, requireTeacher, getTeacherAnalytics);
router.get('/teacher/:examId/results', protect, requireTeacher, getTeacherResults);

// Student Routes
router.get('/student/available', protect, requireStudent, getAvailableExams);
router.get('/student/performance', protect, requireStudent, getStudentPerformance);
router.get('/student/submission/:id', protect, requireStudent, getSubmissionDetails);
router.get('/student/:id/attempt', protect, requireStudent, getExamAttempt);
router.post('/student/:id/submit', protect, requireStudent, submitExam);
router.get('/student/:id/summary', protect, requireStudent, getStudentSummary);
router.get('/student/:id/solutions', protect, requireStudent, getStudentSolutions);

export default router;

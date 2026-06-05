import express from 'express';
import { generateExam, generateQuestion } from '../controllers/aiController.js';
import { protect, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate-question', protect, requireTeacher, generateQuestion);
router.post('/generate-exam', protect, requireTeacher, generateExam);

export default router;

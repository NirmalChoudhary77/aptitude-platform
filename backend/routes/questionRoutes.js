import express from 'express';
import { protect, requireTeacher } from '../middleware/auth.js';
import { createQuestion, deleteQuestion, getQuestions, updateQuestion } from '../controllers/questionController.js';

const router = express.Router();

router.get('/', protect, getQuestions);
router.post('/', protect, requireTeacher, createQuestion);
router.put('/:id', protect, requireTeacher, updateQuestion);
router.delete('/:id', protect, requireTeacher, deleteQuestion);

export default router;

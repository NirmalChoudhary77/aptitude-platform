import express from 'express';
import { createPyq, deletePyq, listPyqs, updatePyq } from '../controllers/pyqController.js';
import { protect, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, listPyqs);
router.post('/', protect, requireTeacher, createPyq);
router.put('/:id', protect, requireTeacher, updatePyq);
router.delete('/:id', protect, requireTeacher, deletePyq);

export default router;

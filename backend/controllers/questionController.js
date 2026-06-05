import Question from '../models/Question.js';
import { normalizeQuestionInput, validateQuestionPayload } from '../utils/questions.js';

export const getQuestions = async (req, res) => {
  try {
    const query = req.user.role === 'teacher'
      ? { $or: [{ created_by: req.user.id }, { created_by: { $exists: false } }] }
      : {};
    const questions = await Question.find(query).sort({ createdAt: -1 });
    res.json(questions);
  } catch {
    res.status(500).json({ error: 'Server error fetching questions' });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const normalized = payload.map((item) => normalizeQuestionInput(item, req.user.id));
    const validationError = normalized.map(validateQuestionPayload).find(Boolean);
    if (validationError) return res.status(400).json({ error: validationError });

    if (normalized.length > 1) {
      const questions = await Question.insertMany(normalized);
      return res.status(201).json(questions);
    }

    const question = await Question.create(normalized[0]);
    res.status(201).json(question);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Server error creating question' });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const normalized = normalizeQuestionInput(req.body, req.user.id);
    const validationError = validateQuestionPayload(normalized);
    if (validationError) return res.status(400).json({ error: validationError });

    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user.id },
      normalized,
      { new: true, runValidators: true },
    );

    if (!question) return res.status(404).json({ error: 'Question not found' });
    return res.json(question);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({ _id: req.params.id, created_by: req.user.id });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    return res.json({ message: 'Question deleted' });
  } catch {
    return res.status(500).json({ error: 'Server error deleting question' });
  }
};

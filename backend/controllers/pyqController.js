import PYQ from '../models/PYQ.js';

export const listPyqs = async (req, res) => {
  try {
    const { topic, year, exam_type } = req.query;
    const query = {};
    if (topic) query.topic = new RegExp(topic, 'i');
    if (year) query.year = Number(year);
    if (exam_type) query.exam_type = new RegExp(exam_type, 'i');

    const pyqs = await PYQ.find(query)
      .sort({ year: -1, createdAt: -1 })
      .populate('questions')
      .populate('created_by', 'full_name');

    return res.json(pyqs);
  } catch {
    return res.status(500).json({ error: 'Server error fetching PYQ library' });
  }
};

export const createPyq = async (req, res) => {
  try {
    const pyq = await PYQ.create({
      title: req.body.title,
      year: req.body.year,
      exam_type: req.body.exam_type,
      topic: req.body.topic || 'General',
      description: req.body.description || '',
      questions: req.body.questions || [],
      created_by: req.user.id,
    });
    return res.status(201).json(await pyq.populate('questions'));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updatePyq = async (req, res) => {
  try {
    const pyq = await PYQ.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user.id },
      {
        title: req.body.title,
        year: req.body.year,
        exam_type: req.body.exam_type,
        topic: req.body.topic || 'General',
        description: req.body.description || '',
        questions: req.body.questions || [],
      },
      { new: true, runValidators: true },
    ).populate('questions');

    if (!pyq) return res.status(404).json({ error: 'PYQ set not found' });
    return res.json(pyq);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deletePyq = async (req, res) => {
  try {
    const pyq = await PYQ.findOneAndDelete({ _id: req.params.id, created_by: req.user.id });
    if (!pyq) return res.status(404).json({ error: 'PYQ set not found' });
    return res.json({ message: 'PYQ set deleted' });
  } catch {
    return res.status(500).json({ error: 'Server error deleting PYQ set' });
  }
};

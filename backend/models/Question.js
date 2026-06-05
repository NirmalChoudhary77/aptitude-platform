import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  subtopic: {
    type: String,
    default: 'General',
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [v => v.length >= 2, 'Options must have at least 2 items'],
  },
  correct_option: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    default: '',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);

import mongoose from 'mongoose';

const pyqSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
  },
  exam_type: {
    type: String,
    required: true,
    trim: true,
  },
  topic: {
    type: String,
    default: 'General',
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('PYQ', pyqSchema);

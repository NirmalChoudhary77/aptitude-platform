import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  duration_minutes: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'live', 'completed'],
    default: 'draft',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  start_time: {
    type: Date,
  },
  end_time: {
    type: Date,
  },
  instructions: [{
    type: String,
  }],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);

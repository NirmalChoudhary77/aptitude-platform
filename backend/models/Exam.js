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
  integrity: {
    fullscreen_required: {
      type: Boolean,
      default: true,
    },
    randomize_questions: {
      type: Boolean,
      default: true,
    },
    auto_submit_violation_limit: {
      type: Number,
      default: 3,
      min: 1,
    },
    block_copy_paste: {
      type: Boolean,
      default: true,
    },
    one_active_session: {
      type: Boolean,
      default: true,
    },
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);

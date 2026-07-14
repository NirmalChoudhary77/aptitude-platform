import mongoose from 'mongoose';

const examSessionSchema = new mongoose.Schema({
  exam_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'submitted', 'expired', 'terminated'],
    default: 'active',
  },
  question_order: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  started_at: {
    type: Date,
    default: Date.now,
  },
  last_seen_at: {
    type: Date,
    default: Date.now,
  },
  submitted_at: {
    type: Date,
  },
  violation_count: {
    type: Number,
    default: 0,
  },
  auto_submit_reason: {
    type: String,
    default: '',
  },
  user_agent: {
    type: String,
    default: '',
  },
}, { timestamps: true });

examSessionSchema.index({ exam_id: 1, student_id: 1, status: 1 });

export default mongoose.model('ExamSession', examSessionSchema);

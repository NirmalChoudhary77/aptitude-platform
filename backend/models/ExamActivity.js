import mongoose from 'mongoose';

const examActivitySchema = new mongoose.Schema({
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
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamSession',
  },
  type: {
    type: String,
    required: true,
    trim: true,
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info',
  },
  message: {
    type: String,
    default: '',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  occurred_at: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

examActivitySchema.index({ exam_id: 1, occurred_at: -1 });
examActivitySchema.index({ session_id: 1, occurred_at: -1 });

export default mongoose.model('ExamActivity', examActivitySchema);

import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
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
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  total_questions: {
    type: Number,
    required: true,
    default: 0,
  },
  answers: [{
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selected_option: {
      type: String,
    },
    is_correct: {
      type: Boolean,
      required: true,
    }
  }],
  submitted_at: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Ensure a student can only submit once per exam
submissionSchema.index({ exam_id: 1, student_id: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);

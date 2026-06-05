import Exam from '../models/Exam.js';
import Submission from '../models/Submission.js';
import { publicQuestionFields } from '../utils/questions.js';

const defaultInstructions = [
  'All questions are multiple-choice with a single correct answer.',
  'You can move between questions before submitting.',
  'The exam auto-submits when the timer reaches zero.',
  'Do not refresh the page during an active attempt.',
  'Use a stable internet connection before starting.',
];

const getEffectiveStatus = (exam) => {
  const now = new Date();
  if (exam.status === 'scheduled' && exam.start_time && exam.end_time) {
    if (now >= exam.start_time && now <= exam.end_time) return 'live';
    if (now > exam.end_time) return 'completed';
  }
  return exam.status;
};

const ensureExamOpen = (exam) => {
  const status = getEffectiveStatus(exam);
  if (status !== 'live') {
    return 'This exam is not live right now.';
  }
  return null;
};

const percentage = (score, total) => (total > 0 ? Number(((score / total) * 100).toFixed(1)) : 0);

const getRankedResults = async (examId, teacherId) => {
  const exam = await Exam.findOne({ _id: examId, created_by: teacherId }).populate('questions');
  if (!exam) return null;

  const submissions = await Submission.find({ exam_id: examId })
    .sort({ score: -1, submitted_at: 1 })
    .populate('student_id', 'full_name email');

  return {
    exam_title: exam.title,
    total_questions: exam.questions.length,
    results: submissions.map((submission, index) => ({
      rank: index + 1,
      submission_id: submission._id,
      student_id: submission.student_id?._id,
      name: submission.student_id?.full_name || 'Unknown Student',
      email: submission.student_id?.email || '',
      score: submission.score,
      total: submission.total_questions,
      percentage: percentage(submission.score, submission.total_questions),
      submitted_at: submission.submitted_at || submission.createdAt,
    })),
  };
};

export const createExam = async (req, res) => {
  try {
    const { title, description = '', duration_minutes, questions, instructions = defaultInstructions } = req.body;
    if (!title || !duration_minutes || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Title, duration, and at least one question are required' });
    }

    const exam = await Exam.create({
      title,
      description,
      duration_minutes,
      created_by: req.user.id,
      questions,
      instructions,
      status: 'draft',
    });

    return res.status(201).json(await exam.populate('questions'));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getTeacherExams = async (req, res) => {
  try {
    const exams = await Exam.find({ created_by: req.user.id })
      .sort({ createdAt: -1 })
      .populate('questions');
    return res.json(exams.map((exam) => ({ ...exam.toObject(), effective_status: getEffectiveStatus(exam) })));
  } catch {
    return res.status(500).json({ error: 'Server error fetching exams' });
  }
};

export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, created_by: req.user.id }).populate('questions');
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    return res.json({ ...exam.toObject(), effective_status: getEffectiveStatus(exam) });
  } catch {
    return res.status(500).json({ error: 'Server error fetching exam' });
  }
};

export const updateExam = async (req, res) => {
  try {
    const { title, description = '', duration_minutes, questions, instructions = defaultInstructions } = req.body;
    if (!title || !duration_minutes || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Title, duration, and at least one question are required' });
    }

    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user.id },
      { title, description, duration_minutes, questions, instructions },
      { new: true, runValidators: true },
    ).populate('questions');

    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    return res.json(exam);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateExamStatus = async (req, res) => {
  try {
    const { status, start_time, end_time } = req.body;
    if (!['draft', 'scheduled', 'live', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid exam status' });
    }

    const update = { status };
    if (start_time) update.start_time = start_time;
    if (end_time) update.end_time = end_time;
    if (status === 'live' && !start_time) update.start_time = new Date();
    if (status === 'completed' && !end_time) update.end_time = new Date();

    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user.id },
      update,
      { new: true, runValidators: true },
    ).populate('questions');

    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    return res.json(exam);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, created_by: req.user.id });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    await Submission.deleteMany({ exam_id: req.params.id });
    return res.json({ message: 'Exam deleted' });
  } catch {
    return res.status(500).json({ error: 'Server error deleting exam' });
  }
};

export const getTeacherAnalytics = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.examId, created_by: req.user.id }).populate('questions');
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    const submissions = await Submission.find({ exam_id: req.params.examId })
      .populate('student_id', 'full_name email')
      .populate('answers.question_id', 'text topic difficulty');

    const scoreDistribution = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ];

    const questionMap = new Map(exam.questions.map((question) => [question._id.toString(), {
      question_id: question._id,
      question_text: question.text,
      correct_answers: 0,
    }]));

    let totalPercentage = 0;
    const scores = submissions.map((submission) => {
      const pct = percentage(submission.score, submission.total_questions);
      totalPercentage += pct;
      if (pct <= 20) scoreDistribution[0].count += 1;
      else if (pct <= 40) scoreDistribution[1].count += 1;
      else if (pct <= 60) scoreDistribution[2].count += 1;
      else if (pct <= 80) scoreDistribution[3].count += 1;
      else scoreDistribution[4].count += 1;

      submission.answers.forEach((answer) => {
        if (answer.is_correct && answer.question_id) {
          const entry = questionMap.get(answer.question_id._id.toString());
          if (entry) entry.correct_answers += 1;
        }
      });

      return {
        id: submission._id,
        studentName: submission.student_id?.full_name || 'Unknown Student',
        email: submission.student_id?.email || '',
        percentage: pct,
        score: submission.score,
        total: submission.total_questions,
        submitted_at: submission.submitted_at || submission.createdAt,
      };
    });

    return res.json({
      averageScore: submissions.length ? Number((totalPercentage / submissions.length).toFixed(1)) : 0,
      totalSubmissions: submissions.length,
      scores,
      score_distribution: scoreDistribution,
      question_performance: Array.from(questionMap.values()),
      overall_stats: {
        submission_count: submissions.length,
      },
    });
  } catch {
    return res.status(500).json({ error: 'Server error fetching analytics' });
  }
};

export const getTeacherResults = async (req, res) => {
  try {
    const results = await getRankedResults(req.params.examId, req.user.id);
    if (!results) return res.status(404).json({ error: 'Exam not found' });
    return res.json(results);
  } catch {
    return res.status(500).json({ error: 'Server error fetching results' });
  }
};

export const getAvailableExams = async (req, res) => {
  try {
    const submissions = await Submission.find({ student_id: req.user.id }).select('exam_id');
    const submittedIds = new Set(submissions.map((submission) => submission.exam_id.toString()));
    const exams = await Exam.find({ status: { $in: ['scheduled', 'live'] } })
      .select('title description duration_minutes questions start_time end_time status created_by')
      .populate('created_by', 'full_name');

    return res.json(exams.map((exam) => ({
      ...exam.toObject(),
      effective_status: getEffectiveStatus(exam),
      submitted: submittedIds.has(exam._id.toString()),
    })));
  } catch {
    return res.status(500).json({ error: 'Server error fetching available exams' });
  }
};

export const getExamAttempt = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions', publicQuestionFields);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    const openError = ensureExamOpen(exam);
    if (openError) return res.status(403).json({ error: openError });

    const existing = await Submission.findOne({ exam_id: req.params.id, student_id: req.user.id });
    if (existing) return res.status(409).json({ error: 'You have already submitted this exam.' });

    return res.json({
      ...exam.toObject(),
      effective_status: getEffectiveStatus(exam),
      instructions: exam.instructions?.length ? exam.instructions : defaultInstructions,
    });
  } catch {
    return res.status(500).json({ error: 'Server error fetching exam' });
  }
};

export const submitExam = async (req, res) => {
  try {
    const existing = await Submission.findOne({ exam_id: req.params.id, student_id: req.user.id });
    if (existing) return res.status(400).json({ error: 'You have already submitted this exam.' });

    const exam = await Exam.findById(req.params.id).populate('questions');
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    const openError = ensureExamOpen(exam);
    if (openError) return res.status(403).json({ error: openError });

    const answersMap = {};
    if (Array.isArray(req.body.answers)) {
      req.body.answers.forEach((answer) => {
        answersMap[answer.question_id] = answer.selected_option;
      });
    }

    let score = 0;
    const answers = exam.questions.map((question) => {
      const selected = answersMap[question._id.toString()] || null;
      const isCorrect = selected !== null && selected === question.correct_option;
      if (isCorrect) score += 1;
      return {
        question_id: question._id,
        selected_option: selected,
        is_correct: isCorrect,
      };
    });

    const submission = await Submission.create({
      exam_id: req.params.id,
      student_id: req.user.id,
      score,
      total_questions: exam.questions.length,
      answers,
      submitted_at: new Date(),
    });

    return res.status(201).json({
      score,
      total: exam.questions.length,
      submissionId: submission._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already submitted this exam.' });
    }
    return res.status(500).json({ error: 'Server error submitting exam' });
  }
};

export const getSubmissionDetails = async (req, res) => {
  try {
    const submission = await Submission.findOne({ _id: req.params.id, student_id: req.user.id })
      .populate('exam_id', 'title')
      .populate('answers.question_id');
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    return res.json(submission);
  } catch {
    return res.status(500).json({ error: 'Server error fetching submission details' });
  }
};

export const getStudentPerformance = async (req, res) => {
  try {
    const submissions = await Submission.find({ student_id: req.user.id })
      .sort({ submitted_at: -1, createdAt: -1 })
      .populate('exam_id', 'title')
      .populate('answers.question_id', 'topic difficulty text');
    return res.json(submissions);
  } catch {
    return res.status(500).json({ error: 'Server error fetching performance stats' });
  }
};

export const getStudentSummary = async (req, res) => {
  try {
    const submission = await Submission.findOne({ exam_id: req.params.id, student_id: req.user.id })
      .populate('exam_id', 'title')
      .sort({ submitted_at: -1 });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const attempted = submission.answers.filter((answer) => answer.selected_option).length;
    return res.json({
      submission_id: submission._id,
      exam_title: submission.exam_id?.title || 'Exam',
      score: submission.score,
      total_questions: submission.total_questions,
      attempted,
      correct: submission.score,
      incorrect: attempted - submission.score,
      unanswered: submission.total_questions - attempted,
      percentage: percentage(submission.score, submission.total_questions),
      submitted_at: submission.submitted_at || submission.createdAt,
    });
  } catch {
    return res.status(500).json({ error: 'Server error fetching summary' });
  }
};

export const getStudentSolutions = async (req, res) => {
  try {
    const submission = await Submission.findOne({ exam_id: req.params.id, student_id: req.user.id })
      .populate('exam_id', 'title')
      .populate('answers.question_id');
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    return res.json({
      exam_title: submission.exam_id?.title || 'Exam',
      score: submission.score,
      total_questions: submission.total_questions,
      answers: submission.answers.map((answer) => ({
        question_id: answer.question_id?._id,
        question: answer.question_id,
        selected_option: answer.selected_option,
        is_correct: answer.is_correct,
      })),
    });
  } catch {
    return res.status(500).json({ error: 'Server error fetching solutions' });
  }
};

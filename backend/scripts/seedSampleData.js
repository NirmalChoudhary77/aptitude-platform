import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import Exam from '../models/Exam.js';
import PYQ from '../models/PYQ.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';

const password = 'Demo@12345';

const now = new Date();
const minutesFromNow = (minutes) => new Date(now.getTime() + minutes * 60 * 1000);
const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

const sampleQuestions = [
  {
    topic: 'Quantitative Aptitude',
    subtopic: 'Percentages',
    difficulty: 'Easy',
    text: 'A number is increased by 20% and then decreased by 20%. What is the net percentage change?',
    options: ['4% decrease', '4% increase', 'No change', '2% decrease'],
    correct_option: '4% decrease',
    explanation: 'Start with 100. After a 20% increase it becomes 120, then a 20% decrease makes it 96.',
  },
  {
    topic: 'Quantitative Aptitude',
    subtopic: 'Time and Work',
    difficulty: 'Medium',
    text: 'A can complete a task in 12 days and B can complete it in 18 days. Working together, how many days will they take?',
    options: ['6.2 days', '7.2 days', '8 days', '9 days'],
    correct_option: '7.2 days',
    explanation: 'Combined work rate is 1/12 + 1/18 = 5/36, so time required is 36/5 = 7.2 days.',
  },
  {
    topic: 'Logical Reasoning',
    subtopic: 'Series',
    difficulty: 'Easy',
    text: 'Find the next number in the series: 3, 6, 12, 24, ?',
    options: ['36', '42', '48', '54'],
    correct_option: '48',
    explanation: 'Each term is multiplied by 2.',
  },
  {
    topic: 'Logical Reasoning',
    subtopic: 'Blood Relations',
    difficulty: 'Medium',
    text: 'Pointing to a man, Riya says, "He is the son of my grandfather’s only son." How is the man related to Riya?',
    options: ['Brother', 'Father', 'Uncle', 'Cousin'],
    correct_option: 'Brother',
    explanation: 'Her grandfather’s only son is her father, so the man is her father’s son.',
  },
  {
    topic: 'Verbal Ability',
    subtopic: 'Synonyms',
    difficulty: 'Easy',
    text: 'Choose the closest synonym of "meticulous".',
    options: ['Careless', 'Precise', 'Quick', 'Ordinary'],
    correct_option: 'Precise',
    explanation: 'Meticulous means showing great attention to detail.',
  },
  {
    topic: 'Verbal Ability',
    subtopic: 'Reading Comprehension',
    difficulty: 'Medium',
    text: 'Which word best completes the sentence: The manager gave a _____ explanation of the new policy.',
    options: ['lucid', 'vacant', 'fragile', 'hostile'],
    correct_option: 'lucid',
    explanation: 'Lucid means clear and easy to understand.',
  },
  {
    topic: 'Data Interpretation',
    subtopic: 'Averages',
    difficulty: 'Medium',
    text: 'The average of five numbers is 28. If one number is removed, the average becomes 25. What is the removed number?',
    options: ['35', '38', '40', '42'],
    correct_option: '40',
    explanation: 'Total of five numbers is 140. Total of remaining four is 100. Removed number is 40.',
  },
  {
    topic: 'Quantitative Aptitude',
    subtopic: 'Profit and Loss',
    difficulty: 'Hard',
    text: 'A trader marks an item 40% above cost and gives a 10% discount. What is the profit percentage?',
    options: ['24%', '26%', '28%', '30%'],
    correct_option: '26%',
    explanation: 'Marked price is 140 for cost 100. After 10% discount, selling price is 126.',
  },
  {
    topic: 'Logical Reasoning',
    subtopic: 'Syllogisms',
    difficulty: 'Hard',
    text: 'Statements: All analysts are thinkers. Some thinkers are writers. Which conclusion definitely follows?',
    options: ['All analysts are writers', 'Some writers are analysts', 'All analysts are thinkers', 'No thinker is an analyst'],
    correct_option: 'All analysts are thinkers',
    explanation: 'Only the first statement is guaranteed by the given premises.',
  },
  {
    topic: 'Data Interpretation',
    subtopic: 'Ratios',
    difficulty: 'Easy',
    text: 'The ratio of boys to girls in a class is 3:2. If there are 45 students, how many girls are there?',
    options: ['15', '18', '20', '27'],
    correct_option: '18',
    explanation: 'Total parts are 5. Girls are 2/5 of 45, which is 18.',
  },
  {
    topic: 'Verbal Ability',
    subtopic: 'Error Spotting',
    difficulty: 'Medium',
    text: 'Choose the grammatically correct sentence.',
    options: ['Each of the players are ready.', 'Each of the players is ready.', 'Each players is ready.', 'Each of players are ready.'],
    correct_option: 'Each of the players is ready.',
    explanation: 'Each is singular, so it takes the singular verb "is".',
  },
  {
    topic: 'Quantitative Aptitude',
    subtopic: 'Simple Interest',
    difficulty: 'Easy',
    text: 'Find the simple interest on Rs. 5000 at 8% per annum for 2 years.',
    options: ['Rs. 600', 'Rs. 700', 'Rs. 800', 'Rs. 900'],
    correct_option: 'Rs. 800',
    explanation: 'Simple interest = PRT/100 = 5000 x 8 x 2 / 100 = 800.',
  },
];

const upsertUser = async ({ email, full_name, role }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return User.findOneAndUpdate(
    { email },
    { email, full_name, role, password: hashedPassword },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

const seed = async () => {
  await mongoose.connect(config.mongoUri);

  const teacher = await upsertUser({
    email: 'teacher@aptitude.demo',
    full_name: 'Demo Teacher',
    role: 'teacher',
  });
  const student = await upsertUser({
    email: 'student@aptitude.demo',
    full_name: 'Demo Student',
    role: 'student',
  });

  await Submission.deleteMany({ student_id: student._id });
  await Exam.deleteMany({ created_by: teacher._id });
  await PYQ.deleteMany({ created_by: teacher._id });
  await Question.deleteMany({ created_by: teacher._id });

  const questions = await Question.insertMany(
    sampleQuestions.map((question) => ({
      ...question,
      created_by: teacher._id,
    })),
  );

  const liveExam = await Exam.create({
    title: 'Live Aptitude Sprint',
    description: 'A balanced live assessment covering quant, reasoning, verbal ability, and data interpretation.',
    duration_minutes: 30,
    status: 'live',
    created_by: teacher._id,
    start_time: minutesFromNow(-10),
    end_time: minutesFromNow(50),
    instructions: [
      'Answer every question before submitting.',
      'You can review unanswered questions from the side panel.',
      'The test auto-submits when the timer ends.',
    ],
    questions: questions.slice(0, 8).map((question) => question._id),
  });

  await Exam.create({
    title: 'Campus Placement Mock - Quant Focus',
    description: 'Scheduled practice test for arithmetic-heavy placement rounds.',
    duration_minutes: 45,
    status: 'scheduled',
    created_by: teacher._id,
    start_time: minutesFromNow(180),
    end_time: minutesFromNow(225),
    instructions: [
      'Keep a notebook ready for calculations.',
      'Do not refresh the page during the attempt.',
    ],
    questions: questions.filter((question) => question.topic === 'Quantitative Aptitude').map((question) => question._id),
  });

  const completedExam = await Exam.create({
    title: 'Diagnostic Reasoning Check',
    description: 'Completed baseline test used to populate summaries, ranked results, and analytics.',
    duration_minutes: 20,
    status: 'completed',
    created_by: teacher._id,
    start_time: daysAgo(2),
    end_time: daysAgo(2),
    instructions: [
      'This sample exam demonstrates completed-test analytics.',
    ],
    questions: questions.slice(2, 7).map((question) => question._id),
  });

  const completedQuestions = questions.slice(2, 7);
  const answers = completedQuestions.map((question, index) => {
    const selectedOption = index === 1 ? question.options.find((option) => option !== question.correct_option) : question.correct_option;
    return {
      question_id: question._id,
      selected_option: selectedOption,
      is_correct: selectedOption === question.correct_option,
    };
  });

  await Submission.create({
    exam_id: completedExam._id,
    student_id: student._id,
    score: answers.filter((answer) => answer.is_correct).length,
    total_questions: completedQuestions.length,
    answers,
    submitted_at: daysAgo(1),
  });

  await PYQ.create([
    {
      title: 'TCS NQT Aptitude PYQ Set',
      year: 2025,
      exam_type: 'TCS NQT',
      topic: 'Mixed Aptitude',
      description: 'Representative previous-year style set for service-company aptitude screening.',
      questions: questions.slice(0, 6).map((question) => question._id),
      created_by: teacher._id,
    },
    {
      title: 'Banking Prelims Reasoning PYQ',
      year: 2024,
      exam_type: 'Banking',
      topic: 'Reasoning and Quant',
      description: 'Short PYQ collection for reasoning, ratios, and fast arithmetic practice.',
      questions: questions.slice(6, 12).map((question) => question._id),
      created_by: teacher._id,
    },
  ]);

  console.log('Sample data seeded successfully.');
  console.log(`Teacher login: teacher@aptitude.demo / ${password}`);
  console.log(`Student login: student@aptitude.demo / ${password}`);
  console.log(`Created ${questions.length} questions, 3 exams, 1 submission, and 2 PYQ sets.`);
  console.log(`Live exam: ${liveExam.title}`);
};

seed()
  .catch((error) => {
    console.error('Sample data seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

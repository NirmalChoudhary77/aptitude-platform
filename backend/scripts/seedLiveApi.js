const apiBaseUrl = (process.env.API_BASE_URL || 'https://aptitude-platform-api.onrender.com/api').replace(/\/$/, '');
const password = 'Demo@12345';

const now = new Date();
const minutesFromNow = (minutes) => new Date(now.getTime() + minutes * 60 * 1000).toISOString();

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
    subtopic: 'Grammar',
    difficulty: 'Medium',
    text: 'Choose the grammatically correct sentence.',
    options: ['Each of the players are ready.', 'Each of the players is ready.', 'Each players is ready.', 'Each of players are ready.'],
    correct_option: 'Each of the players is ready.',
    explanation: 'Each is singular, so it takes the singular verb "is".',
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
];

const request = async (path, { token, method = 'GET', body } = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${method} ${path} failed (${response.status}): ${data?.error || text}`);
  }
  return data;
};

const registerOrLogin = async ({ full_name, email, role }) => {
  try {
    return await request('/auth/register', {
      method: 'POST',
      body: { full_name, email, password, role },
    });
  } catch (error) {
    if (!error.message.includes('User already exists')) throw error;
    return request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }
};

const deleteMatching = async (items, matcher, pathBuilder, token) => {
  for (const item of items.filter(matcher)) {
    await request(pathBuilder(item), { method: 'DELETE', token });
  }
};

const seed = async () => {
  console.log(`Seeding live API: ${apiBaseUrl}`);

  const teacherSession = await registerOrLogin({
    full_name: 'Demo Teacher',
    email: 'teacher@aptitude.demo',
    role: 'teacher',
  });
  const studentSession = await registerOrLogin({
    full_name: 'Demo Student',
    email: 'student@aptitude.demo',
    role: 'student',
  });

  const teacherToken = teacherSession.token;
  const studentToken = studentSession.token;

  const [existingExams, existingPyqs, existingQuestions] = await Promise.all([
    request('/exams/teacher', { token: teacherToken }),
    request('/pyq', { token: teacherToken }),
    request('/questions', { token: teacherToken }),
  ]);

  const demoExamTitles = new Set([
    'Live Aptitude Sprint',
    'Campus Placement Mock - Quant Focus',
    'Diagnostic Reasoning Check',
  ]);
  const demoPyqTitles = new Set([
    'TCS NQT Aptitude PYQ Set',
    'Banking Prelims Reasoning PYQ',
  ]);
  const demoQuestionTexts = new Set(sampleQuestions.map((question) => question.text));

  await deleteMatching(existingExams, (exam) => demoExamTitles.has(exam.title), (exam) => `/exams/teacher/${exam._id}`, teacherToken);
  await deleteMatching(existingPyqs, (pyq) => demoPyqTitles.has(pyq.title), (pyq) => `/pyq/${pyq._id}`, teacherToken);
  await deleteMatching(existingQuestions, (question) => demoQuestionTexts.has(question.text), (question) => `/questions/${question._id}`, teacherToken);

  const questions = await request('/questions', {
    method: 'POST',
    token: teacherToken,
    body: sampleQuestions,
  });

  const liveExam = await request('/exams/teacher', {
    method: 'POST',
    token: teacherToken,
    body: {
      title: 'Live Aptitude Sprint',
      description: 'A balanced live assessment covering quant, reasoning, verbal ability, and data interpretation.',
      duration_minutes: 30,
      instructions: [
        'Answer every question before submitting.',
        'You can review unanswered questions from the side panel.',
        'The test auto-submits when the timer ends.',
      ],
      questions: questions.slice(0, 8).map((question) => question._id),
    },
  });

  await request(`/exams/teacher/${liveExam._id}/status`, {
    method: 'PUT',
    token: teacherToken,
    body: {
      status: 'live',
      start_time: minutesFromNow(-10),
      end_time: minutesFromNow(50),
    },
  });

  const scheduledExam = await request('/exams/teacher', {
    method: 'POST',
    token: teacherToken,
    body: {
      title: 'Campus Placement Mock - Quant Focus',
      description: 'Scheduled practice test for arithmetic-heavy placement rounds.',
      duration_minutes: 45,
      instructions: [
        'Keep a notebook ready for calculations.',
        'Do not refresh the page during the attempt.',
      ],
      questions: questions.filter((question) => question.topic === 'Quantitative Aptitude').map((question) => question._id),
    },
  });

  await request(`/exams/teacher/${scheduledExam._id}/status`, {
    method: 'PUT',
    token: teacherToken,
    body: {
      status: 'scheduled',
      start_time: minutesFromNow(180),
      end_time: minutesFromNow(225),
    },
  });

  const completedExam = await request('/exams/teacher', {
    method: 'POST',
    token: teacherToken,
    body: {
      title: 'Diagnostic Reasoning Check',
      description: 'Completed baseline test used to populate summaries, ranked results, and analytics.',
      duration_minutes: 20,
      instructions: ['This sample exam demonstrates completed-test analytics.'],
      questions: questions.slice(2, 7).map((question) => question._id),
    },
  });

  await request(`/exams/teacher/${completedExam._id}/status`, {
    method: 'PUT',
    token: teacherToken,
    body: {
      status: 'live',
      start_time: minutesFromNow(-20),
      end_time: minutesFromNow(20),
    },
  });

  const completedQuestions = questions.slice(2, 7);
  await request(`/exams/student/${completedExam._id}/submit`, {
    method: 'POST',
    token: studentToken,
    body: {
      answers: completedQuestions.map((question, index) => ({
        question_id: question._id,
        selected_option: index === 1 ? question.options.find((option) => option !== question.correct_option) : question.correct_option,
      })),
    },
  });

  await request(`/exams/teacher/${completedExam._id}/status`, {
    method: 'PUT',
    token: teacherToken,
    body: {
      status: 'completed',
      end_time: minutesFromNow(-5),
    },
  });

  await request('/pyq', {
    method: 'POST',
    token: teacherToken,
    body: {
      title: 'TCS NQT Aptitude PYQ Set',
      year: 2025,
      exam_type: 'TCS NQT',
      topic: 'Mixed Aptitude',
      description: 'Representative previous-year style set for service-company aptitude screening.',
      questions: questions.slice(0, 6).map((question) => question._id),
    },
  });

  await request('/pyq', {
    method: 'POST',
    token: teacherToken,
    body: {
      title: 'Banking Prelims Reasoning PYQ',
      year: 2024,
      exam_type: 'Banking',
      topic: 'Reasoning and Quant',
      description: 'Short PYQ collection for reasoning, ratios, and fast arithmetic practice.',
      questions: questions.slice(4, 10).map((question) => question._id),
    },
  });

  console.log('Live sample data seeded successfully.');
  console.log(`Teacher login: teacher@aptitude.demo / ${password}`);
  console.log(`Student login: student@aptitude.demo / ${password}`);
  console.log('Created 10 questions, 3 exams, 1 submission, and 2 PYQ sets.');
};

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

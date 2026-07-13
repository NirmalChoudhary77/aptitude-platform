const apiBaseUrl = (process.env.API_BASE_URL || 'https://aptitude-platform-api.onrender.com/api').replace(/\/$/, '');
const password = 'Demo@12345';

const now = new Date();
const minutesFromNow = (minutes) => new Date(now.getTime() + minutes * 60 * 1000).toISOString();

const demoStudents = [
  { full_name: 'Demo Student', email: 'student@aptitude.demo' },
  { full_name: 'Riya Sharma', email: 'riya.student@aptitude.demo' },
  { full_name: 'Arjun Mehta', email: 'arjun.student@aptitude.demo' },
  { full_name: 'Kabir Khan', email: 'kabir.student@aptitude.demo' },
  { full_name: 'Ananya Rao', email: 'ananya.student@aptitude.demo' },
];

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
    text: 'Pointing to a man, Riya says, "He is the son of my grandfather only son." How is the man related to Riya?',
    options: ['Brother', 'Father', 'Uncle', 'Cousin'],
    correct_option: 'Brother',
    explanation: 'Her grandfather only son is her father, so the man is her father son.',
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
  {
    topic: 'Quantitative Aptitude',
    subtopic: 'Simple Interest',
    difficulty: 'Easy',
    text: 'Find the simple interest on Rs. 5000 at 8% per annum for 2 years.',
    options: ['Rs. 600', 'Rs. 700', 'Rs. 800', 'Rs. 900'],
    correct_option: 'Rs. 800',
    explanation: 'Simple interest = PRT/100 = 5000 x 8 x 2 / 100 = 800.',
  },
  {
    topic: 'Quantitative Aptitude',
    subtopic: 'Mixtures',
    difficulty: 'Hard',
    text: 'In what ratio should milk costing Rs. 60 per litre be mixed with milk costing Rs. 45 per litre to get a mixture worth Rs. 50 per litre?',
    options: ['1:2', '2:1', '1:3', '3:1'],
    correct_option: '1:2',
    explanation: 'By alligation, ratio is (50-45):(60-50) = 5:10 = 1:2.',
  },
  {
    topic: 'Logical Reasoning',
    subtopic: 'Coding-Decoding',
    difficulty: 'Medium',
    text: 'If TABLE is coded as UBCMF, how is CHAIR coded?',
    options: ['DIBJS', 'DHAJQ', 'BGZHQ', 'EJCKT'],
    correct_option: 'DIBJS',
    explanation: 'Each letter is shifted forward by one position.',
  },
  {
    topic: 'Logical Reasoning',
    subtopic: 'Directions',
    difficulty: 'Easy',
    text: 'A person walks 5 km north, turns right and walks 3 km, then turns right and walks 5 km. How far is the person from the start?',
    options: ['3 km', '5 km', '8 km', '13 km'],
    correct_option: '3 km',
    explanation: 'The north and south movement cancels out; only 3 km east remains.',
  },
  {
    topic: 'Verbal Ability',
    subtopic: 'Antonyms',
    difficulty: 'Easy',
    text: 'Choose the antonym of "scarce".',
    options: ['Rare', 'Abundant', 'Limited', 'Sparse'],
    correct_option: 'Abundant',
    explanation: 'Scarce means insufficient or rare; abundant means plentiful.',
  },
  {
    topic: 'Verbal Ability',
    subtopic: 'Sentence Completion',
    difficulty: 'Medium',
    text: 'The team remained calm despite the _____ deadline.',
    options: ['looming', 'distant', 'optional', 'silent'],
    correct_option: 'looming',
    explanation: 'A looming deadline is approaching and creates pressure.',
  },
  {
    topic: 'Data Interpretation',
    subtopic: 'Tables',
    difficulty: 'Medium',
    text: 'Sales rose from 240 units to 300 units. What is the percentage increase?',
    options: ['20%', '22%', '25%', '30%'],
    correct_option: '25%',
    explanation: 'Increase is 60 on a base of 240, so 60/240 = 25%.',
  },
  {
    topic: 'Data Interpretation',
    subtopic: 'Pie Charts',
    difficulty: 'Hard',
    text: 'If 72 degrees of a pie chart represents travel expenses and total expenses are Rs. 50,000, what is the travel expense?',
    options: ['Rs. 8,000', 'Rs. 10,000', 'Rs. 12,000', 'Rs. 15,000'],
    correct_option: 'Rs. 10,000',
    explanation: '72 degrees is 1/5 of 360 degrees. One-fifth of 50,000 is 10,000.',
  },
  {
    topic: 'Computer Aptitude',
    subtopic: 'Basics',
    difficulty: 'Easy',
    text: 'Which of the following is volatile memory?',
    options: ['ROM', 'SSD', 'RAM', 'Hard disk'],
    correct_option: 'RAM',
    explanation: 'RAM loses its contents when power is switched off.',
  },
  {
    topic: 'Computer Aptitude',
    subtopic: 'Networking',
    difficulty: 'Medium',
    text: 'Which protocol is commonly used to securely transfer web pages?',
    options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'],
    correct_option: 'HTTPS',
    explanation: 'HTTPS uses encryption to secure web communication.',
  },
  {
    topic: 'Quantitative Aptitude',
    subtopic: 'Permutations',
    difficulty: 'Hard',
    text: 'How many ways can the letters of the word LEVEL be arranged?',
    options: ['20', '30', '40', '60'],
    correct_option: '30',
    explanation: 'There are 5 letters with L repeated twice and E repeated twice, so 5!/(2!2!) = 30.',
  },
  {
    topic: 'Verbal Ability',
    subtopic: 'Para Jumbles',
    difficulty: 'Hard',
    text: 'Which sentence should usually come first in a para-jumble?',
    options: ['A sentence beginning with "therefore"', 'A sentence introducing the main subject', 'A sentence with only examples', 'A sentence using "this" without context'],
    correct_option: 'A sentence introducing the main subject',
    explanation: 'Opening sentences generally introduce the topic before references and conclusions appear.',
  },
];

const demoExamTitles = new Set([
  'Live Aptitude Sprint',
  'Full Stack Placement Mock',
  'Campus Placement Mock - Quant Focus',
  'Verbal Ability Evening Drill',
  'Diagnostic Reasoning Check',
  'Data Interpretation Benchmark',
  'Draft: Computer Aptitude Mini Test',
]);

const demoPyqTitles = new Set([
  'TCS NQT Aptitude PYQ Set',
  'Banking Prelims Reasoning PYQ',
  'Infosys Placement Verbal PYQ',
  'SSC CGL Quant PYQ Pack',
]);

const legacyDemoQuestionTexts = [
  'Pointing to a man, Riya says, "He is the son of my grandfather’s only son." How is the man related to Riya?',
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

const answerSet = (questions, wrongIndexes = [], skipIndexes = []) => questions.map((question, index) => {
  let selected_option = question.correct_option;
  if (wrongIndexes.includes(index)) {
    selected_option = question.options.find((option) => option !== question.correct_option);
  }
  if (skipIndexes.includes(index)) {
    selected_option = null;
  }
  return {
    question_id: question._id,
    selected_option,
  };
});

const createExam = async (token, payload, statusPayload) => {
  const exam = await request('/exams/teacher', {
    method: 'POST',
    token,
    body: payload,
  });

  if (statusPayload) {
    return request(`/exams/teacher/${exam._id}/status`, {
      method: 'PUT',
      token,
      body: statusPayload,
    });
  }

  return exam;
};

const submitForStudents = async (exam, questions, studentSessions, patterns) => {
  for (const [index, session] of studentSessions.entries()) {
    const pattern = patterns[index] || {};
    await request(`/exams/student/${exam._id}/submit`, {
      method: 'POST',
      token: session.token,
      body: {
        answers: answerSet(questions, pattern.wrong || [], pattern.skip || []),
      },
    });
  }
};

const seed = async () => {
  console.log(`Seeding live API: ${apiBaseUrl}`);

  const teacherSession = await registerOrLogin({
    full_name: 'Demo Teacher',
    email: 'teacher@aptitude.demo',
    role: 'teacher',
  });
  const studentSessions = await Promise.all(
    demoStudents.map((student) => registerOrLogin({ ...student, role: 'student' })),
  );

  const teacherToken = teacherSession.token;

  const [existingExams, existingPyqs, existingQuestions] = await Promise.all([
    request('/exams/teacher', { token: teacherToken }),
    request('/pyq', { token: teacherToken }),
    request('/questions', { token: teacherToken }),
  ]);

  const demoQuestionTexts = new Set([
    ...sampleQuestions.map((question) => question.text),
    ...legacyDemoQuestionTexts,
  ]);

  await deleteMatching(existingExams, (exam) => demoExamTitles.has(exam.title), (exam) => `/exams/teacher/${exam._id}`, teacherToken);
  await deleteMatching(existingPyqs, (pyq) => demoPyqTitles.has(pyq.title), (pyq) => `/pyq/${pyq._id}`, teacherToken);
  await deleteMatching(existingQuestions, (question) => demoQuestionTexts.has(question.text), (question) => `/questions/${question._id}`, teacherToken);

  const questions = await request('/questions', {
    method: 'POST',
    token: teacherToken,
    body: sampleQuestions,
  });

  const byTopic = (topic) => questions.filter((question) => question.topic === topic);

  await createExam(teacherToken, {
    title: 'Live Aptitude Sprint',
    description: 'A balanced live assessment covering quant, reasoning, verbal ability, and data interpretation.',
    duration_minutes: 30,
    instructions: [
      'Answer every question before submitting.',
      'You can review unanswered questions from the side panel.',
      'The test auto-submits when the timer ends.',
    ],
    questions: questions.slice(0, 10).map((question) => question._id),
  }, {
    status: 'live',
    start_time: minutesFromNow(-10),
    end_time: minutesFromNow(50),
  });

  await createExam(teacherToken, {
    title: 'Full Stack Placement Mock',
    description: 'A longer live mock with aptitude, verbal, reasoning, DI, and computer aptitude.',
    duration_minutes: 60,
    instructions: [
      'Treat this like a placement screening round.',
      'Attempt high-confidence questions first.',
      'Submit before the timer ends.',
    ],
    questions: questions.slice(4, 20).map((question) => question._id),
  }, {
    status: 'live',
    start_time: minutesFromNow(-5),
    end_time: minutesFromNow(115),
  });

  await createExam(teacherToken, {
    title: 'Campus Placement Mock - Quant Focus',
    description: 'Scheduled practice test for arithmetic-heavy placement rounds.',
    duration_minutes: 45,
    instructions: [
      'Keep a notebook ready for calculations.',
      'Do not refresh the page during the attempt.',
    ],
    questions: byTopic('Quantitative Aptitude').map((question) => question._id),
  }, {
    status: 'scheduled',
    start_time: minutesFromNow(180),
    end_time: minutesFromNow(225),
  });

  await createExam(teacherToken, {
    title: 'Verbal Ability Evening Drill',
    description: 'A scheduled verbal-only drill for grammar, vocabulary, and paragraph logic.',
    duration_minutes: 25,
    instructions: [
      'Read every option before selecting.',
      'Grammar questions may have close distractors.',
    ],
    questions: byTopic('Verbal Ability').map((question) => question._id),
  }, {
    status: 'scheduled',
    start_time: minutesFromNow(1440),
    end_time: minutesFromNow(1470),
  });

  await createExam(teacherToken, {
    title: 'Draft: Computer Aptitude Mini Test',
    description: 'Draft exam to demonstrate teacher-side editing before publishing.',
    duration_minutes: 15,
    instructions: ['This draft is intentionally unpublished.'],
    questions: byTopic('Computer Aptitude').map((question) => question._id),
  });

  const diagnosticQuestions = questions.slice(2, 12);
  const diagnosticExam = await createExam(teacherToken, {
    title: 'Diagnostic Reasoning Check',
    description: 'Completed baseline test used to populate summaries, ranked results, and analytics.',
    duration_minutes: 30,
    instructions: ['This sample exam demonstrates completed-test analytics.'],
    questions: diagnosticQuestions.map((question) => question._id),
  }, {
    status: 'live',
    start_time: minutesFromNow(-90),
    end_time: minutesFromNow(30),
  });

  await submitForStudents(diagnosticExam, diagnosticQuestions, studentSessions, [
    { wrong: [1, 4], skip: [8] },
    { wrong: [0, 3, 7] },
    { wrong: [2, 5, 6, 8], skip: [9] },
    { wrong: [1], skip: [] },
    { wrong: [0, 2, 4, 6, 8], skip: [3] },
  ]);

  await request(`/exams/teacher/${diagnosticExam._id}/status`, {
    method: 'PUT',
    token: teacherToken,
    body: {
      status: 'completed',
      end_time: minutesFromNow(-45),
    },
  });

  const benchmarkQuestions = questions.slice(6, 18);
  const benchmarkExam = await createExam(teacherToken, {
    title: 'Data Interpretation Benchmark',
    description: 'Completed DI-heavy benchmark with enough submissions to make analytics charts useful.',
    duration_minutes: 35,
    instructions: [
      'Focus on accuracy before speed.',
      'Use ratios and percentages carefully.',
    ],
    questions: benchmarkQuestions.map((question) => question._id),
  }, {
    status: 'live',
    start_time: minutesFromNow(-120),
    end_time: minutesFromNow(30),
  });

  await submitForStudents(benchmarkExam, benchmarkQuestions, studentSessions.slice(1), [
    { wrong: [1, 2] },
    { wrong: [0, 4, 5, 9], skip: [10] },
    { wrong: [3, 7, 8] },
    { wrong: [0, 2, 4, 6, 8, 10], skip: [11] },
  ]);

  await request(`/exams/teacher/${benchmarkExam._id}/status`, {
    method: 'PUT',
    token: teacherToken,
    body: {
      status: 'completed',
      end_time: minutesFromNow(-20),
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
      questions: questions.slice(0, 8).map((question) => question._id),
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
      questions: [...byTopic('Logical Reasoning'), ...byTopic('Data Interpretation')].slice(0, 9).map((question) => question._id),
    },
  });

  await request('/pyq', {
    method: 'POST',
    token: teacherToken,
    body: {
      title: 'Infosys Placement Verbal PYQ',
      year: 2023,
      exam_type: 'Infosys',
      topic: 'Verbal Ability',
      description: 'Vocabulary, grammar, and paragraph-ordering questions for service-company prep.',
      questions: byTopic('Verbal Ability').map((question) => question._id),
    },
  });

  await request('/pyq', {
    method: 'POST',
    token: teacherToken,
    body: {
      title: 'SSC CGL Quant PYQ Pack',
      year: 2022,
      exam_type: 'SSC CGL',
      topic: 'Quantitative Aptitude',
      description: 'Arithmetic and advanced quant questions inspired by government-exam patterns.',
      questions: byTopic('Quantitative Aptitude').map((question) => question._id),
    },
  });

  console.log('Live sample data seeded successfully.');
  console.log(`Teacher login: teacher@aptitude.demo / ${password}`);
  console.log(`Primary student login: student@aptitude.demo / ${password}`);
  console.log(`Additional students: ${demoStudents.slice(1).map((student) => student.email).join(', ')}`);
  console.log('Created 22 questions, 7 exams, 9 submissions, and 4 PYQ sets.');
};

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

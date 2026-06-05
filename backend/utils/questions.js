export const normalizeQuestionInput = (input, userId) => {
  const options = Array.isArray(input.options)
    ? input.options.map((option) => String(option).trim()).filter(Boolean)
    : [];

  return {
    topic: String(input.topic || 'General').trim(),
    subtopic: String(input.subtopic || 'General').trim(),
    difficulty: input.difficulty || 'Medium',
    text: String(input.text || input.question_text || '').trim(),
    options,
    correct_option: String(input.correct_option || input.correct_answer || '').trim(),
    explanation: String(input.explanation || '').trim(),
    created_by: input.created_by || userId,
  };
};

export const validateQuestionPayload = (question) => {
  if (!question.text) return 'Question text is required';
  if (!question.topic) return 'Topic is required';
  if (!question.subtopic) return 'Subtopic is required';
  if (!['Easy', 'Medium', 'Hard'].includes(question.difficulty)) return 'Difficulty must be Easy, Medium, or Hard';
  if (question.options.length < 2) return 'At least two options are required';
  if (!question.correct_option) return 'Correct option is required';
  if (!question.options.includes(question.correct_option)) return 'Correct option must match one of the options';
  return null;
};

export const publicQuestionFields = '-correct_option -explanation';

import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';
import { normalizeQuestionInput, validateQuestionPayload } from '../utils/questions.js';

const questionSchema = {
  type: 'object',
  properties: {
    topic: { type: 'string' },
    subtopic: { type: 'string' },
    difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
    text: { type: 'string' },
    options: {
      type: 'array',
      items: { type: 'string' },
      minItems: 4,
      maxItems: 4,
    },
    correct_option: { type: 'string' },
    explanation: { type: 'string' },
  },
  required: ['topic', 'subtopic', 'difficulty', 'text', 'options', 'correct_option', 'explanation'],
};

const examSchema = {
  type: 'array',
  items: questionSchema,
  minItems: 1,
};

const getClient = () => {
  if (!config.geminiApiKey) {
    throw new Error('Gemini is not configured. Set GEMINI_API_KEY on the backend.');
  }
  return new GoogleGenAI({ apiKey: config.geminiApiKey });
};

const parseResponse = (response) => {
  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty response');
  return JSON.parse(text);
};

const generateStructured = async ({ prompt, schema }) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: config.geminiModel,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0.6,
    },
  });
  return parseResponse(response);
};

export const generateQuestion = async (req, res) => {
  try {
    const { topic, subtopic = 'General', difficulty = 'Medium' } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const generated = await generateStructured({
      schema: questionSchema,
      prompt: [
        `Create one aptitude multiple-choice question for topic "${topic}".`,
        `Subtopic: "${subtopic}". Difficulty: ${difficulty}.`,
        'Use four concise options, one exact correct_option copied from options, and a helpful explanation.',
      ].join('\n'),
    });

    const normalized = normalizeQuestionInput(generated, req.user.id);
    const validationError = validateQuestionPayload(normalized);
    if (validationError) return res.status(422).json({ error: validationError });

    return res.json(normalized);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const generateExam = async (req, res) => {
  try {
    const { topic, subtopic = 'General', difficulty = 'Medium', num_questions: count = 5 } = req.body;
    const numQuestions = Math.max(1, Math.min(Number(count) || 5, 25));
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const generated = await generateStructured({
      schema: examSchema,
      prompt: [
        `Create ${numQuestions} aptitude multiple-choice questions for topic "${topic}".`,
        `Subtopic: "${subtopic}". Difficulty: ${difficulty}.`,
        'Each question must have four options, one exact correct_option copied from options, and a helpful explanation.',
      ].join('\n'),
    });

    const questions = generated.map((item) => normalizeQuestionInput(item, req.user.id));
    const invalid = questions.map(validateQuestionPayload).find(Boolean);
    if (invalid) return res.status(422).json({ error: invalid });

    return res.json(questions);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

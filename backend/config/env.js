import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const requireInProduction = (name) => {
  const value = process.env[name];
  if (isProduction && !value) {
    throw new Error(`${name} is required in production`);
  }
  return value;
};

const validateMongoUri = (value) => {
  if (!value) return value;
  if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
    throw new Error('MONGO_URI must start with mongodb:// or mongodb+srv://');
  }
  return value;
};

const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const localDevOrigins = isProduction ? [] : [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const clientOrigins = Array.from(new Set([
  ...configuredOrigins,
  ...localDevOrigins,
]));

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction,
  port: process.env.PORT || 3001,
  mongoUri: validateMongoUri(requireInProduction('MONGO_URI') || 'mongodb://127.0.0.1:27017/aptitude-platform'),
  jwtSecret: requireInProduction('JWT_SECRET') || 'dev-only-aptitude-secret',
  clientOrigins,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
};

export const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (clientOrigins.includes(origin)) return true;
  if (isProduction) {
    try {
      const { protocol, hostname } = new URL(origin);
      return protocol === 'https:' && hostname.endsWith('.vercel.app');
    } catch {
      return false;
    }
  }
  return false;
};

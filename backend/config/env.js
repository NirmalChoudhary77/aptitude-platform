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

const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction,
  port: process.env.PORT || 3001,
  mongoUri: requireInProduction('MONGO_URI') || 'mongodb://127.0.0.1:27017/aptitude-platform',
  jwtSecret: requireInProduction('JWT_SECRET') || 'dev-only-aptitude-secret',
  clientOrigins,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
};

export const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (clientOrigins.includes(origin)) return true;
  return clientOrigins.some((allowedOrigin) => {
    if (allowedOrigin.includes('*')) {
      const pattern = new RegExp(`^${allowedOrigin.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*')}$`);
      return pattern.test(origin);
    }
    return false;
  });
};

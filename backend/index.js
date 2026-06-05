import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config, isOriginAllowed } from './config/env.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import pyqRoutes from './routes/pyqRoutes.js';
import questionRoutes from './routes/questionRoutes.js';

export const app = express();

app.use(cors({
  origin(origin, callback) {
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: config.env,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pyq', pyqRoutes);

app.use((err, _req, res, _next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }
  return res.status(500).json({ error: 'Server error' });
});

mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(config.port, () => {
      console.log(`Backend server is running on http://localhost:${config.port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

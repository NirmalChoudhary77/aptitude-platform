import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const protect = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ error: 'Not authorized for this action' });
};

export const requireTeacher = requireRole('teacher');
export const requireStudent = requireRole('student');

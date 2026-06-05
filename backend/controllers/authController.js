import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const buildUserPayload = (user) => ({
  id: user._id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
});

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });

export const register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      full_name,
      email,
      password: hashedPassword,
      role: role === 'teacher' ? 'teacher' : 'student',
    });

    await newUser.save();

    res.status(201).json({
      token: signToken(newUser),
      user: buildUserPayload(newUser),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.json({
      token: signToken(user),
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(buildUserPayload(user));
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Server error getting user profile' });
  }
};

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../middleware/AppError.js';

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function signup(req, res) {
  const { name, email, password } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError('name is required', 400);
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new AppError('A valid email is required', 400);
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new AppError('Email already in use', 409);
  }

  const user = await User.create({ name: name.trim(), email, password });
  const token = signToken(user._id.toString());

  res.status(201).json({ token, user: user.toJSON() });
}

export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id.toString());
  res.json({ token, user: user.toJSON() });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).lean();
  if (!user) throw new AppError('User not found', 404);
  res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isFirstLogin: user.isFirstLogin,
    createdAt: user.createdAt,
  });
}

/**
 * PATCH /api/auth/profile
 * Body can contain:
 *   name          — update display name
 *   isFirstLogin  — set to false to mark onboarding complete
 */
export async function updateProfile(req, res) {
  const { name, isFirstLogin } = req.body || {};
  const updates = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new AppError('name must be a non-empty string', 400);
    }
    updates.name = name.trim();
  }

  if (isFirstLogin !== undefined) {
    updates.isFirstLogin = Boolean(isFirstLogin);
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) throw new AppError('User not found', 404);

  res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isFirstLogin: user.isFirstLogin,
    createdAt: user.createdAt,
  });
}

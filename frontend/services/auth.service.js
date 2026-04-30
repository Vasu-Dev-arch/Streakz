import { connectDB } from '../lib/db.js';
import { AppError, signAuthToken } from '../lib/auth.js';
import { User } from '../models/User.js';

export async function signupUser({ name, email, password }) {
  await connectDB();

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError('name is required', 400);
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new AppError('A valid email is required', 400);
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError('Email already in use', 409);
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });

  return { token: signAuthToken(user._id.toString()), user: user.toJSON() };
}

export async function loginUser({ email, password }) {
  await connectDB();

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

  return { token: signAuthToken(user._id.toString()), user: user.toJSON() };
}

export async function getCurrentUserProfile(userId) {
  await connectDB();

  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isFirstLogin: user.isFirstLogin,
    firstHabitPromptShown: user.firstHabitPromptShown ?? false,
    createdAt: user.createdAt,
  };
}

export async function updateCurrentUserProfile(
  userId,
  { name, isFirstLogin, firstHabitPromptShown }
) {
  await connectDB();

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

  if (firstHabitPromptShown !== undefined) {
    updates.firstHabitPromptShown = Boolean(firstHabitPromptShown);
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isFirstLogin: user.isFirstLogin,
    firstHabitPromptShown: user.firstHabitPromptShown ?? false,
    createdAt: user.createdAt,
  };
}

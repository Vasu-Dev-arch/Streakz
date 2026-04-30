import { connectDB } from '../lib/db.js';
import { AppError } from '../lib/auth.js';
import { parseDailyGoal } from '../lib/validation.js';
import { Settings } from '../models/Settings.js';

export async function getSettings(userId) {
  await connectDB();

  let doc = await Settings.findOne({ userId });
  if (!doc) {
    doc = await Settings.create({
      userId,
      dailyGoal: 3,
      reminderTime: null,
      categories: ['study', 'fitness', 'work'],
    });
  }

  return doc.toJSON();
}

export async function updateSettings(userId, body) {
  await connectDB();

  const { dailyGoal, reminderTime, categories } = body || {};
  const updates = {};

  if (dailyGoal !== undefined) {
    updates.dailyGoal = parseDailyGoal(dailyGoal);
  }
  if (reminderTime !== undefined) {
    if (reminderTime !== null && typeof reminderTime !== 'string') {
      throw new AppError('reminderTime must be a string or null', 400);
    }
    updates.reminderTime = reminderTime || null;
  }
  if (categories !== undefined) {
    if (!Array.isArray(categories)) {
      throw new AppError('categories must be an array', 400);
    }
    if (categories.some((c) => typeof c !== 'string' || !c.trim())) {
      throw new AppError('All categories must be non-empty strings', 400);
    }
    updates.categories = categories.map((c) => c.trim());
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const doc = await Settings.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  if (!doc) {
    throw new AppError('Failed to update settings', 500);
  }

  return doc.toJSON();
}

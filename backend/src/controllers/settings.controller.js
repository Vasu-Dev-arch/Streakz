import { Settings } from '../models/Settings.js';
import { parseDailyGoal } from '../utils/validation.js';
import { AppError } from '../middleware/AppError.js';

export async function getSettings(req, res) {
  console.log('Auth Debug - req.user:', req.user);
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authorized, user data missing' });
  }
  let doc = await Settings.findOne({ userId: req.user.id });
  if (!doc) {
    doc = await Settings.create({
      userId: req.user.id,
      dailyGoal: 3,
      reminderTime: null,
    });
  }
  res.json(doc.toJSON());
}

export async function updateSettings(req, res) {
  console.log('Auth Debug - req.user:', req.user);
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authorized, user data missing' });
  }
  const { dailyGoal, reminderTime } = req.body || {};
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

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const doc = await Settings.findOneAndUpdate(
    { userId: req.user.id },
    { $set: updates },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  if (!doc) throw new AppError('Failed to update settings', 500);
  res.json(doc.toJSON());
}

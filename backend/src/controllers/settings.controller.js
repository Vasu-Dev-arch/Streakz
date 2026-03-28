import { Settings } from '../models/Settings.js';
import { parseDailyGoal } from '../utils/validation.js';
import { AppError } from '../middleware/AppError.js';

const DEFAULT_KEY = 'default';

export async function getSettings(_req, res) {
  let doc = await Settings.findOne({ key: DEFAULT_KEY });
  if (!doc) {
    doc = await Settings.create({
      key: DEFAULT_KEY,
      dailyGoal: 3,
      reminderTime: null,
    });
  }
  res.json(doc.toJSON());
}

export async function updateSettings(req, res) {
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
    { key: DEFAULT_KEY },
    { $set: updates },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  if (!doc) {
    throw new AppError('Failed to update settings', 500);
  }

  res.json(doc.toJSON());
}

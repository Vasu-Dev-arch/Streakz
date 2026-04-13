import { Completion } from '../models/Completion.js';
import { Habit } from '../models/Habit.js';
import { AppError } from '../middleware/AppError.js';
import {
  assertObjectId,
  assertDateString,
  assertAllowedPastDate,
} from '../utils/validation.js';

export async function listCompletions(req, res) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authorized, user data missing' });
  }
  const docs = await Completion.find({ userId: req.user.id })
    .sort({ date: 1 })
    .lean();
  const mapped = docs.map((c) => ({
    id: c._id.toString(),
    date: c.date,
    habitIds: (c.habitIds || []).map((id) => id.toString()),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
  res.json(mapped);
}

/**
 * Toggle habit completion for a date: remove if present, else add.
 * Body: { date: "YYYY-MM-DD", habitId: "<ObjectId>" }
 *
 * Date validation rules:
 *   - Must be a valid YYYY-MM-DD string
 *   - Cannot be in the future
 *   - Cannot be more than 2 days in the past
 */
export async function toggleCompletion(req, res) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authorized, user data missing' });
  }

  const { date, habitId } = req.body || {};

  // Validate date format first, then allowed range
  assertDateString(date);
  assertAllowedPastDate(date);

  if (!habitId || typeof habitId !== 'string') {
    throw new AppError('habitId is required', 400);
  }
  assertObjectId(habitId, 'habitId');

  // Ensure the habit belongs to this user
  const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  const existing = await Completion.findOne({
    userId: req.user.id,
    date,
  }).lean();
  const ids = (existing?.habitIds || []).map((id) => id.toString());
  const has = ids.includes(habitId);

  if (has) {
    await Completion.findOneAndUpdate(
      { userId: req.user.id, date },
      { $pull: { habitIds: habit._id } },
      { new: true }
    );
  } else {
    await Completion.findOneAndUpdate(
      { userId: req.user.id, date },
      {
        $setOnInsert: { userId: req.user.id, date },
        $addToSet: { habitIds: habit._id },
      },
      { upsert: true, new: true, runValidators: true }
    );
  }

  const updated = await Completion.findOne({ userId: req.user.id, date });
  if (!updated) {
    throw new AppError('Failed to update completion', 500);
  }
  res.json(updated.toJSON());
}

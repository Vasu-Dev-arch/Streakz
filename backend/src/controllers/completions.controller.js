import { Completion } from '../models/Completion.js';
import { Habit } from '../models/Habit.js';
import { AppError } from '../middleware/AppError.js';
import { assertObjectId, assertDateString } from '../utils/validation.js';

export async function listCompletions(_req, res) {
  const docs = await Completion.find().sort({ date: 1 }).lean();
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
 */
export async function toggleCompletion(req, res) {
  const { date, habitId } = req.body || {};
  assertDateString(date);
  if (habitId === undefined || habitId === null) {
    throw new AppError('habitId is required', 400);
  }
  if (typeof habitId !== 'string') {
    throw new AppError('habitId must be a string', 400);
  }
  assertObjectId(habitId, 'habitId');

  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  const existing = await Completion.findOne({ date }).lean();
  const ids = (existing?.habitIds || []).map((id) => id.toString());
  const has = ids.includes(habitId);

  if (has) {
    await Completion.findOneAndUpdate(
      { date },
      { $pull: { habitIds: habit._id } },
      { new: true }
    );
  } else {
    await Completion.findOneAndUpdate(
      { date },
      { $setOnInsert: { date }, $addToSet: { habitIds: habit._id } },
      { upsert: true, new: true, runValidators: true }
    );
  }

  const updated = await Completion.findOne({ date });
  if (!updated) {
    throw new AppError('Failed to update completion', 500);
  }
  res.json(updated.toJSON());
}

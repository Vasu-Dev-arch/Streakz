import { connectDB } from '../lib/db.js';
import { AppError } from '../lib/auth.js';
import {
  assertAllowedPastDate,
  assertDateString,
  assertObjectId,
} from '../lib/validation.js';
import { Completion } from '../models/Completion.js';
import { Habit } from '../models/Habit.js';

export async function listCompletions(userId) {
  await connectDB();

  const docs = await Completion.find({ userId }).sort({ date: 1 }).lean();
  return docs.map((c) => ({
    id: c._id.toString(),
    date: c.date,
    habitIds: (c.habitIds || []).map((id) => id.toString()),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export async function toggleCompletion(userId, { date, habitId }) {
  await connectDB();

  assertDateString(date);
  assertAllowedPastDate(date);

  if (!habitId || typeof habitId !== 'string') {
    throw new AppError('habitId is required', 400);
  }
  if (habitId.startsWith('temp-')) {
    throw new AppError('Invalid habitId - habit was not yet synced to server', 400);
  }

  assertObjectId(habitId, 'habitId');

  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  const existing = await Completion.findOne({ userId, date }).lean();
  const ids = (existing?.habitIds || []).map((id) => id.toString());
  const has = ids.includes(habitId);

  if (has) {
    await Completion.findOneAndUpdate(
      { userId, date },
      { $pull: { habitIds: habit._id } },
      { new: true }
    );
  } else {
    await Completion.findOneAndUpdate(
      { userId, date },
      {
        $setOnInsert: { userId, date },
        $addToSet: { habitIds: habit._id },
      },
      { upsert: true, new: true, runValidators: true }
    );
  }

  const updated = await Completion.findOne({ userId, date });
  if (!updated) {
    throw new AppError('Failed to update completion', 500);
  }

  return updated.toJSON();
}

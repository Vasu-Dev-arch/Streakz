import { connectDB } from '../lib/db.js';
import { AppError } from '../lib/auth.js';
import { assertObjectId, validateHabitBody } from '../lib/validation.js';
import { Completion } from '../models/Completion.js';
import { Habit } from '../models/Habit.js';

export async function listHabits(userId) {
  await connectDB();

  const habits = await Habit.find({ userId }).sort({ createdAt: 1 }).lean();
  return habits.map((h) => ({
    id: h._id.toString(),
    name: h.name,
    description: h.description ?? '',
    emoji: h.emoji,
    icon: h.icon ?? '',
    color: h.color,
    category: h.category,
    frequencyType: h.frequencyType ?? 'daily',
    daysOfWeek: h.daysOfWeek ?? [],
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  }));
}

export async function createHabit(userId, body) {
  await connectDB();
  validateHabitBody(body, false);

  const { name, emoji, icon, color, category, description, frequencyType, daysOfWeek } =
    body;

  if (!category || typeof category !== 'string' || !category.trim()) {
    throw new AppError('category is required', 400);
  }

  const habit = await Habit.create({
    userId,
    name: name.trim(),
    description: description ? description.trim() : '',
    emoji: emoji ?? '',
    icon: icon ?? '',
    color: color ?? '#22c97a',
    category: category.trim(),
    frequencyType: frequencyType ?? 'daily',
    daysOfWeek: daysOfWeek ?? [],
  });

  return habit.toJSON();
}

export async function updateHabit(userId, id, body) {
  await connectDB();
  assertObjectId(id, 'habit id');
  validateHabitBody(body, true);

  const updates = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined) updates.description = body.description.trim();
  if (body.emoji !== undefined) updates.emoji = body.emoji;
  if (body.icon !== undefined) updates.icon = body.icon;
  if (body.color !== undefined) updates.color = body.color;
  if (body.category !== undefined) updates.category = body.category.trim();
  if (body.frequencyType !== undefined) updates.frequencyType = body.frequencyType;
  if (body.daysOfWeek !== undefined) updates.daysOfWeek = body.daysOfWeek;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const habit = await Habit.findOneAndUpdate({ _id: id, userId }, updates, {
    new: true,
    runValidators: true,
  });

  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  return habit.toJSON();
}

export async function deleteHabit(userId, id) {
  await connectDB();
  assertObjectId(id, 'habit id');

  const habit = await Habit.findOneAndDelete({ _id: id, userId });
  if (!habit) {
    return;
  }

  await Completion.updateMany({ userId }, { $pull: { habitIds: habit._id } });
}

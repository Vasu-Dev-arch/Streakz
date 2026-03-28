import { Habit } from '../models/Habit.js';
import { Completion } from '../models/Completion.js';
import { AppError } from '../middleware/AppError.js';
import { assertObjectId, validateHabitBody } from '../utils/validation.js';

export async function listHabits(_req, res) {
  const habits = await Habit.find().sort({ createdAt: 1 }).lean();
  const mapped = habits.map((h) => ({
    id: h._id.toString(),
    name: h.name,
    emoji: h.emoji,
    color: h.color,
    category: h.category,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  }));
  res.json(mapped);
}

export async function createHabit(req, res) {
  validateHabitBody(req.body, false);
  const { name, emoji, color, category } = req.body;
  const habit = await Habit.create({
    name: name.trim(),
    emoji: emoji ?? '',
    color: color ?? '#22c97a',
    category,
  });
  res.status(201).json(habit.toJSON());
}

export async function updateHabit(req, res) {
  assertObjectId(req.params.id, 'habit id');
  validateHabitBody(req.body, true);

  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.emoji !== undefined) updates.emoji = req.body.emoji;
  if (req.body.color !== undefined) updates.color = req.body.color;
  if (req.body.category !== undefined) updates.category = req.body.category;

  const habit = await Habit.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }
  res.json(habit.toJSON());
}

export async function deleteHabit(req, res) {
  assertObjectId(req.params.id, 'habit id');
  const habit = await Habit.findByIdAndDelete(req.params.id);
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }
  await Completion.updateMany({}, { $pull: { habitIds: habit._id } });
  res.status(204).send();
}

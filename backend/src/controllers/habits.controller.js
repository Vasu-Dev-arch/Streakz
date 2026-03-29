import { Habit } from '../models/Habit.js';
import { Completion } from '../models/Completion.js';
import { AppError } from '../middleware/AppError.js';
import { assertObjectId, validateHabitBody } from '../utils/validation.js';

export async function listHabits(req, res) {
  console.log('Auth Debug - req.user:', req.user);
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authorized, user data missing' });
  }
  const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: 1 }).lean();
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
  console.log('Auth Debug - req.user:', req.user);
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authorized, user data missing' });
  }
  validateHabitBody(req.body, false);
  const { name, emoji, color, category } = req.body;
  const habit = await Habit.create({
    userId: req.user.id,
    name: name.trim(),
    emoji: emoji ?? '',
    color: color ?? '#22c97a',
    category,
  });
  res.status(201).json(habit.toJSON());
}

export async function updateHabit(req, res) {
  console.log('Auth Debug - req.user:', req.user);
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authorized, user data missing' });
  }
  assertObjectId(req.params.id, 'habit id');
  validateHabitBody(req.body, true);

  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.emoji !== undefined) updates.emoji = req.body.emoji;
  if (req.body.color !== undefined) updates.color = req.body.color;
  if (req.body.category !== undefined) updates.category = req.body.category;

  // userId filter ensures users can only edit their own habits
  const habit = await Habit.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    updates,
    { new: true, runValidators: true }
  );
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }
  res.json(habit.toJSON());
}

export async function deleteHabit(req, res) {
  console.log('Auth Debug - req.user:', req.user);
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authorized, user data missing' });
  }
  assertObjectId(req.params.id, 'habit id');
  const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }
  // Remove from this user's completion docs only
  await Completion.updateMany(
    { userId: req.user.id },
    { $pull: { habitIds: habit._id } }
  );
  res.status(204).send();
}

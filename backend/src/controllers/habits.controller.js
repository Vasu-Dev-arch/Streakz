import { Habit } from '../models/Habit.js';
import { Completion } from '../models/Completion.js';
import { AppError } from '../middleware/AppError.js';
import { assertObjectId, validateHabitBody } from '../utils/validation.js';

export async function listHabits(req, res) {
  // auth middleware already guarantees req.user exists; this is a safety net
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Not authorized' });
  }
  const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: 1 }).lean();
  const mapped = habits.map((h) => ({
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
  res.json(mapped);
}

export async function createHabit(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Not authorized' });
  }

  // Validate before touching the DB — throws AppError (400) on bad input
  validateHabitBody(req.body, false);

  const {
    name,
    emoji,
    icon,
    color,
    category,
    description,
    frequencyType,
    daysOfWeek,
  } = req.body;

  // Extra guard: category is required and must not exceed model limit
  if (!category || typeof category !== 'string' || !category.trim()) {
    throw new AppError('category is required', 400);
  }

  const habit = await Habit.create({
    userId: req.user.id,
    name: name.trim(),
    description: description ? description.trim() : '',
    emoji: emoji ?? '',
    icon: icon ?? '',
    color: color ?? '#22c97a',
    category: category.trim(),
    frequencyType: frequencyType ?? 'daily',
    daysOfWeek: daysOfWeek ?? [],
  });

  // 201 with the clean JSON shape (id, no _id/userId)
  res.status(201).json(habit.toJSON());
}

export async function updateHabit(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Not authorized' });
  }

  // Will throw AppError(400) for invalid ObjectId strings (e.g. "temp-*")
  assertObjectId(req.params.id, 'habit id');
  validateHabitBody(req.body, true);

  const updates = {};
  if (req.body.name !== undefined)          updates.name          = req.body.name.trim();
  if (req.body.description !== undefined)   updates.description   = req.body.description.trim();
  if (req.body.emoji !== undefined)         updates.emoji         = req.body.emoji;
  if (req.body.icon !== undefined)          updates.icon          = req.body.icon;
  if (req.body.color !== undefined)         updates.color         = req.body.color;
  if (req.body.category !== undefined)      updates.category      = req.body.category.trim();
  if (req.body.frequencyType !== undefined) updates.frequencyType = req.body.frequencyType;
  if (req.body.daysOfWeek !== undefined)    updates.daysOfWeek    = req.body.daysOfWeek;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

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
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Not authorized' });
  }

  assertObjectId(req.params.id, 'habit id');

  const habit = await Habit.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!habit) {
    // Already deleted (idempotent sync retry) — treat as success
    return res.status(204).send();
  }

  // Remove the habit from all completion records for this user
  await Completion.updateMany(
    { userId: req.user.id },
    { $pull: { habitIds: habit._id } }
  );

  res.status(204).send();
}

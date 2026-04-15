import { Goal } from '../models/Goal.js';
import { AppError } from '../middleware/AppError.js';
import { assertObjectId } from '../utils/validation.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Derive status from current progress + deadline.
 * Called after every progress update or on list to keep statuses fresh.
 */
function deriveStatus(goal) {
  if (goal.progressType === 'count') {
    if (goal.currentValue >= goal.targetValue) return 'completed';
  } else {
    if (goal.progress >= 100) return 'completed';
  }
  const today = localDateKey();
  if (goal.deadline < today) return 'overdue';
  return 'active';
}

function validateGoalBody(body, partial = false) {
  const { title, description, deadline, priority, progressType, targetValue } = body || {};

  if (!partial) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new AppError('title is required', 400);
    }
    if (!deadline || typeof deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      throw new AppError('deadline must be YYYY-MM-DD', 400);
    }
    if (!progressType || !['count', 'percentage'].includes(progressType)) {
      throw new AppError('progressType must be "count" or "percentage"', 400);
    }
    if (progressType === 'count') {
      const tv = Number(targetValue);
      if (!targetValue || !Number.isFinite(tv) || tv <= 0) {
        throw new AppError('targetValue must be a positive number for count goals', 400);
      }
    }
  }

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    throw new AppError('title must be a non-empty string', 400);
  }
  if (deadline !== undefined && (typeof deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(deadline))) {
    throw new AppError('deadline must be YYYY-MM-DD', 400);
  }
  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    throw new AppError('priority must be low, medium, or high', 400);
  }
  if (description !== undefined && typeof description !== 'string') {
    throw new AppError('description must be a string', 400);
  }
  if (description !== undefined && description.length > 1000) {
    throw new AppError('description cannot exceed 1000 characters', 400);
  }
}

// ── Handlers ─────────────────────────────────────────────────────────────────

/**
 * GET /api/goals
 * Returns all goals for the user, sorted by deadline asc then createdAt asc.
 * Refreshes overdue status on read without a separate cron.
 */
export async function listGoals(req, res) {
  const goals = await Goal.find({ userId: req.user.id }).sort({ deadline: 1, createdAt: 1 }).lean();

  const today = localDateKey();
  const mapped = goals.map((g) => {
    // Recompute status on every read so overdue is always accurate
    let status = g.status;
    if (status !== 'completed') {
      if (g.progressType === 'count' && g.currentValue >= g.targetValue) {
        status = 'completed';
      } else if (g.progressType === 'percentage' && g.progress >= 100) {
        status = 'completed';
      } else if (g.deadline < today) {
        status = 'overdue';
      } else {
        status = 'active';
      }
    }
    return {
      id: g._id.toString(),
      title: g.title,
      description: g.description ?? '',
      deadline: g.deadline,
      priority: g.priority,
      progressType: g.progressType,
      targetValue: g.targetValue ?? null,
      currentValue: g.currentValue ?? 0,
      progress: g.progress ?? 0,
      status,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    };
  });

  res.json(mapped);
}

/**
 * POST /api/goals
 */
export async function createGoal(req, res) {
  validateGoalBody(req.body, false);

  const { title, description = '', deadline, priority = 'medium', progressType, targetValue } = req.body;

  const goal = await Goal.create({
    userId: req.user.id,
    title: title.trim(),
    description: description.trim(),
    deadline,
    priority,
    progressType,
    targetValue: progressType === 'count' ? Number(targetValue) : null,
    currentValue: 0,
    progress: 0,
    status: 'active',
  });

  res.status(201).json(goal.toJSON());
}

/**
 * PATCH /api/goals/:id
 * Update metadata (title, description, deadline, priority).
 * Does NOT update progress — use the /progress endpoint for that.
 */
export async function updateGoal(req, res) {
  assertObjectId(req.params.id, 'goal id');
  validateGoalBody(req.body, true);

  const updates = {};
  const { title, description, deadline, priority } = req.body;
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description.trim();
  if (deadline !== undefined) updates.deadline = deadline;
  if (priority !== undefined) updates.priority = priority;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!goal) throw new AppError('Goal not found', 404);

  // Re-derive status after potential deadline change
  const newStatus = deriveStatus(goal);
  if (newStatus !== goal.status) {
    goal.status = newStatus;
    await goal.save();
  }

  res.json(goal.toJSON());
}

/**
 * PATCH /api/goals/:id/progress
 * Body for count:      { currentValue: number }
 * Body for percentage: { progress: number (0–100) }
 */
export async function updateProgress(req, res) {
  assertObjectId(req.params.id, 'goal id');

  const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
  if (!goal) throw new AppError('Goal not found', 404);

  if (goal.progressType === 'count') {
    const { currentValue } = req.body;
    if (currentValue === undefined || !Number.isFinite(Number(currentValue)) || Number(currentValue) < 0) {
      throw new AppError('currentValue must be a non-negative number', 400);
    }
    goal.currentValue = Number(currentValue);
  } else {
    const { progress } = req.body;
    if (progress === undefined || !Number.isFinite(Number(progress))) {
      throw new AppError('progress must be a number', 400);
    }
    const clamped = Math.max(0, Math.min(100, Number(progress)));
    goal.progress = clamped;
  }

  goal.status = deriveStatus(goal);
  await goal.save();

  res.json(goal.toJSON());
}

/**
 * DELETE /api/goals/:id
 */
export async function deleteGoal(req, res) {
  assertObjectId(req.params.id, 'goal id');
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!goal) throw new AppError('Goal not found', 404);
  res.status(204).send();
}

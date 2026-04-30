import { connectDB } from '../lib/db.js';
import { AppError } from '../lib/auth.js';
import { assertObjectId } from '../lib/validation.js';
import { Goal } from '../models/Goal.js';

function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function deriveStatus(goal) {
  if (goal.progressType === 'count') {
    if (goal.currentValue >= goal.targetValue) return 'completed';
  } else if (goal.progress >= 100) {
    return 'completed';
  }

  return goal.deadline < localDateKey() ? 'overdue' : 'active';
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

export async function listGoals(userId) {
  await connectDB();

  const goals = await Goal.find({ userId }).sort({ deadline: 1, createdAt: 1 }).lean();
  const today = localDateKey();

  return goals.map((g) => {
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
}

export async function createGoal(userId, body) {
  await connectDB();
  validateGoalBody(body, false);

  const {
    title,
    description = '',
    deadline,
    priority = 'medium',
    progressType,
    targetValue,
  } = body;

  const goal = await Goal.create({
    userId,
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

  return goal.toJSON();
}

export async function updateGoal(userId, id, body) {
  await connectDB();
  assertObjectId(id, 'goal id');
  validateGoalBody(body, true);

  const updates = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.description !== undefined) updates.description = body.description.trim();
  if (body.deadline !== undefined) updates.deadline = body.deadline;
  if (body.priority !== undefined) updates.priority = body.priority;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const goal = await Goal.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!goal) {
    throw new AppError('Goal not found', 404);
  }

  const nextStatus = deriveStatus(goal);
  if (nextStatus !== goal.status) {
    goal.status = nextStatus;
    await goal.save();
  }

  return goal.toJSON();
}

export async function updateGoalProgress(userId, id, body) {
  await connectDB();
  assertObjectId(id, 'goal id');

  const goal = await Goal.findOne({ _id: id, userId });
  if (!goal) {
    throw new AppError('Goal not found', 404);
  }

  if (goal.progressType === 'count') {
    const { currentValue } = body;
    if (
      currentValue === undefined ||
      !Number.isFinite(Number(currentValue)) ||
      Number(currentValue) < 0
    ) {
      throw new AppError('currentValue must be a non-negative number', 400);
    }
    goal.currentValue = Number(currentValue);
  } else {
    const { progress } = body;
    if (progress === undefined || !Number.isFinite(Number(progress))) {
      throw new AppError('progress must be a number', 400);
    }
    goal.progress = Math.max(0, Math.min(100, Number(progress)));
  }

  goal.status = deriveStatus(goal);
  await goal.save();

  return goal.toJSON();
}

export async function deleteGoal(userId, id) {
  await connectDB();
  assertObjectId(id, 'goal id');

  const goal = await Goal.findOneAndDelete({ _id: id, userId });
  if (!goal) {
    throw new AppError('Goal not found', 404);
  }
}

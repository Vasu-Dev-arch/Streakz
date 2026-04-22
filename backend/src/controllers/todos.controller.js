import { Todo } from '../models/Todo.js';
import { AppError } from '../middleware/AppError.js';
import { assertObjectId } from '../utils/validation.js';

// ── Validation ────────────────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateTodoBody(body, partial = false) {
  const { title, category, priority, deadline } = body || {};

  if (!partial) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new AppError('title is required', 400);
    }
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim())
      throw new AppError('title must be a non-empty string', 400);
    if (title.trim().length > 300)
      throw new AppError('title cannot exceed 300 characters', 400);
  }

  if (category !== undefined && typeof category !== 'string')
    throw new AppError('category must be a string', 400);
  if (category !== undefined && category.trim().length > 50)
    throw new AppError('category cannot exceed 50 characters', 400);

  if (priority !== undefined && !['high', 'medium', 'low'].includes(priority))
    throw new AppError('priority must be high, medium, or low', 400);

  if (deadline !== undefined && deadline !== null && deadline !== '') {
    if (!DATE_RE.test(deadline))
      throw new AppError('deadline must be YYYY-MM-DD', 400);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapTodo(t) {
  return {
    id: t._id ? t._id.toString() : t.id,
    title: t.title,
    category: t.category ?? '',
    priority: t.priority,
    completed: t.completed,
    deadline: t.deadline ?? null,
    order: t.order,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

// ── Controllers ───────────────────────────────────────────────────────────────

export async function listTodos(req, res) {
  if (!req.user?.id) return res.status(401).json({ error: 'Not authorized' });

  const todos = await Todo.find({ userId: req.user.id })
    .sort({ completed: 1, order: 1, createdAt: 1 })
    .lean();

  res.json(todos.map(mapTodo));
}

export async function createTodo(req, res) {
  if (!req.user?.id) return res.status(401).json({ error: 'Not authorized' });

  validateTodoBody(req.body, false);

  const { title, category, priority, deadline, order } = req.body;

  const todo = await Todo.create({
    userId: req.user.id,
    title: title.trim(),
    category: category ? category.trim() : '',
    priority: priority ?? 'medium',
    completed: false,
    deadline: deadline || null,
    order: typeof order === 'number' ? order : 0,
  });

  res.status(201).json(todo.toJSON());
}

export async function updateTodo(req, res) {
  if (!req.user?.id) return res.status(401).json({ error: 'Not authorized' });

  assertObjectId(req.params.id, 'todo id');
  validateTodoBody(req.body, true);

  const updates = {};
  if (req.body.title    !== undefined) updates.title    = req.body.title.trim();
  if (req.body.category !== undefined) updates.category = req.body.category.trim();
  if (req.body.priority !== undefined) updates.priority = req.body.priority;
  if (req.body.order    !== undefined) updates.order    = req.body.order;
  // Allow explicit null / '' to clear deadline
  if ('deadline' in req.body) updates.deadline = req.body.deadline || null;

  if (Object.keys(updates).length === 0)
    throw new AppError('No valid fields to update', 400);

  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    updates,
    { new: true, runValidators: true }
  );

  if (!todo) throw new AppError('Todo not found', 404);
  res.json(todo.toJSON());
}

export async function toggleTodo(req, res) {
  if (!req.user?.id) return res.status(401).json({ error: 'Not authorized' });

  assertObjectId(req.params.id, 'todo id');

  const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
  if (!todo) throw new AppError('Todo not found', 404);

  todo.completed = !todo.completed;
  await todo.save();

  res.json(todo.toJSON());
}

export async function deleteTodo(req, res) {
  if (!req.user?.id) return res.status(401).json({ error: 'Not authorized' });

  assertObjectId(req.params.id, 'todo id');

  await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.status(204).send();
}

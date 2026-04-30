import { connectDB } from '../lib/db.js';
import { AppError } from '../lib/auth.js';
import { assertObjectId } from '../lib/validation.js';
import { Todo } from '../models/Todo.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateTodoBody(body, partial = false) {
  const { title, category, priority, deadline } = body || {};

  if (!partial) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new AppError('title is required', 400);
    }
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      throw new AppError('title must be a non-empty string', 400);
    }
    if (title.trim().length > 300) {
      throw new AppError('title cannot exceed 300 characters', 400);
    }
  }

  if (category !== undefined && typeof category !== 'string') {
    throw new AppError('category must be a string', 400);
  }
  if (category !== undefined && category.trim().length > 50) {
    throw new AppError('category cannot exceed 50 characters', 400);
  }

  if (priority !== undefined && !['high', 'medium', 'low'].includes(priority)) {
    throw new AppError('priority must be high, medium, or low', 400);
  }

  if (deadline !== undefined && deadline !== null && deadline !== '' && !DATE_RE.test(deadline)) {
    throw new AppError('deadline must be YYYY-MM-DD', 400);
  }
}

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

export async function listTodos(userId) {
  await connectDB();

  const todos = await Todo.find({ userId })
    .sort({ completed: 1, order: 1, createdAt: 1 })
    .lean();

  return todos.map(mapTodo);
}

export async function createTodo(userId, body) {
  await connectDB();
  validateTodoBody(body, false);

  const { title, category, priority, deadline, order } = body;
  const todo = await Todo.create({
    userId,
    title: title.trim(),
    category: category ? category.trim() : '',
    priority: priority ?? 'medium',
    completed: false,
    deadline: deadline || null,
    order: typeof order === 'number' ? order : 0,
  });

  return todo.toJSON();
}

export async function updateTodo(userId, id, body) {
  await connectDB();
  assertObjectId(id, 'todo id');
  validateTodoBody(body, true);

  const updates = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.category !== undefined) updates.category = body.category.trim();
  if (body.priority !== undefined) updates.priority = body.priority;
  if (body.order !== undefined) updates.order = body.order;
  if ('deadline' in body) updates.deadline = body.deadline || null;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const todo = await Todo.findOneAndUpdate({ _id: id, userId }, updates, {
    new: true,
    runValidators: true,
  });

  if (!todo) {
    throw new AppError('Todo not found', 404);
  }

  return todo.toJSON();
}

export async function toggleTodo(userId, id) {
  await connectDB();
  assertObjectId(id, 'todo id');

  const todo = await Todo.findOne({ _id: id, userId });
  if (!todo) {
    throw new AppError('Todo not found', 404);
  }

  todo.completed = !todo.completed;
  await todo.save();
  return todo.toJSON();
}

export async function deleteTodo(userId, id) {
  await connectDB();
  assertObjectId(id, 'todo id');
  await Todo.findOneAndDelete({ _id: id, userId });
}

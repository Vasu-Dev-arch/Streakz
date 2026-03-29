import mongoose from 'mongoose';
import { DATE_REGEX } from '../models/Completion.js';
import { AppError } from '../middleware/AppError.js';

export function assertObjectId(id, label = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
}

export function assertDateString(date) {
  if (!date || typeof date !== 'string' || !DATE_REGEX.test(date)) {
    throw new AppError('date must be YYYY-MM-DD', 400);
  }
}

export function parseDailyGoal(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 20) {
    throw new AppError('dailyGoal must be a number between 1 and 20', 400);
  }
  return Math.floor(n);
}

/**
 * @param {Record<string, unknown>} body
 * @param {boolean} partial - PUT: only validate fields that are present
 */
export function validateHabitBody(body, partial = false) {
  const { name, emoji, color, category } = body || {};

  if (!partial) {
    if (name === undefined || typeof name !== 'string' || !name.trim()) {
      throw new AppError('name is required', 400);
    }
    if (category === undefined || typeof category !== 'string' || !category.trim()) {
      throw new AppError('category is required', 400);
    }
    if (category.trim().length > 50) {
      throw new AppError('Category name cannot exceed 50 characters', 400);
    }
  }

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    throw new AppError('name must be a non-empty string', 400);
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || !category.trim()) {
      throw new AppError('category must be a non-empty string', 400);
    }
    if (category.trim().length > 50) {
      throw new AppError('Category name cannot exceed 50 characters', 400);
    }
  }

  if (emoji !== undefined && typeof emoji !== 'string') {
    throw new AppError('emoji must be a string', 400);
  }

  if (color !== undefined && typeof color !== 'string') {
    throw new AppError('color must be a string', 400);
  }
}

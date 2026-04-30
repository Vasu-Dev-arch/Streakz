/**
 * lib/validation.js
 * Shared validation helpers — identical logic to the old backend utils/validation.js.
 * Import paths updated to work from the unified Next.js project root.
 */

import mongoose from 'mongoose';
import { DATE_REGEX } from '../models/Completion.js';
import { AppError } from './auth.js';

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

/**
 * Assert that a date string is within the allowed past-completion window.
 *
 * Rules:
 *   - Today          → always allowed
 *   - Yesterday      → allowed
 *   - Day before     → allowed  (maxDaysBack = 2)
 *   - Anything older → rejected with 400
 *   - Future dates   → rejected with 400
 */
export function assertAllowedPastDate(date, maxDaysBack = 2) {
  const now = new Date();
  const todayStr = _localDateKey(now);

  const earliest = new Date(now);
  earliest.setDate(now.getDate() - maxDaysBack);
  const earliestStr = _localDateKey(earliest);

  if (date > todayStr) {
    throw new AppError('Cannot mark completions for future dates', 400);
  }
  if (date < earliestStr) {
    throw new AppError(
      `Can only mark completions up to ${maxDaysBack} days in the past`,
      400
    );
  }
}

function _localDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
 * @param {boolean} partial - true for PATCH/PUT (only validate present fields)
 */
export function validateHabitBody(body, partial = false) {
  const { name, emoji, icon, color, category, description, frequencyType, daysOfWeek } =
    body || {};

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

  if (icon !== undefined && typeof icon !== 'string') {
    throw new AppError('icon must be a string', 400);
  }

  if (color !== undefined && typeof color !== 'string') {
    throw new AppError('color must be a string', 400);
  }

  if (description !== undefined && typeof description !== 'string') {
    throw new AppError('description must be a string', 400);
  }

  if (description !== undefined && description.length > 500) {
    throw new AppError('description cannot exceed 500 characters', 400);
  }

  if (frequencyType !== undefined) {
    if (!['daily', 'weekly'].includes(frequencyType)) {
      throw new AppError('frequencyType must be "daily" or "weekly"', 400);
    }
  }

  if (daysOfWeek !== undefined) {
    if (!Array.isArray(daysOfWeek)) {
      throw new AppError('daysOfWeek must be an array', 400);
    }
    if (daysOfWeek.some((d) => typeof d !== 'number' || d < 0 || d > 6)) {
      throw new AppError('daysOfWeek values must be numbers between 0 and 6', 400);
    }
  }

  if (
    frequencyType === 'weekly' &&
    daysOfWeek !== undefined &&
    daysOfWeek.length === 0
  ) {
    throw new AppError(
      'daysOfWeek must have at least one day when frequencyType is weekly',
      400
    );
  }
}

import { Journal } from '../models/Journal.js';
import { AppError } from '../middleware/AppError.js';
import { assertDateString } from '../utils/validation.js';

/**
 * Returns the local YYYY-MM-DD string for a given UTC offset.
 * We compute "today" and "yesterday" server-side using the same
 * logic as the client so the allowed window is consistent.
 */
function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Validate that the requested date is today or yesterday.
 * "Late-night" scenario: yesterday is always allowed so users can
 * log the previous day after midnight.
 */
function assertAllowedJournalDate(date) {
  const now = new Date();
  const todayStr = localDateKey(now);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = localDateKey(yesterday);

  if (date > todayStr) {
    throw new AppError('Cannot create a journal entry for future dates', 400);
  }
  if (date < yesterdayStr) {
    throw new AppError('Journal entries can only be created for today or yesterday', 400);
  }
}

/**
 * GET /api/journal?date=YYYY-MM-DD
 * Returns the entry for the given date, or 404 if none exists.
 */
export async function getEntry(req, res) {
  const { date } = req.query;

  if (!date) {
    // Default to today
    const today = localDateKey();
    const entry = await Journal.findOne({ userId: req.user.id, date: today });
    return res.json(entry ? entry.toJSON() : null);
  }

  assertDateString(date);

  const entry = await Journal.findOne({ userId: req.user.id, date });
  if (!entry) return res.json(null);
  res.json(entry.toJSON());
}

export async function getHistory(req, res) {
  const yesterdayStr = localDateKey(1);

  const entries = await Journal.find({
    userId: req.user.id,
    date: { $lt: yesterdayStr },
  })
    .sort({ date: -1 })
    .select('date title content')
    .lean();

  res.json(entries);
}

/**
 * POST /api/journal
 * Body: { date, title?, content }
 * Upserts: updates an existing entry if one exists for that date,
 * otherwise creates a new one.
 */
export async function upsertEntry(req, res) {
  const { date, title = '', content } = req.body || {};

  if (!date) throw new AppError('date is required', 400);
  assertDateString(date);
  assertAllowedJournalDate(date);

  if (!content || typeof content !== 'string' || !content.trim()) {
    throw new AppError('content is required', 400);
  }
  if (typeof title !== 'string') {
    throw new AppError('title must be a string', 400);
  }
  if (title.length > 200) {
    throw new AppError('title cannot exceed 200 characters', 400);
  }
  if (content.trim().length > 10000) {
    throw new AppError('content cannot exceed 10000 characters', 400);
  }

  const entry = await Journal.findOneAndUpdate(
    { userId: req.user.id, date },
    { $set: { title: title.trim(), content: content.trim() } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json(entry.toJSON());
}

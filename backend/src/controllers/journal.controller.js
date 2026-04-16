import { Journal } from '../models/Journal.js';
import { AppError } from '../middleware/AppError.js';
import { assertDateString } from '../utils/validation.js';

/**
 * Returns the local YYYY-MM-DD string for a date offset by `daysAgo` days.
 */
function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Validate that the requested date is today or yesterday only.
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
 * Returns the entry for the given date, or null if none exists.
 */
export async function getEntry(req, res) {
  const { date } = req.query;

  if (!date) {
    const today = localDateKey();
    const entry = await Journal.findOne({ userId: req.user.id, date: today });
    return res.json(entry ? entry.toJSON() : null);
  }

  assertDateString(date);

  const entry = await Journal.findOne({ userId: req.user.id, date });
  res.json(entry ? entry.toJSON() : null);
}

/**
 * GET /api/journal/history
 * Returns all entries strictly before today, sorted newest first.
 * Includes today=false so the write form and history list never overlap.
 */
export async function getHistory(req, res) {
  const todayStr = localDateKey();

  const entries = await Journal.find({
    userId: req.user.id,
    date: { $lt: todayStr },   // everything before today (includes yesterday and older)
  })
    .sort({ date: -1 })
    .select('date title content')
    .lean();

  res.json(
    entries.map((e) => ({
      id: e._id.toString(),
      date: e.date,
      title: e.title ?? '',
      content: e.content,
    }))
  );
}

/**
 * POST /api/journal
 * Body: { date, title?, content }
 * Upserts: updates if entry already exists for that date.
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

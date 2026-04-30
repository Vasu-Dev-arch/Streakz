import { connectDB } from '../lib/db.js';
import { AppError } from '../lib/auth.js';
import { assertDateString } from '../lib/validation.js';
import { Journal } from '../models/Journal.js';

function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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

export async function getJournalEntry(userId, date) {
  await connectDB();

  const resolvedDate = date || localDateKey();
  if (date) {
    assertDateString(date);
  }

  const entry = await Journal.findOne({ userId, date: resolvedDate });
  return entry ? entry.toJSON() : null;
}

export async function listJournalHistory(userId) {
  await connectDB();

  const todayStr = localDateKey();
  const entries = await Journal.find({
    userId,
    date: { $lt: todayStr },
  })
    .sort({ date: -1 })
    .select('date title content')
    .lean();

  return entries.map((e) => ({
    id: e._id.toString(),
    date: e.date,
    title: e.title ?? '',
    content: e.content,
  }));
}

export async function upsertJournalEntry(userId, { date, title = '', content }) {
  await connectDB();

  if (!date) {
    throw new AppError('date is required', 400);
  }

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
    { userId, date },
    { $set: { title: title.trim(), content: content.trim() } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return entry.toJSON();
}

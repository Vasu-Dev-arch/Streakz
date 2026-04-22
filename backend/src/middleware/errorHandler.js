import mongoose from 'mongoose';
import { AppError } from './AppError.js';

/**
 * @type {import('express').ErrorRequestHandler}
 */
export function errorHandler(err, _req, res, _next) {
  // ── Known operational errors ──────────────────────────────────────────────
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // ── Mongoose validation (schema-level) ────────────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ error: first?.message || 'Validation failed' });
  }

  // ── Mongoose bad ObjectId cast ────────────────────────────────────────────
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  // ── MongoDB duplicate key (E11000) ────────────────────────────────────────
  // Happens when a synced offline action is retried and the record already exists
  // (e.g. Completion unique index on userId+date, or any future unique index).
  if (err.code === 11000) {
    // Extract the field name from the key pattern when possible
    const field = err.keyValue
      ? Object.keys(err.keyValue).join(', ')
      : 'record';
    return res.status(409).json({ error: `Duplicate ${field} — record already exists` });
  }

  // ── Unhandled / unexpected ────────────────────────────────────────────────
  console.error('[errorHandler] Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
}

/**
 * lib/auth.js
 * Reusable authentication helper for Next.js API route handlers.
 * Replaces Express middleware (authenticate, AppError, errorHandler).
 *
 * Usage in a route handler:
 *   import { authenticate, AppError, handleError } from '@/lib/auth';
 *   export async function GET(request) {
 *     try {
 *       const user = await authenticate(request);
 *       // user.id is available here
 *     } catch (err) {
 *       return handleError(err);
 *     }
 *   }
 */

import jwt from 'jsonwebtoken';
import { connectDB } from './db.js';
import { User } from '../models/User.js';

// ── AppError ────────────────────────────────────────────────────────────────

export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} [statusCode=500]
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

// ── authenticate ────────────────────────────────────────────────────────────

/**
 * Extracts and verifies the JWT from the Authorization header or cookie.
 * Returns { id: string } on success; throws AppError on failure.
 *
 * @param {Request} request  - Next.js Web Request object
 * @returns {Promise<{ id: string }>}
 */
export async function authenticate(request) {
  const raw = extractToken(request);

  if (!raw) {
    throw new AppError('No token provided', 401);
  }

  let payload;
  try {
    payload = jwt.verify(raw, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }

  await connectDB();
  const user = await User.findById(payload.sub).lean();
  if (!user) {
    throw new AppError('User not found', 401);
  }

  return { id: user._id.toString() };
}

export function extractToken(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function signAuthToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function setAuthCookie(response, token) {
  response.cookies.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

// ── handleError ─────────────────────────────────────────────────────────────

/**
 * Converts any thrown error into a proper JSON Response.
 * Mirrors the Express errorHandler middleware exactly.
 *
 * @param {unknown} err
 * @returns {Response}
 */
export function handleError(err) {
  // Operational / known errors
  if (err instanceof AppError) {
    return Response.json({ error: err.message }, { status: err.statusCode });
  }

  // Mongoose schema validation
  if (err?.name === 'ValidationError') {
    const first = Object.values(err.errors ?? {})[0];
    return Response.json(
      { error: first?.message || 'Validation failed' },
      { status: 400 }
    );
  }

  // Mongoose bad ObjectId cast
  if (err?.name === 'CastError') {
    return Response.json({ error: 'Invalid id' }, { status: 400 });
  }

  // MongoDB duplicate key (E11000)
  if (err?.code === 11000) {
    const field = err.keyValue
      ? Object.keys(err.keyValue).join(', ')
      : 'record';
    return Response.json(
      { error: `Duplicate ${field} — record already exists` },
      { status: 409 }
    );
  }

  // Unhandled / unexpected
  console.error('[API Error]', err);
  return Response.json({ error: 'Internal Server Error' }, { status: 500 });
}

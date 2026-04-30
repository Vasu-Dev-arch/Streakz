/**
 * lib/db.js
 * Serverless-safe MongoDB connection with module-level caching.
 * On cold starts a new connection is made; on warm invocations the
 * cached promise is reused so we never open more connections than needed.
 */

import mongoose from 'mongoose';

// Support both MONGODB_URI (preferred) and legacy MONGO_URI
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Missing MongoDB connection string. ' +
    'Set MONGODB_URI in .env.local (local dev) or in the Vercel dashboard (production).'
  );
}

/**
 * In development, attach the cached connection to `global` so that
 * Next.js hot-reloads don't spawn a new connection on every module reload.
 * In production the module is loaded once per container lifetime.
 */
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((m) => m)
      .catch((err) => {
        // Reset so the next request retries instead of hanging forever
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

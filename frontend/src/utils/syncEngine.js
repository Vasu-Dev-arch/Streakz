/**
 * syncEngine.js
 * Flushes the offline action queue to the backend when the network returns.
 *
 * Safety rules:
 *  1. Never sync without a valid, non-expired token.
 *  2. On 401/403 → abort entire run, fire SESSION_EXPIRED_EVENT.
 *  3. On other 4xx → drop the action (bad payload, won't succeed on retry).
 *  4. On network error / 5xx → leave action queued for next run.
 *  5. Temp IDs (prefix "temp-") are dropped for update/delete — the real
 *     server ID was never persisted, so these cannot be synced.
 *
 * All fetch calls use relative paths (/api/...) — same-origin, no base URL.
 */

import {
  getQueuedActions,
  removeQueuedAction,
  cacheHabits,
  cacheCompletions,
  cacheGoals,
  cacheTodos,
} from './offlineDB';
import { getRawToken, isTokenValid, handleSessionExpired } from './tokenUtils';

// ── Error types ───────────────────────────────────────────────────────────────

class AuthError extends Error {
  constructor(msg) { super(msg); this.name = 'AuthError'; }
}
class ClientError extends Error {
  constructor(msg, status) { super(msg); this.name = 'ClientError'; this.status = status; }
}

// ── Internal fetch ────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = getRawToken();
  if (!token || !isTokenValid(token)) throw new AuthError('Token missing or expired');

  let res;
  try {
    res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch (networkErr) {
    throw networkErr; // network failure → stays queued
  }

  if (res.status === 401 || res.status === 403) {
    throw new AuthError(`${res.status} unauthorized on ${path}`);
  }

  if (res.status === 204) return null;

  let data;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    throw new ClientError(data?.error ?? `${path} → ${res.status}`, res.status);
  }

  return data;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isTempId(id) {
  return typeof id === 'string' && id.startsWith('temp-');
}

// ── Process one action ────────────────────────────────────────────────────────

/** @returns {'ok' | 'drop' | 'retry'} */
async function processAction(action) {
  const { type, payload } = action;

  try {
    switch (type) {
      // ── Habits ──────────────────────────────────────────────────────────────
      case 'habit-add':
        await apiFetch('/api/habits', { method: 'POST', body: JSON.stringify(payload) });
        return 'ok';

      case 'habit-update':
        if (isTempId(payload.id)) return 'drop';
        await apiFetch(`/api/habits/${payload.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload.updates),
        });
        return 'ok';

      case 'habit-delete':
        if (isTempId(payload.id)) return 'drop';
        await apiFetch(`/api/habits/${payload.id}`, { method: 'DELETE' });
        return 'ok';

      // ── Completions ─────────────────────────────────────────────────────────
      case 'completion-toggle':
        if (isTempId(payload.habitId)) return 'drop';
        await apiFetch('/api/completions', {
          method: 'POST',
          body: JSON.stringify({ date: payload.date, habitId: payload.habitId }),
        });
        return 'ok';

      // ── Journal ─────────────────────────────────────────────────────────────
      case 'journal-save':
        await apiFetch('/api/journal', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return 'ok';

      // ── Goals ───────────────────────────────────────────────────────────────
      case 'goal-add':
        await apiFetch('/api/goals', { method: 'POST', body: JSON.stringify(payload) });
        return 'ok';

      case 'goal-update':
        if (isTempId(payload.id)) return 'drop';
        await apiFetch(`/api/goals/${payload.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload.updates),
        });
        return 'ok';

      case 'goal-progress':
        if (isTempId(payload.id)) return 'drop';
        await apiFetch(`/api/goals/${payload.id}/progress`, {
          method: 'PATCH',
          body: JSON.stringify(payload.progressData),
        });
        return 'ok';

      case 'goal-delete':
        if (isTempId(payload.id)) return 'drop';
        await apiFetch(`/api/goals/${payload.id}`, { method: 'DELETE' });
        return 'ok';

      // ── Todos ─────────────────────────────────────────────────────────────
      case 'todo-add':
        await apiFetch('/api/todos', { method: 'POST', body: JSON.stringify(payload) });
        return 'ok';

      case 'todo-update':
        if (isTempId(payload.id)) return 'drop';
        await apiFetch(`/api/todos/${payload.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload.updates),
        });
        return 'ok';

      case 'todo-toggle':
        if (isTempId(payload.id)) return 'drop';
        await apiFetch(`/api/todos/${payload.id}/toggle`, { method: 'PATCH' });
        return 'ok';

      case 'todo-delete':
        if (isTempId(payload.id)) return 'drop';
        await apiFetch(`/api/todos/${payload.id}`, { method: 'DELETE' });
        return 'ok';

      // ── Settings ──────────────────────────────────────────────────────────
      case 'settings-update':
        await apiFetch('/api/settings', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        return 'ok';

      default:
        console.warn('[syncEngine] Unknown action type — dropping:', type);
        return 'drop';
    }
  } catch (err) {
    if (err instanceof AuthError) throw err; // bubble to abort the run
    if (err instanceof ClientError) {
      console.warn(`[syncEngine] Drop "${type}" (${err.status}): ${err.message}`);
      return 'drop';
    }
    // Network / 5xx — keep for retry
    console.warn(`[syncEngine] Retry "${type}": ${err.message}`);
    return 'retry';
  }
}

// ── Refresh cache after sync ──────────────────────────────────────────────────

async function refreshCache() {
  const token = getRawToken();
  if (!token || !isTokenValid(token)) return;

  const [habitsRes, completionsRes, goalsRes, todosRes] = await Promise.allSettled([
    apiFetch('/api/habits'),
    apiFetch('/api/completions'),
    apiFetch('/api/goals'),
    apiFetch('/api/todos'),
  ]);

  if (habitsRes.status === 'fulfilled' && Array.isArray(habitsRes.value)) {
    await cacheHabits(habitsRes.value);
  }
  if (completionsRes.status === 'fulfilled' && Array.isArray(completionsRes.value)) {
    const map = {};
    for (const doc of completionsRes.value) {
      map[doc.date] = new Set(doc.habitIds);
    }
    await cacheCompletions(map);
  }
  if (goalsRes.status === 'fulfilled' && Array.isArray(goalsRes.value)) {
    await cacheGoals(goalsRes.value);
  }
  if (todosRes.status === 'fulfilled' && Array.isArray(todosRes.value)) {
    await cacheTodos(todosRes.value);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

let _syncRunning = false;

/**
 * @param {object} [opts]
 * @param {() => void}           [opts.onStart]
 * @param {(n: number) => void}  [opts.onSuccess]
 * @param {(err: Error) => void} [opts.onError]
 * @param {() => void}           [opts.onSessionExpired]
 */
export async function runSync({ onStart, onSuccess, onError, onSessionExpired } = {}) {
  if (_syncRunning) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  const token = getRawToken();
  if (!token || !isTokenValid(token)) {
    if (token) {
      handleSessionExpired();
      onSessionExpired?.();
    }
    return;
  }

  const actions = await getQueuedActions();
  if (!actions.length) return;

  _syncRunning = true;
  onStart?.();

  let synced = 0;
  let retried = 0;
  let aborted = false;

  const sorted = actions.slice().sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

  for (const action of sorted) {
    if (aborted) break;
    try {
      const result = await processAction(action);
      if (result === 'ok' || result === 'drop') {
        await removeQueuedAction(action.id);
        if (result === 'ok') synced++;
      } else {
        retried++;
      }
    } catch (err) {
      if (err instanceof AuthError) {
        handleSessionExpired();
        onSessionExpired?.();
        aborted = true;
      } else {
        retried++;
      }
    }
  }

  _syncRunning = false;

  if (aborted) return;

  if (synced > 0) {
    try { await refreshCache(); } catch { /* non-critical */ }
  }

  if (retried > 0 && synced === 0) {
    onError?.(new Error(`${retried} action(s) pending — will retry on next sync`));
  } else {
    onSuccess?.(synced);
  }
}

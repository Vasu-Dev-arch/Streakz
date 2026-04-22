/**
 * offlineDB.js
 * Thin IndexedDB wrapper for Streakz offline storage.
 * Stores: habits, completions, journal entries, goals, todos, and a pending-actions queue.
 *
 * All functions return Promises. On environments where IndexedDB is unavailable
 * (SSR / very old browsers) every call is a silent no-op.
 */

const DB_NAME = 'streakz-offline';
const DB_VERSION = 2; // bumped to add todos store

const STORES = {
  HABITS: 'habits',
  COMPLETIONS: 'completions',
  JOURNAL: 'journal',
  GOALS: 'goals',
  TODOS: 'todos',
  QUEUE: 'sync-queue',
  META: 'meta',
};

let _db = null;

function openDB() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(STORES.HABITS)) {
        db.createObjectStore(STORES.HABITS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.COMPLETIONS)) {
        db.createObjectStore(STORES.COMPLETIONS, { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains(STORES.JOURNAL)) {
        db.createObjectStore(STORES.JOURNAL, { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains(STORES.GOALS)) {
        db.createObjectStore(STORES.GOALS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.TODOS)) {
        db.createObjectStore(STORES.TODOS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.QUEUE)) {
        const qs = db.createObjectStore(STORES.QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        qs.createIndex('by-type', 'type', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: 'key' });
      }
    };

    req.onsuccess = (e) => {
      _db = e.target.result;
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
}

// ── Generic helpers ────────────────────────────────────────────────────────────

function tx(storeName, mode, fn) {
  return openDB().then((db) => {
    if (!db) return undefined;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const req = fn(store);
      if (req && typeof req.onsuccess !== 'undefined') {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } else {
        transaction.oncomplete = () => resolve(undefined);
        transaction.onerror = () => reject(transaction.error);
      }
    });
  });
}

function getAll(storeName) {
  return tx(storeName, 'readonly', (store) => store.getAll());
}

function putRecord(storeName, record) {
  return tx(storeName, 'readwrite', (store) => store.put(record));
}

function putAll(storeName, records) {
  return openDB().then((db) => {
    if (!db || !records.length) return;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      records.forEach((r) => store.put(r));
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  });
}

function deleteRecord(storeName, key) {
  return tx(storeName, 'readwrite', (store) => store.delete(key));
}

function clearStore(storeName) {
  return tx(storeName, 'readwrite', (store) => store.clear());
}

// ── Habits ────────────────────────────────────────────────────────────────────

export async function cacheHabits(habits) {
  await clearStore(STORES.HABITS);
  await putAll(STORES.HABITS, habits);
}

export async function getCachedHabits() {
  return (await getAll(STORES.HABITS)) ?? [];
}

export async function upsertCachedHabit(habit) {
  return putRecord(STORES.HABITS, habit);
}

export async function deleteCachedHabit(id) {
  return deleteRecord(STORES.HABITS, id);
}

// ── Completions ───────────────────────────────────────────────────────────────

export async function cacheCompletions(completionsMap) {
  await clearStore(STORES.COMPLETIONS);
  const records = Object.entries(completionsMap).map(([date, ids]) => ({
    date,
    habitIds: [...ids],
  }));
  await putAll(STORES.COMPLETIONS, records);
}

export async function getCachedCompletions() {
  const rows = (await getAll(STORES.COMPLETIONS)) ?? [];
  const map = {};
  for (const row of rows) {
    map[row.date] = new Set(row.habitIds);
  }
  return map;
}

export async function upsertCachedCompletion(date, habitIds) {
  return putRecord(STORES.COMPLETIONS, { date, habitIds: [...habitIds] });
}

// ── Journal ───────────────────────────────────────────────────────────────────

export async function cacheJournalEntries(entries) {
  await clearStore(STORES.JOURNAL);
  await putAll(STORES.JOURNAL, entries);
}

export async function getCachedJournalEntries() {
  return (await getAll(STORES.JOURNAL)) ?? [];
}

export async function upsertCachedJournalEntry(entry) {
  return putRecord(STORES.JOURNAL, entry);
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export async function cacheGoals(goals) {
  await clearStore(STORES.GOALS);
  await putAll(STORES.GOALS, goals);
}

export async function getCachedGoals() {
  return (await getAll(STORES.GOALS)) ?? [];
}

export async function upsertCachedGoal(goal) {
  return putRecord(STORES.GOALS, goal);
}

export async function deleteCachedGoal(id) {
  return deleteRecord(STORES.GOALS, id);
}

// ── Todos ─────────────────────────────────────────────────────────────────────

export async function cacheTodos(todos) {
  await clearStore(STORES.TODOS);
  await putAll(STORES.TODOS, todos);
}

export async function getCachedTodos() {
  return (await getAll(STORES.TODOS)) ?? [];
}

export async function upsertCachedTodo(todo) {
  return putRecord(STORES.TODOS, todo);
}

export async function deleteCachedTodo(id) {
  return deleteRecord(STORES.TODOS, id);
}

// ── Sync Queue ────────────────────────────────────────────────────────────────

export async function enqueueAction(type, payload, dedupeKey = null) {
  const db = await openDB();
  if (!db) return;

  if (dedupeKey) {
    const existing = await getAll(STORES.QUEUE);
    for (const item of existing ?? []) {
      if (item.dedupeKey === dedupeKey) {
        await deleteRecord(STORES.QUEUE, item.id);
      }
    }
  }

  return putRecord(STORES.QUEUE, {
    type,
    payload,
    dedupeKey,
    createdAt: new Date().toISOString(),
  });
}

export async function getQueuedActions() {
  return (await getAll(STORES.QUEUE)) ?? [];
}

export async function removeQueuedAction(id) {
  return deleteRecord(STORES.QUEUE, id);
}

export async function clearQueue() {
  return clearStore(STORES.QUEUE);
}

// ── Meta ──────────────────────────────────────────────────────────────────────

export async function setMeta(key, value) {
  return putRecord(STORES.META, { key, value });
}

export async function getMeta(key) {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const req = db
      .transaction(STORES.META, 'readonly')
      .objectStore(STORES.META)
      .get(key);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

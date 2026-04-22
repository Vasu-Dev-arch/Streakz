import { useState, useEffect, useCallback } from 'react';
import { getToken } from './useAuth';
import { todayKey, dateKey } from '../utils/dateUtils';
import { DEFAULT_ICON_ID } from '../constants';
import { isTokenValid, SESSION_EXPIRED_EVENT, getRawToken } from '../utils/tokenUtils';
import {
  cacheHabits,
  getCachedHabits,
  upsertCachedHabit,
  deleteCachedHabit,
  cacheCompletions,
  getCachedCompletions,
  upsertCachedCompletion,
  enqueueAction,
} from '../utils/offlineDB';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

/**
 * Central fetch helper for useHabits.
 *  - Uses getRawToken() directly (no circular dep via useAuth)
 *  - Validates token expiry client-side before every request
 *  - Dispatches SESSION_EXPIRED_EVENT on 401/403
 *  - Throws Error('SESSION_EXPIRED') so callers can filter it from real errors
 */
async function apiFetch(path, options = {}) {
  const token = getRawToken();

  if (!token || !isTokenValid(token)) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    throw new Error('SESSION_EXPIRED');
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    throw new Error('SESSION_EXPIRED');
  }

  if (res.status === 204) return null;

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(
      data?.error ?? `${options.method ?? 'GET'} ${path} failed: ${res.status}`
    );
  }

  return data;
}

function buildCompletionsMap(docs) {
  const map = {};
  for (const doc of docs) {
    map[doc.date] = new Set(doc.habitIds);
  }
  return map;
}

export function daysAgoKey(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateKey(d);
}

export function useHabits(token) {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [dailyGoal, setDailyGoal] = useState(3);
  const [reminderTime, setReminderTime] = useState(null);
  const [categories, setCategories] = useState(['study', 'fitness', 'work']);
  const [loading, setLoading] = useState(true);

  // ── Initial load — offline-first ────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setHabits([]);
      setCompletions({});
      setDailyGoal(3);
      setReminderTime(null);
      setCategories(['study', 'fitness', 'work']);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadAll() {
      try {
        setLoading(true);

        // 1. Hydrate from IndexedDB immediately for instant offline render
        const [cachedHabitsData, cachedCompletionsData] = await Promise.all([
          getCachedHabits(),
          getCachedCompletions(),
        ]);

        if (!cancelled && cachedHabitsData.length > 0) {
          setHabits(cachedHabitsData);
          setCompletions(cachedCompletionsData);
        }

        // 2. Fetch from server only if online AND token still valid
        const currentToken = getRawToken();
        if (navigator.onLine && currentToken && isTokenValid(currentToken)) {
          const [habitsData, completionsData, settingsData] = await Promise.all([
            apiFetch('/api/habits'),
            apiFetch('/api/completions'),
            apiFetch('/api/settings'),
          ]);

          if (cancelled) return;

          const habitsArr = Array.isArray(habitsData) ? habitsData : [];
          const completionsArr = Array.isArray(completionsData) ? completionsData : [];
          const completionsMap = buildCompletionsMap(completionsArr);

          setHabits(habitsArr);
          setCompletions(completionsMap);
          setDailyGoal(settingsData?.dailyGoal ?? 3);
          setReminderTime(settingsData?.reminderTime ?? null);
          setCategories(
            Array.isArray(settingsData?.categories)
              ? settingsData.categories
              : ['study', 'fitness', 'work']
          );

          await cacheHabits(habitsArr);
          await cacheCompletions(completionsMap);
        }
      } catch (err) {
        // SESSION_EXPIRED is handled globally — don't pollute the console
        if (err.message !== 'SESSION_EXPIRED') {
          console.error('[useHabits] Failed to load data:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();

    function onSyncComplete() { loadAll(); }
    window.addEventListener('streakz:sync-complete', onSyncComplete);

    return () => {
      cancelled = true;
      window.removeEventListener('streakz:sync-complete', onSyncComplete);
    };
  }, [token]);

  // ── Habits ──────────────────────────────────────────────────────────────────

  const addHabit = useCallback(async (habit) => {
    const payload = {
      name: habit.name,
      emoji: habit.emoji ?? '',
      icon: habit.icon ?? DEFAULT_ICON_ID,
      color: habit.color ?? '#22c97a',
      category: habit.category,
      description: habit.description ?? '',
    };

    if (!navigator.onLine) {
      const tempId = `temp-${Date.now()}`;
      const tempHabit = { id: tempId, ...payload };
      setHabits((prev) => [...prev, tempHabit]);
      await upsertCachedHabit(tempHabit);
      await enqueueAction('habit-add', payload, `habit-add-${tempId}`);
      return tempHabit;
    }

    const data = await apiFetch('/api/habits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setHabits((prev) => [...prev, data]);
    await upsertCachedHabit(data);
    return data;
  }, []);

  const updateHabit = useCallback(async (id, updates) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));

    if (!navigator.onLine) {
      const current = habits.find((h) => h.id === id);
      if (current) await upsertCachedHabit({ ...current, ...updates });
      await enqueueAction('habit-update', { id, updates }, `habit-update-${id}`);
      return;
    }

    try {
      const data = await apiFetch(`/api/habits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setHabits((prev) => prev.map((h) => (h.id === id ? data : h)));
      await upsertCachedHabit(data);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') return;
      console.error('[useHabits] updateHabit failed:', err);
      const cached = await getCachedHabits();
      if (cached.length) setHabits(cached);
    }
  }, [habits]);

  const deleteHabit = useCallback(async (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setCompletions((prev) => {
      const next = {};
      for (const [date, ids] of Object.entries(prev)) {
        const s = new Set(ids);
        s.delete(id);
        next[date] = s;
      }
      return next;
    });
    await deleteCachedHabit(id);

    if (!navigator.onLine) {
      await enqueueAction('habit-delete', { id }, `habit-delete-${id}`);
      return;
    }

    try {
      await apiFetch(`/api/habits/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error('[useHabits] deleteHabit failed:', err);
      }
    }
  }, []);

  // ── Completions ─────────────────────────────────────────────────────────────

  const toggleHabit = useCallback(async (id) => {
    const tk = todayKey();

    setCompletions((prev) => {
      const next = { ...prev };
      const s = new Set(next[tk] ?? []);
      s.has(id) ? s.delete(id) : s.add(id);
      next[tk] = s;
      return next;
    });

    if (!navigator.onLine) {
      const current = await getCachedCompletions();
      const s = new Set(current[tk] ?? []);
      s.has(id) ? s.delete(id) : s.add(id);
      await upsertCachedCompletion(tk, s);
      await enqueueAction('completion-toggle', { date: tk, habitId: id }, `completion-${tk}-${id}`);
      return;
    }

    try {
      const data = await apiFetch('/api/completions', {
        method: 'POST',
        body: JSON.stringify({ date: tk, habitId: id }),
      });
      setCompletions((prev) => ({ ...prev, [data.date]: new Set(data.habitIds) }));
      await upsertCachedCompletion(data.date, new Set(data.habitIds));
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') return;
      console.error('[useHabits] toggleHabit failed:', err);
      // Rollback optimistic update
      setCompletions((prev) => {
        const next = { ...prev };
        const s = new Set(next[tk] ?? []);
        s.has(id) ? s.delete(id) : s.add(id);
        next[tk] = s;
        return next;
      });
    }
  }, []);

  const toggleHabitForDate = useCallback(async (habitId, date) => {
    setCompletions((prev) => {
      const next = { ...prev };
      const s = new Set(next[date] ?? []);
      s.has(habitId) ? s.delete(habitId) : s.add(habitId);
      next[date] = s;
      return next;
    });

    if (!navigator.onLine) {
      const current = await getCachedCompletions();
      const s = new Set(current[date] ?? []);
      s.has(habitId) ? s.delete(habitId) : s.add(habitId);
      await upsertCachedCompletion(date, s);
      await enqueueAction('completion-toggle', { date, habitId }, `completion-${date}-${habitId}`);
      return;
    }

    try {
      const data = await apiFetch('/api/completions', {
        method: 'POST',
        body: JSON.stringify({ date, habitId }),
      });
      setCompletions((prev) => ({ ...prev, [data.date]: new Set(data.habitIds) }));
      await upsertCachedCompletion(data.date, new Set(data.habitIds));
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') return;
      console.error('[useHabits] toggleHabitForDate failed:', err);
      setCompletions((prev) => {
        const next = { ...prev };
        const s = new Set(next[date] ?? []);
        s.has(habitId) ? s.delete(habitId) : s.add(habitId);
        next[date] = s;
        return next;
      });
    }
  }, []);

  // ── Settings ────────────────────────────────────────────────────────────────

  const updateDailyGoal = useCallback(async (goal) => {
    const validGoal = Math.max(1, Math.min(20, parseInt(goal) || 3));
    setDailyGoal(validGoal);

    if (!navigator.onLine) {
      await enqueueAction('settings-update', { dailyGoal: validGoal }, 'settings-dailyGoal');
      return validGoal;
    }

    try {
      const data = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ dailyGoal: validGoal }),
      });
      setDailyGoal(data.dailyGoal);
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error('[useHabits] updateDailyGoal failed:', err);
      }
    }
    return validGoal;
  }, []);

  const updateReminderTime = useCallback(async (time) => {
    const value = time || null;
    setReminderTime(value);

    if (!navigator.onLine) {
      await enqueueAction('settings-update', { reminderTime: value }, 'settings-reminderTime');
      return;
    }

    try {
      const data = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ reminderTime: value }),
      });
      setReminderTime(data.reminderTime);
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error('[useHabits] updateReminderTime failed:', err);
      }
    }
  }, []);

  const addCategory = useCallback(async (categoryName) => {
    if (!categoryName || typeof categoryName !== 'string' || !categoryName.trim()) {
      throw new Error('Category name must be a non-empty string');
    }
    const trimmedName = categoryName.trim();
    if (categories.includes(trimmedName)) {
      throw new Error('Category already exists');
    }
    const updatedCategories = [...categories, trimmedName];
    setCategories(updatedCategories);

    if (!navigator.onLine) {
      await enqueueAction('settings-update', { categories: updatedCategories }, 'settings-categories');
      return updatedCategories;
    }

    try {
      const data = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ categories: updatedCategories }),
      });
      setCategories(data.categories);
      return data.categories;
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error('[useHabits] addCategory failed:', err);
      }
      setCategories(categories); // rollback
      throw err;
    }
  }, [categories]);

  return {
    habits,
    completions,
    dailyGoal,
    reminderTime,
    categories,
    loading,
    toggleHabit,
    toggleHabitForDate,
    addHabit,
    updateHabit,
    deleteHabit,
    updateDailyGoal,
    updateReminderTime,
    addCategory,
  };
}

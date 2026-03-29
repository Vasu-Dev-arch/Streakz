import { useState, useEffect, useCallback } from 'react';
import { todayKey } from '../utils/dateUtils';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${res.status} ${text}`);
  }
  // 204 No Content — nothing to parse
  if (res.status === 204) return null;
  return res.json();
}

/**
 * Convert the flat completions array from the API into the shape the UI expects:
 * { 'YYYY-MM-DD': Set<habitId>, ... }
 */
function buildCompletionsMap(docs) {
  const map = {};
  for (const doc of docs) {
    map[doc.date] = new Set(doc.habitIds);
  }
  return map;
}

/**
 * Custom hook — all data comes from the backend. No localStorage.
 */
export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [dailyGoal, setDailyGoal] = useState(3);
  const [reminderTime, setReminderTime] = useState(null);
  const [categories, setCategories] = useState(['study', 'fitness', 'work']);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        const [habitsData, completionsData, settingsData] = await Promise.all([
          apiFetch('/api/habits'),
          apiFetch('/api/completions'),
          apiFetch('/api/settings'),
        ]);

        if (cancelled) return;

        setHabits(Array.isArray(habitsData) ? habitsData : []);
        setCompletions(buildCompletionsMap(Array.isArray(completionsData) ? completionsData : []));
        setDailyGoal(settingsData?.dailyGoal ?? 3);
        setReminderTime(settingsData?.reminderTime ?? null);
        setCategories(Array.isArray(settingsData?.categories) ? settingsData.categories : ['study', 'fitness', 'work']);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  // ── Habits ──────────────────────────────────────────────────────────────────
  const addHabit = useCallback(async (habit) => {
    const data = await apiFetch('/api/habits', {
      method: 'POST',
      body: JSON.stringify({
        name: habit.name,
        emoji: habit.emoji ?? '',
        color: habit.color ?? '#22c97a',
        category: habit.category,
      }),
    });
    setHabits((prev) => [...prev, data]);
    return data;
  }, []);

  const updateHabit = useCallback(async (id, updates) => {
    const data = await apiFetch(`/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    setHabits((prev) => prev.map((h) => (h.id === id ? data : h)));
  }, []);

  const deleteHabit = useCallback(async (id) => {
    await apiFetch(`/api/habits/${id}`, { method: 'DELETE' });
    setHabits((prev) => prev.filter((h) => h.id !== id));
    // Backend already strips the id from all completion docs via $pull;
    // mirror that in local state so UI is consistent without a full refetch.
    setCompletions((prev) => {
      const next = {};
      for (const [date, ids] of Object.entries(prev)) {
        const s = new Set(ids);
        s.delete(id);
        next[date] = s;
      }
      return next;
    });
  }, []);

  // ── Completions ─────────────────────────────────────────────────────────────
  const toggleHabit = useCallback(async (id) => {
    const tk = todayKey();

    // Optimistic update
    setCompletions((prev) => {
      const next = { ...prev };
      const s = new Set(next[tk] ?? []);
      s.has(id) ? s.delete(id) : s.add(id);
      next[tk] = s;
      return next;
    });

    try {
      const data = await apiFetch('/api/completions', {
        method: 'POST',
        body: JSON.stringify({ date: tk, habitId: id }),
      });
      // Reconcile with server truth
      setCompletions((prev) => ({
        ...prev,
        [data.date]: new Set(data.habitIds),
      }));
    } catch (err) {
      console.error('Failed to toggle completion:', err);
      // Roll back optimistic update
      setCompletions((prev) => {
        const next = { ...prev };
        const s = new Set(next[tk] ?? []);
        s.has(id) ? s.delete(id) : s.add(id);
        next[tk] = s;
        return next;
      });
    }
  }, []);

  // ── Settings ────────────────────────────────────────────────────────────────
  const updateDailyGoal = useCallback(async (goal) => {
    const validGoal = Math.max(1, Math.min(20, parseInt(goal) || 3));
    setDailyGoal(validGoal); // optimistic
    try {
      const data = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ dailyGoal: validGoal }),
      });
      setDailyGoal(data.dailyGoal);
    } catch (err) {
      console.error('Failed to update daily goal:', err);
    }
    return validGoal;
  }, []);

  const updateReminderTime = useCallback(async (time) => {
    const value = time || null;
    setReminderTime(value); // optimistic
    try {
      const data = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ reminderTime: value }),
      });
      setReminderTime(data.reminderTime);
    } catch (err) {
      console.error('Failed to update reminder time:', err);
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
    setCategories(updatedCategories); // optimistic
    try {
      const data = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ categories: updatedCategories }),
      });
      setCategories(data.categories);
      return data.categories;
    } catch (err) {
      console.error('Failed to add category:', err);
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
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    updateDailyGoal,
    updateReminderTime,
    addCategory,
  };
}

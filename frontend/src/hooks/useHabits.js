import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { todayKey } from '../utils/dateUtils';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * Custom hook for managing habits and completions
 * @returns {Object} Habits state and management functions
 */
export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [completionsRaw, setCompletionsRaw] = useLocalStorage('streaks_completions', {});
  const [dailyGoal, setDailyGoal] = useLocalStorage('streaks_daily_goal', 3);
  const [reminderTime, setReminderTime] = useLocalStorage('streaks_reminder_time', null);

  // Convert completions from plain objects to Sets
  const [completions, setCompletions] = useState(() => {
    const result = {};
    for (const [k, v] of Object.entries(completionsRaw)) {
      result[k] = new Set(v);
    }
    return result;
  });

  // Sync completions with localStorage
  useEffect(() => {
    const raw = {};
    for (const [k, v] of Object.entries(completions)) {
      raw[k] = [...v];
    }
    setCompletionsRaw(raw);
  }, [completions, setCompletionsRaw]);

  useEffect(() => {
    let cancelled = false;
    async function loadHabits() {
      try {
        const res = await fetch(`${API_BASE}/api/habits`);
        if (!res.ok) {
          throw new Error(`GET /api/habits failed: ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setHabits(data);
        }
      } catch (err) {
        console.error('Failed to load habits:', err);
        if (!cancelled) {
          setHabits([]);
        }
      }
    }
    loadHabits();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Toggle habit completion for today
   */
  const toggleHabit = useCallback((id) => {
    const tk = todayKey();
    setCompletions((prev) => {
      const newCompletions = { ...prev };
      if (!newCompletions[tk]) newCompletions[tk] = new Set();

      const newSet = new Set(newCompletions[tk]);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

      newCompletions[tk] = newSet;
      return newCompletions;
    });
  }, [setCompletions]);

  /**
   * Add a new habit
   */
  const addHabit = useCallback(async (habit) => {
    try {
      const res = await fetch(`${API_BASE}/api/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: habit.name,
          emoji: habit.emoji ?? '',
          color: habit.color ?? '#22c97a',
          category: habit.category,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST /api/habits failed: ${res.status} ${text}`);
      }
      const newHabit = await res.json();
      setHabits((prev) => [...prev, newHabit]);
      return newHabit;
    } catch (err) {
      console.error('Failed to add habit:', err);
    }
  }, []);

  /**
   * Update an existing habit
   */
  const updateHabit = useCallback(async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/api/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`PUT /api/habits failed: ${res.status} ${text}`);
      }
      const updated = await res.json();
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    } catch (err) {
      console.error('Failed to update habit:', err);
    }
  }, []);

  /**
   * Delete a habit and its completion data
   */
  const deleteHabit = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/habits/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`DELETE /api/habits failed: ${res.status} ${text}`);
      }
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setCompletions((prev) => {
        const newCompletions = { ...prev };
        for (const k of Object.keys(newCompletions)) {
          const newSet = new Set(newCompletions[k]);
          newSet.delete(id);
          newCompletions[k] = newSet;
        }
        return newCompletions;
      });
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  }, [setCompletions]);

  /**
   * Update daily goal
   */
  const updateDailyGoal = useCallback((goal) => {
    const validGoal = Math.max(1, Math.min(20, parseInt(goal) || 3));
    setDailyGoal(validGoal);
    return validGoal;
  }, [setDailyGoal]);

  /**
   * Update reminder time
   */
  const updateReminderTime = useCallback((time) => {
    setReminderTime(time || null);
  }, [setReminderTime]);

  return {
    habits,
    completions,
    dailyGoal,
    reminderTime,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    updateDailyGoal,
    updateReminderTime,
  };
}

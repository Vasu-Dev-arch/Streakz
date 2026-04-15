import { useState, useEffect, useCallback } from 'react';
import { getToken } from './useAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `${options.method ?? 'GET'} ${path} failed: ${res.status}`);
  return data;
}

/**
 * useGoals — all goal data and operations, scoped to the authenticated user.
 * Mirrors the useHabits pattern: optimistic updates, API sync, error rollback.
 *
 * @param {string|null} token  JWT from useAuth — triggers reload on auth change
 */
export function useGoals(token) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setGoals([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch('/api/goals');
        if (!cancelled) setGoals(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
        console.error('Failed to load goals:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [token]);

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const addGoal = useCallback(async (goalData) => {
    const data = await apiFetch('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
    setGoals((prev) => [...prev, data]);
    return data;
  }, []);

  const updateGoal = useCallback(async (id, updates) => {
    const data = await apiFetch(`/api/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    setGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
    return data;
  }, []);

  const updateProgress = useCallback(async (id, progressData) => {
    // Optimistic update
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updated = { ...g, ...progressData };
        // Optimistically derive status
        if (updated.progressType === 'count' && updated.currentValue >= updated.targetValue) {
          updated.status = 'completed';
        } else if (updated.progressType === 'percentage' && updated.progress >= 100) {
          updated.status = 'completed';
        }
        return updated;
      })
    );

    try {
      const data = await apiFetch(`/api/goals/${id}/progress`, {
        method: 'PATCH',
        body: JSON.stringify(progressData),
      });
      // Reconcile with server response (authoritative status)
      setGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
      return data;
    } catch (err) {
      // Rollback
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...Object.fromEntries(Object.entries(progressData).map(([k]) => [k, g[k]])) } : g)));
      throw err;
    }
  }, []);

  const deleteGoal = useCallback(async (id) => {
    // Optimistic
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      await apiFetch(`/api/goals/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete goal:', err);
      // Re-fetch on failure to restore state
      const data = await apiFetch('/api/goals');
      setGoals(Array.isArray(data) ? data : []);
    }
  }, []);

  return { goals, loading, error, addGoal, updateGoal, updateProgress, deleteGoal };
}

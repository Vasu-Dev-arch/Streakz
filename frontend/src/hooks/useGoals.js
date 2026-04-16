import { useState, useEffect, useCallback } from 'react';
import { getToken } from './useAuth';

var API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function apiFetch(path, options) {
  var opts = options || {};
  var token = getToken();
  var res = await fetch(API_BASE + path, Object.assign({}, opts, {
    headers: Object.assign(
      { 'Content-Type': 'application/json' },
      token ? { Authorization: 'Bearer ' + token } : {},
      opts.headers || {}
    ),
  }));
  if (res.status === 204) return null;
  var data = await res.json();
  if (!res.ok) {
    throw new Error(
      (data && data.error) ? data.error :
      ((opts.method || 'GET') + ' ' + path + ' failed: ' + res.status)
    );
  }
  return data;
}

/**
 * useGoals — all goal data and operations, scoped to the authenticated user.
 * Mirrors the useHabits pattern: optimistic updates, API sync, error rollback.
 */
export function useGoals(token) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(function () {
    if (!token) {
      setGoals([]);
      setLoading(false);
      return;
    }

    var cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        var data = await apiFetch('/api/goals');
        if (!cancelled) setGoals(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
        console.error('Failed to load goals:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return function () { cancelled = true; };
  }, [token]);

  // ── Create ──────────────────────────────────────────────────────────────────
  const addGoal = useCallback(async function (goalData) {
    var data = await apiFetch('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
    setGoals(function (prev) { return prev.concat([data]); });
    return data;
  }, []);

  // ── Update metadata ─────────────────────────────────────────────────────────
  const updateGoal = useCallback(async function (id, updates) {
    var data = await apiFetch('/api/goals/' + id, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    setGoals(function (prev) {
      return prev.map(function (g) { return g.id === id ? data : g; });
    });
    return data;
  }, []);

  // ── Update progress (optimistic) ────────────────────────────────────────────
  const updateProgress = useCallback(async function (id, progressData) {
    // Save snapshot of the goal before the optimistic update for potential rollback
    var snapshot = null;

    setGoals(function (prev) {
      return prev.map(function (g) {
        if (g.id !== id) return g;
        snapshot = g;
        var updated = Object.assign({}, g, progressData);
        // Optimistically derive status
        if (updated.progressType === 'count' && updated.currentValue >= updated.targetValue) {
          updated.status = 'completed';
        } else if (updated.progressType === 'percentage' && updated.progress >= 100) {
          updated.status = 'completed';
        }
        return updated;
      });
    });

    try {
      var data = await apiFetch('/api/goals/' + id + '/progress', {
        method: 'PATCH',
        body: JSON.stringify(progressData),
      });
      // Reconcile with authoritative server response
      setGoals(function (prev) {
        return prev.map(function (g) { return g.id === id ? data : g; });
      });
      return data;
    } catch (err) {
      // Rollback to snapshot
      if (snapshot) {
        var rollback = snapshot;
        setGoals(function (prev) {
          return prev.map(function (g) { return g.id === id ? rollback : g; });
        });
      }
      throw err;
    }
  }, []);

  // ── Delete (optimistic) ─────────────────────────────────────────────────────
  const deleteGoal = useCallback(async function (id) {
    // Optimistic removal
    setGoals(function (prev) { return prev.filter(function (g) { return g.id !== id; }); });
    try {
      await apiFetch('/api/goals/' + id, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete goal:', err);
      // Re-fetch to restore correct state
      try {
        var data = await apiFetch('/api/goals');
        setGoals(Array.isArray(data) ? data : []);
      } catch (fetchErr) {
        console.error('Failed to restore goals after delete error:', fetchErr);
      }
    }
  }, []);

  return { goals, loading, error, addGoal, updateGoal, updateProgress, deleteGoal };
}

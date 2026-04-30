import { useState, useEffect, useCallback } from 'react';
import { getToken } from './useAuth';
import {
  cacheGoals,
  getCachedGoals,
  upsertCachedGoal,
  deleteCachedGoal,
  enqueueAction,
} from '../utils/offlineDB';

// All API calls are same-origin — no base URL needed.
async function apiFetch(path, options) {
  var opts = options || {};
  var token = getToken();
  var res = await fetch(path, Object.assign({}, opts, {
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

export function useGoals(token) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Initial load — offline-first ──────────────────────────────────────────
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

      // 1. Show cached data immediately
      try {
        var cached = await getCachedGoals();
        if (!cancelled && cached.length > 0) {
          setGoals(cached);
        }
      } catch (_e) { /* ignore */ }

      // 2. Fetch from server if online
      if (navigator.onLine) {
        try {
          var data = await apiFetch('/api/goals');
          if (!cancelled) {
            var arr = Array.isArray(data) ? data : [];
            setGoals(arr);
            await cacheGoals(arr);
          }
        } catch (err) {
          if (!cancelled) setError(err.message);
          console.error('Failed to load goals:', err);
        }
      }

      if (!cancelled) setLoading(false);
    }

    load();

    function onSyncComplete() { load(); }
    window.addEventListener('streakz:sync-complete', onSyncComplete);

    return function () {
      cancelled = true;
      window.removeEventListener('streakz:sync-complete', onSyncComplete);
    };
  }, [token]);

  // ── Create ────────────────────────────────────────────────────────────────
  const addGoal = useCallback(async function (goalData) {
    if (!navigator.onLine) {
      var tempId = 'temp-goal-' + Date.now();
      var tempGoal = Object.assign({ id: tempId, status: 'active', progress: 0, currentValue: 0 }, goalData);
      setGoals(function (prev) { return prev.concat([tempGoal]); });
      await upsertCachedGoal(tempGoal);
      await enqueueAction('goal-add', goalData, 'goal-add-' + tempId);
      return tempGoal;
    }

    var data = await apiFetch('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
    setGoals(function (prev) { return prev.concat([data]); });
    await upsertCachedGoal(data);
    return data;
  }, []);

  // ── Update metadata ───────────────────────────────────────────────────────
  const updateGoal = useCallback(async function (id, updates) {
    // Optimistic
    setGoals(function (prev) {
      return prev.map(function (g) { return g.id === id ? Object.assign({}, g, updates) : g; });
    });

    if (!navigator.onLine) {
      var snapshot = goals.find(function (g) { return g.id === id; });
      if (snapshot) await upsertCachedGoal(Object.assign({}, snapshot, updates));
      await enqueueAction('goal-update', { id: id, updates: updates }, 'goal-update-' + id);
      return Object.assign({}, snapshot, updates);
    }

    var data = await apiFetch('/api/goals/' + id, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    setGoals(function (prev) {
      return prev.map(function (g) { return g.id === id ? data : g; });
    });
    await upsertCachedGoal(data);
    return data;
  }, [goals]);

  // ── Update progress (optimistic) ──────────────────────────────────────────
  const updateProgress = useCallback(async function (id, progressData) {
    var snapshot = null;

    setGoals(function (prev) {
      return prev.map(function (g) {
        if (g.id !== id) return g;
        snapshot = g;
        var updated = Object.assign({}, g, progressData);
        if (updated.progressType === 'count' && updated.currentValue >= updated.targetValue) {
          updated.status = 'completed';
        } else if (updated.progressType === 'percentage' && updated.progress >= 100) {
          updated.status = 'completed';
        }
        return updated;
      });
    });

    if (!navigator.onLine) {
      if (snapshot) {
        var offlineUpdated = Object.assign({}, snapshot, progressData);
        await upsertCachedGoal(offlineUpdated);
      }
      await enqueueAction('goal-progress', { id: id, progressData: progressData }, 'goal-progress-' + id);
      return Object.assign({}, snapshot, progressData);
    }

    try {
      var data = await apiFetch('/api/goals/' + id + '/progress', {
        method: 'PATCH',
        body: JSON.stringify(progressData),
      });
      setGoals(function (prev) {
        return prev.map(function (g) { return g.id === id ? data : g; });
      });
      await upsertCachedGoal(data);
      return data;
    } catch (err) {
      if (snapshot) {
        var rollback = snapshot;
        setGoals(function (prev) {
          return prev.map(function (g) { return g.id === id ? rollback : g; });
        });
      }
      throw err;
    }
  }, [goals]);

  // ── Delete (optimistic) ───────────────────────────────────────────────────
  const deleteGoal = useCallback(async function (id) {
    setGoals(function (prev) { return prev.filter(function (g) { return g.id !== id; }); });
    await deleteCachedGoal(id);

    if (!navigator.onLine) {
      await enqueueAction('goal-delete', { id: id }, 'goal-delete-' + id);
      return;
    }

    try {
      await apiFetch('/api/goals/' + id, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete goal:', err);
      try {
        var data = await apiFetch('/api/goals');
        var arr = Array.isArray(data) ? data : [];
        setGoals(arr);
        await cacheGoals(arr);
      } catch (fetchErr) {
        console.error('Failed to restore goals after delete error:', fetchErr);
      }
    }
  }, []);

  return { goals, loading, error, addGoal, updateGoal, updateProgress, deleteGoal };
}

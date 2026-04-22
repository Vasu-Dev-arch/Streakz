'use client';
import { useState, useEffect, useCallback } from 'react';
import { getRawToken, isTokenValid, SESSION_EXPIRED_EVENT } from '../utils/tokenUtils';
import {
  cacheTodos, getCachedTodos, upsertCachedTodo, deleteCachedTodo, enqueueAction,
} from '../utils/offlineDB';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function apiFetch(path, options = {}) {
  const token = getRawToken();
  if (!token || !isTokenValid(token)) {
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
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
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    throw new Error('SESSION_EXPIRED');
  }
  if (res.status === 204) return null;

  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(data?.error ?? `${options.method ?? 'GET'} ${path} failed: ${res.status}`);
  return data;
}

function sortTodos(todos) {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.order !== b.order) return a.order - b.order;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

export function useTodos(token) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) { setTodos([]); setLoading(false); return; }
    let cancelled = false;

    async function load() {
      setLoading(true); setError(null);
      try {
        const cached = await getCachedTodos();
        if (!cancelled && cached.length > 0) setTodos(sortTodos(cached));
      } catch { /* ignore */ }

      if (navigator.onLine) {
        try {
          const data = await apiFetch('/api/todos');
          if (!cancelled) {
            const arr = Array.isArray(data) ? data : [];
            setTodos(sortTodos(arr));
            await cacheTodos(arr);
          }
        } catch (err) {
          if (err.message !== 'SESSION_EXPIRED' && !cancelled) setError(err.message);
        }
      }
      if (!cancelled) setLoading(false);
    }

    load();

    const onSync = () => load();
    window.addEventListener('streakz:sync-complete', onSync);
    return () => { cancelled = true; window.removeEventListener('streakz:sync-complete', onSync); };
  }, [token]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const addTodo = useCallback(async (todoData) => {
    const payload = {
      title: todoData.title.trim(),
      category: todoData.category?.trim() ?? '',
      priority: todoData.priority ?? 'medium',
      deadline: todoData.deadline || null,
      order: todoData.order ?? 0,
    };

    if (!navigator.onLine) {
      const tempId = `temp-todo-${Date.now()}`;
      const tempTodo = { id: tempId, ...payload, completed: false,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setTodos((prev) => sortTodos([...prev, tempTodo]));
      await upsertCachedTodo(tempTodo);
      await enqueueAction('todo-add', payload, `todo-add-${tempId}`);
      return tempTodo;
    }

    const data = await apiFetch('/api/todos', { method: 'POST', body: JSON.stringify(payload) });
    setTodos((prev) => sortTodos([...prev, data]));
    await upsertCachedTodo(data);
    return data;
  }, []);

  // ── Update ────────────────────────────────────────────────────────────────
  const updateTodo = useCallback(async (id, updates) => {
    setTodos((prev) => sortTodos(prev.map((t) => t.id === id ? { ...t, ...updates } : t)));

    if (!navigator.onLine) {
      const snap = todos.find((t) => t.id === id);
      if (snap) await upsertCachedTodo({ ...snap, ...updates });
      await enqueueAction('todo-update', { id, updates }, `todo-update-${id}`);
      return;
    }

    try {
      const data = await apiFetch(`/api/todos/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
      setTodos((prev) => sortTodos(prev.map((t) => t.id === id ? data : t)));
      await upsertCachedTodo(data);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') return;
      const cached = await getCachedTodos();
      if (cached.length) setTodos(sortTodos(cached));
      throw err;
    }
  }, [todos]);

  // ── Toggle ────────────────────────────────────────────────────────────────
  const toggleTodo = useCallback(async (id) => {
    setTodos((prev) => sortTodos(prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)));

    if (!navigator.onLine) {
      const snap = todos.find((t) => t.id === id);
      if (snap) await upsertCachedTodo({ ...snap, completed: !snap.completed });
      await enqueueAction('todo-toggle', { id }, `todo-toggle-${id}`);
      return;
    }

    try {
      const data = await apiFetch(`/api/todos/${id}/toggle`, { method: 'PATCH' });
      setTodos((prev) => sortTodos(prev.map((t) => t.id === id ? data : t)));
      await upsertCachedTodo(data);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') return;
      setTodos((prev) => sortTodos(prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)));
    }
  }, [todos]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteTodo = useCallback(async (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await deleteCachedTodo(id);

    if (!navigator.onLine) {
      await enqueueAction('todo-delete', { id }, `todo-delete-${id}`);
      return;
    }
    try {
      await apiFetch(`/api/todos/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (err.message !== 'SESSION_EXPIRED') console.error('[useTodos] delete failed:', err);
    }
  }, []);

  return { todos, loading, error, addTodo, updateTodo, toggleTodo, deleteTodo };
}

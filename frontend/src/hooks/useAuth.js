import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const TOKEN_KEY = 'streaks_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function useAuth() {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [firstHabitPromptShown, setFirstHabitPromptShown] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuthResponse = useCallback(({ token: t, user: u }) => {
    setToken(t);
    setTokenState(t);
    setUser(u);
    setIsFirstLogin(u?.isFirstLogin ?? false);
    setFirstHabitPromptShown(u?.firstHabitPromptShown ?? false);
    setError(null);
  }, []);

  // ── Email / password ────────────────────────────────────────────────────────
  const signup = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      handleAuthResponse(data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleAuthResponse]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      handleAuthResponse(data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleAuthResponse]);

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(() => {
    window.location.href = `${API_BASE}/api/auth/google`;
  }, []);

  const handleGoogleCallback = useCallback((searchParams) => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');
    const firstLogin = searchParams.get('isFirstLogin') === 'true';

    if (err) {
      setError(decodeURIComponent(err));
      return { ok: false };
    }

    if (token) {
      setToken(token);
      setTokenState(token);
      setIsFirstLogin(firstLogin);
      setFirstHabitPromptShown(false);
      setError(null);
      return { ok: true, isFirstLogin: firstLogin };
    }

    setError('No token received from Google');
    return { ok: false };
  }, []);

  // ── Profile updates ─────────────────────────────────────────────────────────
  const updateProfile = useCallback(async ({ name, isFirstLogin: ifl, firstHabitPromptShown: fhps } = {}) => {
    const tk = getToken();
    const body = {};
    if (name !== undefined) body.name = name;
    if (ifl !== undefined) body.isFirstLogin = ifl;
    if (fhps !== undefined) body.firstHabitPromptShown = fhps;

    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');

    setUser((prev) => ({ ...prev, ...data }));
    if (data.isFirstLogin !== undefined) setIsFirstLogin(data.isFirstLogin);
    if (data.firstHabitPromptShown !== undefined) setFirstHabitPromptShown(data.firstHabitPromptShown);
    return data;
  }, []);

  /**
   * Mark onboarding complete — sets isFirstLogin = false on backend.
   */
  const completeOnboarding = useCallback(async () => {
    await updateProfile({ isFirstLogin: false });
    setIsFirstLogin(false);
  }, [updateProfile]);

  /**
   * Mark the first-habit prompt as shown — persisted to backend.
   */
  const markFirstHabitPromptShown = useCallback(async () => {
    setFirstHabitPromptShown(true);
    try {
      await updateProfile({ firstHabitPromptShown: true });
    } catch (err) {
      console.error('Failed to mark firstHabitPromptShown:', err);
    }
  }, [updateProfile]);

  // ── Fetch current user from backend (used on app load) ──────────────────────
  const fetchMe = useCallback(async () => {
    const tk = getToken();
    if (!tk) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tk}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUser(data);
      setIsFirstLogin(data.isFirstLogin ?? false);
      setFirstHabitPromptShown(data.firstHabitPromptShown ?? false);
    } catch {
      // silently fail
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setIsFirstLogin(false);
    setFirstHabitPromptShown(false);
  }, []);

  return {
    token,
    user,
    isFirstLogin,
    firstHabitPromptShown,
    error,
    loading,
    signup,
    login,
    loginWithGoogle,
    handleGoogleCallback,
    updateProfile,
    completeOnboarding,
    markFirstHabitPromptShown,
    fetchMe,
    logout,
  };
}
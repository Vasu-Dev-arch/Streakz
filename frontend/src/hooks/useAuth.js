import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const TOKEN_KEY = 'streaks_token';

// ── Token helpers (module-level so useHabits can import getToken) ─────────────
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Auth hook — email/password signup+login, Google OAuth, and logout.
 * Token is persisted in localStorage.
 */
export function useAuth() {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Called after any successful auth response (email/password or Google)
  const handleAuthResponse = useCallback(({ token: t, user: u }) => {
    setToken(t);
    setTokenState(t);
    setUser(u);
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
  /** Redirect the browser to the backend Google auth route */
  const loginWithGoogle = useCallback(() => {
    window.location.href = `${API_BASE}/api/auth/google`;
  }, []);

  /**
   * Called by AuthCallbackPage after Google redirects back to /auth/callback.
   * Reads ?token= or ?error= from the URL, then updates auth state.
   */
  const handleGoogleCallback = useCallback((searchParams) => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');

    if (err) {
      setError(decodeURIComponent(err));
      return false; // signal failure to the caller
    }

    if (token) {
      setToken(token);
      setTokenState(token);
      setError(null);
      return true; // signal success
    }

    setError('No token received from Google');
    return false;
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  return {
    token,
    user,
    error,
    loading,
    signup,
    login,
    loginWithGoogle,
    handleGoogleCallback,
    logout,
  };
}

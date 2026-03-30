import React, { useEffect } from 'react';

/**
 * Lives at /auth/callback.
 * Google redirects here with ?token=JWT&isFirstLogin=true/false (success)
 *                          or ?error=msg (failure).
 *
 * Props:
 *   handleGoogleCallback(searchParams) — from useAuth, returns { ok, isFirstLogin }
 *   onSuccess(result)                  — called with the result object on success
 *   onFailure()                        — called on error
 */
export function AuthCallbackPage({ handleGoogleCallback, onSuccess, onFailure }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = handleGoogleCallback(params);

    window.history.replaceState({}, '', '/auth/callback');

    if (result?.ok) {
      onSuccess(result);
    } else {
      onFailure();
    }
  }, []); // runs once on mount

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      fontFamily: 'var(--sans)',
      color: 'var(--text2)',
      fontSize: '14px',
    }}>
      Signing you in…
    </div>
  );
}

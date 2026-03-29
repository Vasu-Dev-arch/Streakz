import React, { useEffect } from 'react';

/**
 * This page lives at /auth/callback.
 * Google redirects here with ?token=JWT  (success)
 *                          or ?error=msg  (failure).
 *
 * Props:
 *   handleGoogleCallback(searchParams) — from useAuth
 *   onSuccess()                        — called when token is stored
 *   onFailure()                        — called when there's an error
 */
export function AuthCallbackPage({ handleGoogleCallback, onSuccess, onFailure }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ok = handleGoogleCallback(params);

    // Clean the token/error out of the URL regardless of outcome
    window.history.replaceState({}, '', '/auth/callback');

    if (ok) {
      onSuccess();
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

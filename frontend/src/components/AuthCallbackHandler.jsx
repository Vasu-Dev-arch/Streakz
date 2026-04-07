'use client';

/**
 * AuthCallbackHandler
 *
 * Rendered inside a <Suspense> boundary at /auth/callback.
 * Reads the ?token= / ?isFirstLogin= / ?error= query-string that
 * the backend OAuth redirect appends, hands it to useAuth, then
 * navigates to the correct next page.
 *
 * Must be a Client Component because it uses useSearchParams().
 */

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export function AuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const result = handleGoogleCallback(searchParams);

    if (result?.ok) {
      router.replace(result.isFirstLogin ? '/welcome' : '/dashboard');
    } else {
      router.replace('/auth?error=true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        fontFamily: 'var(--sans)',
        color: 'var(--text2)',
        fontSize: '14px',
      }}
    >
      Signing you in…
    </div>
  );
}

'use client';

/**
 * AuthPageWrapper
 *
 * Client-side shell for /auth.
 * - Reads auth state from useAuth
 * - Redirects to the correct next page when auth state is ready
 * - Routing logic is centralised in getAuthRedirectPath (single source of truth)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getAuthRedirectPath } from '../hooks/useAuth';
import { AuthPage } from './AuthPage';

export function AuthPageWrapper() {
  const router = useRouter();
  const { token, user, login, signup, loginWithGoogle, error, loading } = useAuth();

  /**
   * Redirect only once we have both a token AND the user object loaded.
   * Without the user object we don't know name / isFirstLogin, which means
   * getAuthRedirectPath would always return '/welcome' for JWT users whose
   * name is already set.
   */
  useEffect(() => {
    if (!token || user === null) return;
    const nextRoute = getAuthRedirectPath({ name: user.name, isFirstLogin: user.isFirstLogin });
    router.replace(nextRoute);
  }, [token, user, router]);

  return (
    <AuthPage
      onLogin={login}
      onSignup={signup}
      onGoogleLogin={loginWithGoogle}
      error={error}
      loading={loading}
    />
  );
}

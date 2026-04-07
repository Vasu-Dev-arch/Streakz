'use client';

/**
 * AuthPageWrapper
 *
 * Client-side shell for /auth.
 * - Reads auth state from useAuth
 * - Redirects to /dashboard if already logged in
 * - Passes Next.js router-based callbacks to the existing AuthPage UI
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { AuthPage } from './AuthPage';

export function AuthPageWrapper() {
  const router = useRouter();
  const { token, login, signup, loginWithGoogle, error, loading } = useAuth();

  // Already authenticated → go straight to dashboard
  useEffect(() => {
    if (token) router.replace('/dashboard');
  }, [token, router]);

  const handleLogin = async (creds) => {
    await login(creds);
    // useAuth sets token in localStorage; the effect above fires on next render
  };

  const handleSignup = async (creds) => {
    await signup(creds);
    // After signup the backend returns isFirstLogin=true, so we send to /welcome
    router.replace('/welcome');
  };

  return (
    <AuthPage
      onLogin={handleLogin}
      onSignup={handleSignup}
      onGoogleLogin={loginWithGoogle}
      error={error}
      loading={loading}
    />
  );
}

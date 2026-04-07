'use client';

/**
 * WelcomePageWrapper
 *
 * Client shell for /welcome.
 * Guards the route (redirect to /auth if no token), then renders
 * the existing WelcomePage UI with a Next.js-router onContinue callback.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { WelcomePage } from './WelcomePage';

export function WelcomePageWrapper() {
  const router = useRouter();
  const { token, user, updateProfile } = useAuth();

  useEffect(() => {
    if (!token) router.replace('/auth');
  }, [token, router]);

  if (!token) return null;

  return (
    <WelcomePage
      initialName={user?.name ?? ''}
      onContinue={async (name) => {
        await updateProfile({ name });
        router.replace('/onboarding');
      }}
    />
  );
}

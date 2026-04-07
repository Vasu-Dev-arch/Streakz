'use client';

/**
 * OnboardingPageWrapper
 *
 * Client shell for /onboarding.
 * Guards the route, then renders the existing OnboardingPage UI with
 * a Next.js-router onFinish callback.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { OnboardingPage } from './OnboardingPage';

export function OnboardingPageWrapper() {
  const router = useRouter();
  const { token, completeOnboarding } = useAuth();

  useEffect(() => {
    if (!token) router.replace('/auth');
  }, [token, router]);

  if (!token) return null;

  return (
    <OnboardingPage
      onFinish={async () => {
        await completeOnboarding();
        router.replace('/dashboard');
      }}
    />
  );
}

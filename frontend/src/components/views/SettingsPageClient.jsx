'use client';

/**
 * SettingsPageClient
 *
 * Consumes HabitsContext for the logout handler and user data,
 * then renders the existing SettingsView.
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { SettingsView } from '../SettingsView';

export function SettingsPageClient() {
  const router = useRouter();
  const { user, logout, fetchMe } = useAuth();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!user && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchMe();
    }
  }, [user, fetchMe]);

  const handleLogout = () => {
    logout();
    router.replace('/auth');
  };

  return <SettingsView user={user} logout={handleLogout} />;
}

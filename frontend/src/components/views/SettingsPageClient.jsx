'use client';

/**
 * SettingsPageClient
 *
 * Consumes HabitsContext for the logout handler and user data,
 * then renders the existing SettingsView.
 */

import { useRouter } from 'next/navigation';
import { useHabitsContext } from '../../context/HabitsContext';
import { useAuth } from '../../hooks/useAuth';
import { SettingsView } from '../SettingsView';

export function SettingsPageClient() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/auth');
  };

  return <SettingsView user={user} logout={handleLogout} />;
}

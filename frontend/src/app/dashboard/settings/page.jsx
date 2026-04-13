export const metadata = {
  title: 'Settings',
  description: 'Manage your Streakz account settings. Update your profile, customize preferences, and track your habit tracking experience.',
  keywords: ['settings', 'account settings', 'preferences', 'profile', 'account'],
};

import { SettingsPageClient } from '../../../components/views/SettingsPageClient';

export default function SettingsPage() {
  return <SettingsPageClient />;
}

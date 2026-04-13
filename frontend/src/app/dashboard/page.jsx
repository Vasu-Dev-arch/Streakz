export const metadata = {
  title: 'Today',
  description: 'Track your daily habits and build streaks with Streakz. See what you need to accomplish today and maintain your momentum.',
  keywords: ['today', 'daily habits', 'habit tracker today', 'daily tracking'],
};

import { TodayPageClient } from '../../components/views/TodayPageClient';

export default function TodayPage() {
  return <TodayPageClient />;
}

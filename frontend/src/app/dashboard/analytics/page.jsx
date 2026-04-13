export const metadata = {
  title: 'Analytics',
  description: 'Analyze your habit performance with detailed charts and insights. See your completion rates, weekly patterns, and progress over time.',
  keywords: ['analytics', 'habit analytics', 'progress tracking', 'statistics', 'charts'],
};

import { AnalyticsPageClient } from '../../../components/views/AnalyticsPageClient';

export default function AnalyticsPage() {
  return <AnalyticsPageClient />;
}

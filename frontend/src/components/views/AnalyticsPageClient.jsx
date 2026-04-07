'use client';

/**
 * AnalyticsPageClient
 *
 * Consumes HabitsContext and renders the existing AnalyticsView.
 */

import { useHabitsContext } from '../../context/HabitsContext';
import { AnalyticsView } from '../AnalyticsView';

export function AnalyticsPageClient() {
  const { habits, completions } = useHabitsContext();

  return <AnalyticsView habits={habits} completions={completions} />;
}

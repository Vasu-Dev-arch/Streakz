'use client';

/**
 * HeatmapPageClient
 *
 * Consumes HabitsContext and renders the existing HeatmapView.
 */

import { useHabitsContext } from '../../context/HabitsContext';
import { HeatmapView } from '../HeatmapView';

export function HeatmapPageClient() {
  const { habits, completions } = useHabitsContext();

  return <HeatmapView habits={habits} completions={completions} />;
}

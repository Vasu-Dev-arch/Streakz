'use client';

/**
 * HeatmapPageClient
 * Consumes HabitsContext (already offline-first via useHabits) and renders HeatmapView.
 * HabitsContext hydrates from IndexedDB cache before any network call, so the
 * heatmap renders immediately even when offline.
 */

import { useHabitsContext } from '../../context/HabitsContext';
import { HeatmapView } from '../HeatmapView';

export function HeatmapPageClient() {
  const { habits, completions, loading } = useHabitsContext();

  // HabitsContext shows cached data immediately — no blank screen offline.
  // loading=true only on very first mount before even the cache resolves.
  if (loading && habits.length === 0) {
    return (
      <div style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: '13px', padding: '20px 0' }}>
        Loading…
      </div>
    );
  }

  return <HeatmapView habits={habits} completions={completions} />;
}

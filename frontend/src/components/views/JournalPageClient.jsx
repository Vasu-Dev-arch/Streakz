'use client';

/**
 * JournalPageClient
 *
 * Client boundary wrapper for the Journal route.
 * Follows the same pattern as TodayPageClient, AnalyticsPageClient, etc.
 * The parent server component (dashboard/journal/page.jsx) exports `metadata`
 * and renders this wrapper, which in turn renders JournalView inside the
 * correct client boundary.
 */

import { JournalView } from '../JournalView';

export function JournalPageClient() {
  return <JournalView />;
}

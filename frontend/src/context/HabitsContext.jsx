'use client';

/**
 * HabitsContext — shares habit data and operations from DashboardShell
 * down to all page-level client components without prop-drilling.
 */
import { createContext, useContext } from 'react';

export const HabitsContext = createContext(null);

export function useHabitsContext() {
  const ctx = useContext(HabitsContext);
  if (!ctx) {
    throw new Error('useHabitsContext must be used within DashboardShell');
  }
  return ctx;
}

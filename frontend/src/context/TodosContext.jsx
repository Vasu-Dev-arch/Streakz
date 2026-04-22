'use client';

import { createContext, useContext } from 'react';

export const TodosContext = createContext(null);

export function useTodosContext() {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('useTodosContext must be used within DashboardShell');
  return ctx;
}

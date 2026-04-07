'use client';

/**
 * Providers — wraps the entire app in all React context providers.
 * This must be a Client Component because ThemeProvider uses
 * localStorage and window.matchMedia.
 */
import { ThemeProvider } from '../themes';

export function Providers({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

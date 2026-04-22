'use client';

/**
 * Providers
 * Wraps the app in context providers, registers the SW, renders the sync pill,
 * and handles the global session-expired event.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '../themes';
import { NetworkStatusBar } from './NetworkStatusBar'; // SyncStatusPill re-exported
import { usePWA } from '../hooks/usePWA';
import { SESSION_EXPIRED_EVENT } from '../utils/tokenUtils';

// ── SW registration ──────────────────────────────────────────────────────────
function PWAInit() {
  usePWA();
  return null;
}

// ── Session-expired toast + redirect ────────────────────────────────────────
function SessionGuard() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);
  // Guard against firing more than once per expiry event
  const handledRef = useRef(false);

  useEffect(() => {
    function onExpired() {
      if (handledRef.current) return;
      handledRef.current = true;

      // Clear the stale token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('streaks_token');
      }

      setShow(true);

      // Redirect after a short window so the user reads the toast
      timerRef.current = setTimeout(() => {
        setShow(false);
        handledRef.current = false;
        router.replace('/auth');
      }, 3200);
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
      clearTimeout(timerRef.current);
    };
  }, [router]);

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes sqSessionSlideUp {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      <div
        role="alert"
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(15,14,23,0.96)',
          border: '1px solid rgba(240,82,82,0.45)',
          borderRadius: '10px',
          padding: '11px 18px',
          color: '#f87171',
          fontSize: '13px',
          fontFamily: 'var(--mono, monospace)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          whiteSpace: 'nowrap',
          animation: 'sqSessionSlideUp 0.25s ease forwards',
          maxWidth: 'calc(100vw - 40px)',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <circle cx="12" cy="16" r="0.5" fill="currentColor" />
        </svg>
        Session expired — redirecting to sign in…
      </div>
    </>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export function Providers({ children }) {
  return (
    <ThemeProvider>
      <PWAInit />
      <NetworkStatusBar />
      <SessionGuard />
      {children}
    </ThemeProvider>
  );
}

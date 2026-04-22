'use client';
/**
 * SyncStatusPill
 * Floating bottom-RIGHT pill showing network / sync state.
 *
 * States:
 *   offline  → always visible (red pill)
 *   syncing  → always visible (amber pill, spinning icon)
 *   synced   → visible briefly then fades out (green pill)
 *   error    → visible for 6 s then fades out (red pill)
 *   idle + online → hidden
 */

import { useEffect, useState } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const STYLES = {
  offline: {
    bg: 'rgba(240,82,82,0.18)',
    border: 'rgba(240,82,82,0.45)',
    color: '#f87171',
    dot: '#f05252',
  },
  syncing: {
    bg: 'rgba(245,166,35,0.15)',
    border: 'rgba(245,166,35,0.4)',
    color: '#fbbf24',
    dot: '#f5a623',
  },
  synced: {
    bg: 'rgba(34,201,122,0.14)',
    border: 'rgba(34,201,122,0.38)',
    color: '#4ade80',
    dot: '#22c97a',
  },
  error: {
    bg: 'rgba(240,82,82,0.15)',
    border: 'rgba(240,82,82,0.4)',
    color: '#f87171',
    dot: '#f05252',
  },
};

function SpinnerIcon() {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'sqPillSpin 0.9s linear infinite', flexShrink: 0 }}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function WifiOffIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function SyncStatusPill() {
  const { isOnline, syncStatus } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const state = !isOnline
    ? 'offline'
    : syncStatus === 'syncing'
    ? 'syncing'
    : syncStatus === 'synced'
    ? 'synced'
    : syncStatus === 'error'
    ? 'error'
    : null;

  useEffect(() => {
    if (state) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (!mounted || !state) return null;

  const s = STYLES[state];
  const label =
    state === 'offline' ? 'Offline'
    : state === 'syncing' ? 'Syncing…'
    : state === 'synced'  ? 'Synced'
    : 'Sync failed';

  const Icon =
    state === 'offline' ? WifiOffIcon
    : state === 'syncing' ? SpinnerIcon
    : state === 'synced'  ? CheckIcon
    : AlertIcon;

  return (
    <>
      <style>{`
        @keyframes sqPillSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .sq-sync-pill {
          position: fixed;
          /* ── PART 3: moved to bottom-right ── */
          bottom: 20px;
          right: 20px;
          left: auto;
          z-index: 1200;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 12px 6px 9px;
          border-radius: 999px;
          font-size: 11.5px;
          font-family: var(--mono, 'DM Mono', monospace);
          font-weight: 500;
          letter-spacing: 0.2px;
          cursor: default;
          user-select: none;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04);
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.25s ease, transform 0.25s ease;
          pointer-events: none;
          /* Never overlap mobile nav or action buttons */
          max-width: calc(100vw - 40px);
        }
        .sq-sync-pill.sq-sync-pill--visible {
          opacity: 1;
          transform: translateY(0);
        }
        .sq-sync-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        /* Mobile: keep right-anchored, just bump bottom up a touch for safe area */
        @media (max-width: 640px) {
          .sq-sync-pill {
            bottom: 16px;
            right: 14px;
          }
        }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={`sq-sync-pill${visible ? ' sq-sync-pill--visible' : ''}`}
        style={{
          background: s.bg,
          border: `1px solid ${s.border}`,
          color: s.color,
        }}
      >
        <div className="sq-sync-dot" style={{ background: s.dot }} />
        <Icon />
        <span>{label}</span>
      </div>
    </>
  );
}

// Keep old export name for backward compatibility
export { SyncStatusPill as NetworkStatusBar };

'use client';
/**
 * OfflineFeatureNotice
 * Drop-in component to show inside pages/features that require internet.
 * Usage: <OfflineFeatureNotice /> — renders only when offline.
 */

import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineFeatureNotice({ message }) {
  const { isOnline } = useNetworkStatus();
  if (isOnline) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 18px',
        borderRadius: 'var(--radius-sm, 8px)',
        background: 'color-mix(in srgb, var(--amber, #f5a623) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--amber, #f5a623) 25%, transparent)',
        color: 'var(--text2, #9090a8)',
        fontSize: '13px',
        lineHeight: '1.6',
        marginBottom: '20px',
      }}
    >
      <span style={{ fontSize: '18px', flexShrink: 0 }}>📡</span>
      <span>
        {message ?? 'Internet required for this feature. Please reconnect to continue.'}
      </span>
    </div>
  );
}

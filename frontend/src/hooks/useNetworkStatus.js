'use client';
/**
 * useNetworkStatus
 * Drives the floating SyncStatusPill.
 * Returns { isOnline, syncStatus, lastSyncAt, syncError }
 *
 * Safety guarantees:
 *  - isSyncing lock is always released (try/finally)
 *  - Does not attempt sync without a valid token
 *  - Does not attempt sync when queue is empty
 *  - Handles onSessionExpired → lets Providers redirect to /auth
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { runSync } from '../utils/syncEngine';
import { getValidToken } from '../utils/tokenUtils';
import { getQueuedActions } from '../utils/offlineDB';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle'|'syncing'|'synced'|'error'
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const clearTimer = useRef(null);
  const isSyncing = useRef(false);

  const attemptSync = useCallback(async () => {
    if (isSyncing.current) return;

    // Skip if no valid token — session expired is handled by Providers
    if (!getValidToken()) return;

    // Skip if nothing queued
    let actions;
    try {
      actions = await getQueuedActions();
    } catch {
      return;
    }
    if (!actions || actions.length === 0) return;

    isSyncing.current = true;
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      await runSync({
        onStart: () => setSyncStatus('syncing'),

        onSuccess: (count) => {
          if (count > 0) {
            setSyncStatus('synced');
            setLastSyncAt(new Date());
            window.dispatchEvent(new CustomEvent('streakz:sync-complete'));
          } else {
            setSyncStatus('idle');
          }
          clearTimeout(clearTimer.current);
          clearTimer.current = setTimeout(() => setSyncStatus('idle'), 3000);
        },

        onError: (err) => {
          setSyncStatus('error');
          setSyncError(err.message);
          clearTimeout(clearTimer.current);
          clearTimer.current = setTimeout(() => setSyncStatus('idle'), 6000);
        },

        onSessionExpired: () => {
          // tokenUtils already dispatched SESSION_EXPIRED_EVENT — just reset UI
          setSyncStatus('idle');
          setSyncError(null);
        },
      });
    } finally {
      // Always release the lock, even if runSync throws unexpectedly
      isSyncing.current = false;
    }
  }, []);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      attemptSync();
    }
    function handleOffline() {
      setIsOnline(false);
      setSyncStatus('idle');
      clearTimeout(clearTimer.current);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Attempt sync on mount (guards inside will bail if nothing to do)
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      attemptSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(clearTimer.current);
    };
  }, [attemptSync]);

  return { isOnline, syncStatus, lastSyncAt, syncError };
}

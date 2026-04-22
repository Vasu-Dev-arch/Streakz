'use client';
/**
 * usePWA
 * Registers the service worker and exposes the install prompt.
 */

import { useState, useEffect } from 'react';

export function usePWA() {
  const [swRegistered, setSwRegistered] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          setSwRegistered(true);
          // Tell the new SW to take over immediately
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        })
        .catch((err) => {
          console.warn('[PWA] SW registration failed:', err);
        });
    }

    // Capture the install prompt
    function onBeforeInstall(e) {
      e.preventDefault();
      setInstallPrompt(e);
    }

    // Detect if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    };
  }, []);

  async function promptInstall() {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
    return outcome === 'accepted';
  }

  return { swRegistered, installPrompt, isInstalled, promptInstall };
}

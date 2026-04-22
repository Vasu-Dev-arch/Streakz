'use client';
/**
 * PWAInstallBanner
 * Shows a subtle install prompt at the bottom of the screen on mobile/desktop
 * when the browser fires beforeinstallprompt.
 * Import this in DashboardShell or layout — it self-dismisses after install.
 */

import { useState, useEffect } from 'react';

export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already dismissed in this session?
    if (typeof sessionStorage !== 'undefined' &&
        sessionStorage.getItem('pwa-banner-dismissed')) {
      setDismissed(true);
    }

    // Already installed (standalone mode)?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    function onPrompt(e) {
      e.preventDefault();
      setPrompt(e);
    }
    function onInstalled() {
      setIsInstalled(true);
      setPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!prompt || dismissed || isInstalled) return null;

  async function handleInstall() {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setPrompt(null);
  }

  function handleDismiss() {
    setDismissed(true);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('pwa-banner-dismissed', '1');
    }
  }

  return (
    <div
      role="banner"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--bg2, #16161d)',
        border: '1px solid var(--accent-a30, rgba(124,106,247,0.3))',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        maxWidth: '420px',
        width: 'calc(100vw - 40px)',
        animation: 'installBannerUp 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <span style={{ fontSize: '24px', flexShrink: 0 }}>📲</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text, #e8e8f0)', marginBottom: '2px' }}>
          Install Streakz
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text3, #6666888)', fontFamily: 'var(--mono, monospace)', lineHeight: 1.4 }}>
          Add to your home screen for the best experience
        </div>
      </div>
      <button
        onClick={handleInstall}
        style={{
          padding: '7px 14px',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--accent, #7c6af7)',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss install banner"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text3, #666688)',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '4px',
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes installBannerUp {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

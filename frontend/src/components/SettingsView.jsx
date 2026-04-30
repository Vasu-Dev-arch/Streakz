'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeSelector } from './ThemeSelector';
import { getMeta, setMeta } from '../utils/offlineDB';
import './SettingsView.css';

const USER_CACHE_KEY = 'settings-user-profile';

// ── Offline-safe fetch ────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('streaks_token') : null;
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? String(res.status));
  return data;
}

export function SettingsView({ user: propUser, logout }) {
  const [activeSection, setActiveSection]   = useState('profile');
  const [isEditingName, setIsEditingName]   = useState(false);
  const [editName, setEditName]             = useState('');
  const [isSaving, setIsSaving]             = useState(false);
  const [saveStatus, setSaveStatus]         = useState(null); // 'saved' | 'offline' | 'error'
  const [isOnline, setIsOnline]             = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Merge prop user with cached user — cached wins for fields not in prop
  const [cachedUser, setCachedUser] = useState(null);
  const user = propUser ?? cachedUser;

  // ── Network listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    const up   = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  // ── Hydrate from IndexedDB cache on mount ─────────────────────────────────
  useEffect(() => {
    getMeta(USER_CACHE_KEY).then((cached) => {
      if (cached) {
        try {
          const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
          setCachedUser(parsed);
          if (!propUser?.name && parsed.name) setEditName(parsed.name);
        } catch { /* ignore corrupt cache */ }
      }
    }).catch(() => {});
  }, []);

  // ── Persist propUser to cache whenever it changes ─────────────────────────
  useEffect(() => {
    if (propUser) {
      setEditName(propUser.name ?? '');
      setMeta(USER_CACHE_KEY, JSON.stringify(propUser)).catch(() => {});
    }
  }, [propUser]);

  // ── Save name ─────────────────────────────────────────────────────────────
  const handleSaveName = useCallback(async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === user?.name) { setIsEditingName(false); return; }

    setIsSaving(true);
    setSaveStatus(null);

    // Optimistic local update
    const updated = { ...(user ?? {}), name: trimmed };
    setCachedUser(updated);
    await setMeta(USER_CACHE_KEY, JSON.stringify(updated)).catch(() => {});

    if (!isOnline) {
      setSaveStatus('offline');
      setIsEditingName(false);
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3500);
      return;
    }

    try {
      const data = await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: trimmed }),
      });
      if (data?.name) {
        const merged = { ...(user ?? {}), ...data };
        setCachedUser(merged);
        await setMeta(USER_CACHE_KEY, JSON.stringify(merged)).catch(() => {});
      }
      setSaveStatus('saved');
      setIsEditingName(false);
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3500);
    }
  }, [editName, user, isOnline]);

  const handleCancelEdit = () => { setEditName(user?.name ?? ''); setIsEditingName(false); };

  const sections = [
    { id: 'general',    label: 'General',    icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'profile',    label: 'Profile',    icon: '👤' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="settings-section">
            <h2 className="settings-section-title">General Settings</h2>
            <p className="settings-placeholder">
              General settings will be available here in a future update.
            </p>
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-section">
            <h2 className="settings-section-title">Appearance</h2>
            <p className="settings-description">Customise the look and feel of your application</p>
            {/* ThemeSelector works entirely client-side — fully offline */}
            <ThemeSelector />
          </div>
        );

      case 'profile':
        return (
          <div className="settings-section">
            <h2 className="settings-section-title">Profile Settings</h2>

            {/* Offline notice */}
            {!isOnline && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'color-mix(in srgb, var(--amber,#f5a623) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--amber,#f5a623) 30%, transparent)',
                borderRadius: 'var(--radius-sm)', padding: '9px 13px',
                fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--amber,#f5a623)',
                marginBottom: '16px',
              }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="1" fill="currentColor" />
                </svg>
                Offline — changes will sync when you reconnect
              </div>
            )}

            <div className="profile-info-card">
              <div className="profile-field">
                <label className="profile-label">Username</label>
                <div className="profile-value-row">
                  {isEditingName ? (
                    <div className="profile-edit-row">
                      <input
                        type="text"
                        className="profile-edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelEdit(); }}
                        autoFocus
                        disabled={isSaving}
                      />
                      <button className="profile-save-btn" onClick={handleSaveName} disabled={isSaving || !editName.trim()}>
                        {isSaving ? '…' : 'Save'}
                      </button>
                      <button className="profile-cancel-btn" onClick={handleCancelEdit} disabled={isSaving}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <span className="profile-value">{user?.name ?? 'Not set'}</span>
                      <button
                        className="profile-edit-icon-btn"
                        onClick={() => { setEditName(user?.name ?? ''); setIsEditingName(true); }}
                        title="Edit username"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                {saveStatus === 'saved'   && <span style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'var(--mono)', marginTop: '4px', display: 'block' }}>✓ Saved</span>}
                {saveStatus === 'offline' && <span style={{ fontSize: '12px', color: 'var(--amber,#f5a623)', fontFamily: 'var(--mono)', marginTop: '4px', display: 'block' }}>Saved locally — will sync on reconnect</span>}
                {saveStatus === 'error'   && <span style={{ fontSize: '12px', color: 'var(--red)', fontFamily: 'var(--mono)', marginTop: '4px', display: 'block' }}>Failed to save</span>}
              </div>

              <div className="profile-field">
                <label className="profile-label">Email</label>
                <span className="profile-value">{user?.email ?? 'Not set'}</span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="profile-logout-btn" onClick={logout}>Logout</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-view">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your application preferences</p>
      </div>

      <div className="settings-content">
        <nav className="settings-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`settings-nav-item${activeSection === section.id ? ' active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="settings-nav-icon">{section.icon}</span>
              <span className="settings-nav-label">{section.label}</span>
            </button>
          ))}
        </nav>
        <div className="settings-main">{renderSection()}</div>
      </div>
    </div>
  );
}

export default SettingsView;

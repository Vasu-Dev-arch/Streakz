'use client';

/**
 * SettingsView
 *
 * Changed from Vite:
 *   - import.meta.env.VITE_API_URL → process.env.NEXT_PUBLIC_API_URL
 *   - Added 'use client' directive
 */

import React, { useState, useEffect } from 'react';
import { ThemeSelector } from './ThemeSelector';
import './SettingsView.css';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export function SettingsView({ user, logout }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setEditName(user.name);
  }, [user]);

  const sections = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const handleSaveName = async () => {
    if (!editName.trim() || editName === user?.name) {
      setIsEditingName(false);
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('streaks_token');
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.name && user) user.name = data.name;
        setIsEditingName(false);
      }
    } catch (err) {
      console.error('Failed to update name:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(user?.name || '');
    setIsEditingName(false);
  };

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
            <p className="settings-description">
              Customise the look and feel of your application
            </p>
            <ThemeSelector />
          </div>
        );

      case 'profile':
        return (
          <div className="settings-section">
            <h2 className="settings-section-title">Profile Settings</h2>

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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                        disabled={isSaving}
                      />
                      <button
                        className="profile-save-btn"
                        onClick={handleSaveName}
                        disabled={isSaving || !editName.trim()}
                      >
                        {isSaving ? '...' : 'Save'}
                      </button>
                      <button
                        className="profile-cancel-btn"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="profile-value">
                        {user?.name || 'Not set'}
                      </span>
                      <button
                        className="profile-edit-icon-btn"
                        onClick={() => {
                          setEditName(user?.name || '');
                          setIsEditingName(true);
                        }}
                        title="Edit username"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label className="profile-label">Email</label>
                <span className="profile-value">
                  {user?.email || 'Not set'}
                </span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="profile-logout-btn" onClick={logout}>
                Logout
              </button>
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
        <p className="settings-subtitle">
          Manage your application preferences
        </p>
      </div>

      <div className="settings-content">
        <nav className="settings-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`settings-nav-item ${
                activeSection === section.id ? 'active' : ''
              }`}
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

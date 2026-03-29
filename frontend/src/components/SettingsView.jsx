/**
 * Settings View Component
 * 
 * Provides settings interface with General, Appearance, and Profile sections.
 */

import React, { useState } from 'react';
import { ThemeSelector } from './ThemeSelector';
import './SettingsView.css';

export function SettingsView() {
  const [activeSection, setActiveSection] = useState('appearance');

  const sections = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'profile', label: 'Profile', icon: '👤' },
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
            <p className="settings-description">
              Customize the look and feel of your application
            </p>
            <ThemeSelector />
          </div>
        );
      
      case 'profile':
        return (
          <div className="settings-section">
            <h2 className="settings-section-title">Profile Settings</h2>
            <p className="settings-placeholder">
              Profile settings will be available here in a future update.
            </p>
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
              className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="settings-nav-icon">{section.icon}</span>
              <span className="settings-nav-label">{section.label}</span>
            </button>
          ))}
        </nav>

        <div className="settings-main">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

export default SettingsView;

/**
 * Theme Selector Component
 * 
 * Provides a UI for selecting and managing themes.
 * Includes preview thumbnails and import/export functionality.
 */

import React, { useState, useRef } from 'react';
import { useTheme } from '../themes/ThemeContext';
import './ThemeSelector.css';

export function ThemeSelector() {
  const {
    currentThemeId,
    themes,
    builtInThemes,
    customThemes,
    setTheme,
    addCustomTheme,
    removeCustomTheme,
    importTheme,
    exportTheme,
  } = useTheme();

  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeColors, setNewThemeColors] = useState({});
  const fileInputRef = useRef(null);

  // Handle theme selection
  const handleThemeSelect = (themeId) => {
    setTheme(themeId);
  };

  // Handle file import
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const theme = importTheme(e.target.result);
        setImportError('');
        setShowImportModal(false);
        setImportJson('');
        // Auto-select imported theme
        setTheme(theme.id);
      } catch (error) {
        setImportError(error.message);
      }
    };
    reader.readAsText(file);
  };

  // Handle JSON import
  const handleJsonImport = () => {
    try {
      const theme = importTheme(importJson);
      setImportError('');
      setShowImportModal(false);
      setImportJson('');
      // Auto-select imported theme
      setTheme(theme.id);
    } catch (error) {
      setImportError(error.message);
    }
  };

  // Handle theme export
  const handleExport = (themeId) => {
    try {
      const json = exportTheme(themeId);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-${themeId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Handle custom theme creation
  const handleCreateTheme = () => {
    if (!newThemeName.trim()) return;

    try {
      // Start with current theme as base
      const baseTheme = themes[currentThemeId];
      const newTheme = addCustomTheme({
        name: newThemeName,
        description: 'Custom theme',
        colors: { ...baseTheme.colors, ...newThemeColors },
      });
      
      setShowCreateModal(false);
      setNewThemeName('');
      setNewThemeColors({});
      // Auto-select new theme
      setTheme(newTheme.id);
    } catch (error) {
      console.error('Create theme failed:', error);
    }
  };

  // Handle color change for custom theme
  const handleColorChange = (token, value) => {
    setNewThemeColors(prev => ({
      ...prev,
      [token]: value,
    }));
  };

  // Render theme preview thumbnail
  const renderThemePreview = (theme) => {
    const { colors } = theme;
    return (
      <div className="theme-preview" aria-hidden="true">
        <div 
          className="theme-preview-bg" 
          style={{ backgroundColor: colors.background }}
        />
        <div 
          className="theme-preview-surface" 
          style={{ backgroundColor: colors.surface }}
        />
        <div 
          className="theme-preview-accent" 
          style={{ backgroundColor: colors.accent }}
        />
        <div 
          className="theme-preview-text" 
          style={{ backgroundColor: colors.text }}
        />
      </div>
    );
  };

  // Color tokens for custom theme editor
  const colorTokens = [
    { key: 'background', label: 'Background' },
    { key: 'backgroundSecondary', label: 'Background Secondary' },
    { key: 'surface', label: 'Surface' },
    { key: 'text', label: 'Text' },
    { key: 'textSecondary', label: 'Text Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'success', label: 'Success' },
    { key: 'warning', label: 'Warning' },
    { key: 'error', label: 'Error' },
  ];

  return (
    <div className="theme-selector">
      <div className="theme-selector-header">
        <h3 className="theme-selector-title">Theme</h3>
        <p className="theme-selector-description">
          Choose a theme or create your own custom theme
        </p>
      </div>

      {/* Built-in themes */}
      <div className="theme-section">
        <h4 className="theme-section-title">Built-in Themes</h4>
        <div className="theme-grid">
          {Object.values(builtInThemes).map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${currentThemeId === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeSelect(theme.id)}
              aria-pressed={currentThemeId === theme.id}
              aria-label={`Select ${theme.name} theme`}
            >
              {renderThemePreview(theme)}
              <div className="theme-option-info">
                <span className="theme-option-name">{theme.name}</span>
                <span className="theme-option-description">{theme.description}</span>
              </div>
              {currentThemeId === theme.id && (
                <span className="theme-option-check" aria-hidden="true">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom themes */}
      <div className="theme-section">
        <div className="theme-section-header">
          <h4 className="theme-section-title">Custom Themes</h4>
          <div className="theme-section-actions">
            <button
              className="theme-btn-secondary"
              onClick={() => setShowCreateModal(true)}
              aria-label="Create new custom theme"
            >
              + Create
            </button>
            <button
              className="theme-btn-secondary"
              onClick={() => setShowImportModal(true)}
              aria-label="Import theme from file"
            >
              Import
            </button>
          </div>
        </div>

        {Object.keys(customThemes).length === 0 ? (
          <div className="theme-empty-state">
            <p>No custom themes yet. Create or import a theme to get started.</p>
          </div>
        ) : (
          <div className="theme-grid">
            {Object.values(customThemes).map((theme) => (
              <div
                key={theme.id}
                className={`theme-option ${currentThemeId === theme.id ? 'active' : ''}`}
              >
                <button
                  className="theme-option-main"
                  onClick={() => handleThemeSelect(theme.id)}
                  aria-pressed={currentThemeId === theme.id}
                  aria-label={`Select ${theme.name} theme`}
                >
                  {renderThemePreview(theme)}
                  <div className="theme-option-info">
                    <span className="theme-option-name">{theme.name}</span>
                    <span className="theme-option-description">{theme.description}</span>
                  </div>
                  {currentThemeId === theme.id && (
                    <span className="theme-option-check" aria-hidden="true">✓</span>
                  )}
                </button>
                <div className="theme-option-actions">
                  <button
                    className="theme-action-btn"
                    onClick={() => handleExport(theme.id)}
                    aria-label={`Export ${theme.name} theme`}
                    title="Export theme"
                  >
                    📤
                  </button>
                  <button
                    className="theme-action-btn theme-action-delete"
                    onClick={() => removeCustomTheme(theme.id)}
                    aria-label={`Delete ${theme.name} theme`}
                    title="Delete theme"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="theme-modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="theme-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="theme-modal-title">Import Theme</h3>
            
            <div className="theme-modal-section">
              <label className="theme-modal-label">Import from file</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="theme-file-input"
              />
            </div>

            <div className="theme-modal-divider">
              <span>or</span>
            </div>

            <div className="theme-modal-section">
              <label className="theme-modal-label">Paste JSON</label>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='{"name": "My Theme", "colors": {...}}'
                className="theme-textarea"
                rows={6}
              />
              {importError && (
                <p className="theme-error">{importError}</p>
              )}
            </div>

            <div className="theme-modal-actions">
              <button
                className="theme-btn-secondary"
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              <button
                className="theme-btn-primary"
                onClick={handleJsonImport}
                disabled={!importJson.trim()}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Theme Modal */}
      {showCreateModal && (
        <div className="theme-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="theme-modal theme-modal-large" onClick={(e) => e.stopPropagation()}>
            <h3 className="theme-modal-title">Create Custom Theme</h3>
            
            <div className="theme-modal-section">
              <label className="theme-modal-label">Theme Name</label>
              <input
                type="text"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="My Custom Theme"
                className="theme-input"
              />
            </div>

            <div className="theme-modal-section">
              <label className="theme-modal-label">Colors</label>
              <div className="theme-color-editor">
                {colorTokens.map(({ key, label }) => (
                  <div key={key} className="theme-color-row">
                    <label className="theme-color-label">{label}</label>
                    <div className="theme-color-input-group">
                      <input
                        type="color"
                        value={newThemeColors[key] || themes[currentThemeId]?.colors[key] || '#000000'}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="theme-color-picker"
                      />
                      <input
                        type="text"
                        value={newThemeColors[key] || themes[currentThemeId]?.colors[key] || ''}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        placeholder="#000000"
                        className="theme-color-text"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="theme-modal-actions">
              <button
                className="theme-btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="theme-btn-primary"
                onClick={handleCreateTheme}
                disabled={!newThemeName.trim()}
              >
                Create Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeSelector;

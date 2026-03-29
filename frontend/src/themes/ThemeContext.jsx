/**
 * Theme Context Provider
 * 
 * Manages theme state, persistence, and provides API for theme switching.
 * Supports localStorage persistence and future backend integration.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { builtInThemes, getThemeById, validateTheme, createCustomTheme, importTheme, exportTheme } from './themeConfig';

// Storage keys
const STORAGE_KEYS = {
  THEME_ID: 'habit-tracker-theme-id',
  CUSTOM_THEMES: 'habit-tracker-custom-themes',
};

// Create context
const ThemeContext = createContext(null);

/**
 * ThemeProvider component
 * Wraps the application to provide theme functionality
 */
export function ThemeProvider({ children }) {
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    // Check localStorage for saved theme
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_ID);
    if (saved && (builtInThemes[saved] || getCustomThemes()[saved])) {
      return saved;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    return 'dark'; // Default theme
  });
  
  const [customThemes, setCustomThemes] = useState(() => getCustomThemes());
  const [isLoading, setIsLoading] = useState(false);

  // Get all available themes (built-in + custom)
  const getAllThemes = useCallback(() => {
    return { ...builtInThemes, ...customThemes };
  }, [customThemes]);

  // Get current theme object
  const currentTheme = getAllThemes()[currentThemeId] || builtInThemes.dark;

  // Apply theme to document
  const applyTheme = useCallback((theme) => {
    if (!theme || !theme.colors) return;
    
    const root = document.documentElement;
    
    // Apply all color tokens as CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
    
    // Set theme metadata
    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-theme-name', theme.name);
    
    // Dispatch event for any listeners
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  }, []);

  // Switch to a different theme
  const setTheme = useCallback((themeId) => {
    const theme = getAllThemes()[themeId];
    if (!theme) {
      console.error(`Theme "${themeId}" not found`);
      return;
    }
    
    setCurrentThemeId(themeId);
    localStorage.setItem(STORAGE_KEYS.THEME_ID, themeId);
    applyTheme(theme);
  }, [getAllThemes, applyTheme]);

  // Add a custom theme
  const addCustomTheme = useCallback((themeDefinition) => {
    try {
      const newTheme = createCustomTheme(themeDefinition);
      
      setCustomThemes(prev => {
        const updated = { ...prev, [newTheme.id]: newTheme };
        localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(updated));
        return updated;
      });
      
      return newTheme;
    } catch (error) {
      console.error('Failed to add custom theme:', error);
      throw error;
    }
  }, []);

  // Remove a custom theme
  const removeCustomTheme = useCallback((themeId) => {
    setCustomThemes(prev => {
      const updated = { ...prev };
      delete updated[themeId];
      localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(updated));
      return updated;
    });
    
    // If current theme was removed, switch to dark
    if (currentThemeId === themeId) {
      setTheme('dark');
    }
  }, [currentThemeId, setTheme]);

  // Import a theme from JSON
  const importThemeFromJson = useCallback((jsonString) => {
    try {
      const theme = importTheme(jsonString);
      addCustomTheme(theme);
      return theme;
    } catch (error) {
      console.error('Failed to import theme:', error);
      throw error;
    }
  }, [addCustomTheme]);

  // Export a theme to JSON
  const exportThemeToJson = useCallback((themeId) => {
    const theme = getAllThemes()[themeId];
    if (!theme) {
      throw new Error(`Theme "${themeId}" not found`);
    }
    return exportTheme(theme);
  }, [getAllThemes]);

  // Get system color scheme preference
  const getSystemPreference = useCallback(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually selected a theme
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME_ID);
      if (!savedTheme) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  // Context value
  const value = {
    // Current theme
    currentTheme,
    currentThemeId,
    
    // All themes
    themes: getAllThemes(),
    builtInThemes,
    customThemes,
    
    // Actions
    setTheme,
    addCustomTheme,
    removeCustomTheme,
    importTheme: importThemeFromJson,
    exportTheme: exportThemeToJson,
    
    // Utilities
    getSystemPreference,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 * @returns {Object} Theme context value
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Helper to get custom themes from localStorage
 */
function getCustomThemes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_THEMES);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export default ThemeContext;

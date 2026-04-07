'use client';

/**
 * Theme Context Provider
 *
 * Manages theme state, persistence, and provides API for theme switching.
 * Must be a Client Component — uses localStorage and window.matchMedia.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  builtInThemes,
  validateTheme,
  createCustomTheme,
  importTheme,
  exportTheme,
} from './themeConfig';

const STORAGE_KEYS = {
  THEME_ID: 'habit-tracker-theme-id',
  CUSTOM_THEMES: 'habit-tracker-custom-themes',
};

const ThemeContext = createContext(null);

function getCustomThemes() {
  try {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_THEMES);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function ThemeProvider({ children }) {
  // Initialise theme from localStorage on the client; default to 'dark'
  // on the server (avoids SSR mismatch — the client effect corrects it).
  const [currentThemeId, setCurrentThemeId] = useState('dark');
  const [customThemes, setCustomThemes] = useState({});
  const [mounted, setMounted] = useState(false);

  // Run once after hydration to apply the persisted theme
  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem(STORAGE_KEYS.THEME_ID);
    const allThemes = { ...builtInThemes, ...getCustomThemes() };

    if (saved && allThemes[saved]) {
      setCurrentThemeId(saved);
    } else if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      setCurrentThemeId('light');
    } else {
      setCurrentThemeId('dark');
    }

    setCustomThemes(getCustomThemes());
  }, []);

  const getAllThemes = useCallback(
    () => ({ ...builtInThemes, ...customThemes }),
    [customThemes]
  );

  const currentTheme =
    getAllThemes()[currentThemeId] || builtInThemes.dark;

  const applyTheme = useCallback((theme) => {
    if (!theme || !theme.colors) return;
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-theme-name', theme.name);
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  }, []);

  const setTheme = useCallback(
    (themeId) => {
      const theme = getAllThemes()[themeId];
      if (!theme) {
        console.error(`Theme "${themeId}" not found`);
        return;
      }
      setCurrentThemeId(themeId);
      localStorage.setItem(STORAGE_KEYS.THEME_ID, themeId);
      applyTheme(theme);
    },
    [getAllThemes, applyTheme]
  );

  const addCustomTheme = useCallback((themeDefinition) => {
    try {
      const newTheme = createCustomTheme(themeDefinition);
      setCustomThemes((prev) => {
        const updated = { ...prev, [newTheme.id]: newTheme };
        localStorage.setItem(
          STORAGE_KEYS.CUSTOM_THEMES,
          JSON.stringify(updated)
        );
        return updated;
      });
      return newTheme;
    } catch (error) {
      console.error('Failed to add custom theme:', error);
      throw error;
    }
  }, []);

  const removeCustomTheme = useCallback(
    (themeId) => {
      setCustomThemes((prev) => {
        const updated = { ...prev };
        delete updated[themeId];
        localStorage.setItem(
          STORAGE_KEYS.CUSTOM_THEMES,
          JSON.stringify(updated)
        );
        return updated;
      });
      if (currentThemeId === themeId) setTheme('dark');
    },
    [currentThemeId, setTheme]
  );

  const importThemeFromJson = useCallback(
    (jsonString) => {
      try {
        const theme = importTheme(jsonString);
        addCustomTheme(theme);
        return theme;
      } catch (error) {
        console.error('Failed to import theme:', error);
        throw error;
      }
    },
    [addCustomTheme]
  );

  const exportThemeToJson = useCallback(
    (themeId) => {
      const theme = getAllThemes()[themeId];
      if (!theme) throw new Error(`Theme "${themeId}" not found`);
      return exportTheme(theme);
    },
    [getAllThemes]
  );

  const getSystemPreference = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      return 'light';
    }
    return 'dark';
  }, []);

  // Listen for OS-level colour scheme changes
  useEffect(() => {
    if (!mounted) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME_ID);
      if (!savedTheme) setTheme(e.matches ? 'light' : 'dark');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, setTheme]);

  // Apply theme whenever it changes (including initial mount)
  useEffect(() => {
    if (!mounted) return;
    applyTheme(currentTheme);
  }, [mounted, currentTheme, applyTheme]);

  const value = {
    currentTheme,
    currentThemeId,
    themes: getAllThemes(),
    builtInThemes,
    customThemes,
    setTheme,
    addCustomTheme,
    removeCustomTheme,
    importTheme: importThemeFromJson,
    exportTheme: exportThemeToJson,
    getSystemPreference,
    isLoading: false,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;

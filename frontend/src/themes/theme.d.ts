/**
 * Theme System TypeScript Definitions
 * 
 * Type definitions for the theme system.
 */

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundQuaternary: string;
  
  // Surface colors
  surface: string;
  surfaceHover: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Accent colors
  accent: string;
  accentSecondary: string;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Interactive states
  focus: string;
  hover: string;
  active: string;
  disabled: string;
  
  // Shadows
  shadow: string;
  shadowLg: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  isBuiltIn: boolean;
  colors: ThemeColors;
}

export interface ThemeContextValue {
  // Current theme
  currentTheme: Theme;
  currentThemeId: string;
  
  // All themes
  themes: Record<string, Theme>;
  builtInThemes: Record<string, Theme>;
  customThemes: Record<string, Theme>;
  
  // Actions
  setTheme: (themeId: string) => void;
  addCustomTheme: (themeDefinition: Partial<Theme> & { name: string; colors: Partial<ThemeColors> }) => Theme;
  removeCustomTheme: (themeId: string) => void;
  importTheme: (jsonString: string) => Theme;
  exportTheme: (themeId: string) => string;
  
  // Utilities
  getSystemPreference: () => 'light' | 'dark';
  isLoading: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  isBuiltIn: boolean;
  colors: ThemeColors;
}

export interface ThemeExport {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  version: string;
  exportedAt: string;
}

export declare const ThemeProvider: React.FC<{ children: React.ReactNode }>;
export declare const useTheme: () => ThemeContextValue;

export declare const builtInThemes: Record<string, Theme>;
export declare const lightTheme: Theme;
export declare const darkTheme: Theme;
export declare const nordTheme: Theme;
export declare const monokaiTheme: Theme;

export declare const getThemeById: (themeId: string) => Theme | null;
export declare const validateTheme: (theme: Theme) => boolean;
export declare const createCustomTheme: (themeDefinition: Partial<Theme> & { name: string; colors: Partial<ThemeColors> }) => Theme;
export declare const exportTheme: (theme: Theme) => string;
export declare const importTheme: (jsonString: string) => Theme;

export declare const BASE_TOKENS: Record<keyof ThemeColors, string>;

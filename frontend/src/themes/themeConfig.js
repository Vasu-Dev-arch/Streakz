/**
 * Theme Configuration System
 * 
 * Defines the base theme structure with required color tokens.
 * Supports light, dark, and custom themes with WCAG 2.1 compliance.
 */

// Base color tokens that all themes must define
export const BASE_TOKENS = {
  // Background colors
  background: 'Main background color',
  backgroundSecondary: 'Secondary background (sidebar, cards)',
  backgroundTertiary: 'Tertiary background (hover states)',
  backgroundQuaternary: 'Quaternary background (active states)',
  
  // Surface colors
  surface: 'Surface color for cards and panels',
  surfaceHover: 'Surface hover state',
  
  // Border colors
  border: 'Primary border color',
  borderSecondary: 'Secondary border color (more prominent)',
  
  // Text colors
  text: 'Primary text color',
  textSecondary: 'Secondary text color',
  textTertiary: 'Tertiary text color (muted)',
  textInverse: 'Text color for dark backgrounds',
  
  // Accent colors
  accent: 'Primary accent color',
  accentSecondary: 'Secondary accent color',
  
  // Semantic colors
  success: 'Success state color',
  warning: 'Warning state color',
  error: 'Error state color',
  info: 'Information state color',
  
  // Interactive states
  focus: 'Focus ring color',
  hover: 'Hover state overlay',
  active: 'Active state overlay',
  disabled: 'Disabled state color',
  
  // Shadows
  shadow: 'Shadow color',
  shadowLg: 'Large shadow color',
};

// Light theme - high contrast, WCAG AA compliant
export const lightTheme = {
  id: 'light',
  name: 'Light',
  description: 'Clean light theme with high contrast',
  isBuiltIn: true,
  colors: {
    // Backgrounds
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#e9ecef',
    backgroundQuaternary: '#dee2e6',
    
    // Surfaces
    surface: '#ffffff',
    surfaceHover: '#f8f9fa',
    
    // Borders
    border: 'rgba(0, 0, 0, 0.1)',
    borderSecondary: 'rgba(0, 0, 0, 0.2)',
    
    // Text
    text: '#1a1a1a',
    textSecondary: '#4a4a4a',
    textTertiary: '#6c757d',
    textInverse: '#ffffff',
    
    // Accents
    accent: '#7c6af7',
    accentSecondary: '#a599ff',
    
    // Semantic
    success: '#22c97a',
    warning: '#f5a623',
    error: '#f05252',
    info: '#3b82f6',
    
    // Interactive
    focus: '#7c6af7',
    hover: 'rgba(0, 0, 0, 0.05)',
    active: 'rgba(0, 0, 0, 0.1)',
    disabled: '#adb5bd',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLg: 'rgba(0, 0, 0, 0.15)',
  },
};

// Dark theme - current default, WCAG AA compliant
export const darkTheme = {
  id: 'dark',
  name: 'Dark',
  description: 'Default dark theme',
  isBuiltIn: true,
  colors: {
    // Backgrounds
    background: '#0d0d0f',
    backgroundSecondary: '#131316',
    backgroundTertiary: '#1a1a1e',
    backgroundQuaternary: '#222228',
    
    // Surfaces
    surface: '#131316',
    surfaceHover: '#1a1a1e',
    
    // Borders
    border: 'rgba(255, 255, 255, 0.07)',
    borderSecondary: 'rgba(255, 255, 255, 0.12)',
    
    // Text
    text: '#e8e8ec',
    textSecondary: '#8a8a96',
    textTertiary: '#5a5a68',
    textInverse: '#0d0d0f',
    
    // Accents
    accent: '#7c6af7',
    accentSecondary: '#a599ff',
    
    // Semantic
    success: '#22c97a',
    warning: '#f5a623',
    error: '#f05252',
    info: '#3b82f6',
    
    // Interactive
    focus: '#7c6af7',
    hover: 'rgba(255, 255, 255, 0.05)',
    active: 'rgba(255, 255, 255, 0.1)',
    disabled: '#5a5a68',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLg: 'rgba(0, 0, 0, 0.5)',
  },
};

// Nord-inspired theme - WCAG AA compliant
export const nordTheme = {
  id: 'nord',
  name: 'Nord',
  description: 'Arctic, north-bluish color palette',
  isBuiltIn: true,
  colors: {
    // Backgrounds
    background: '#2e3440',
    backgroundSecondary: '#3b4252',
    backgroundTertiary: '#434c5e',
    backgroundQuaternary: '#4c566a',
    
    // Surfaces
    surface: '#3b4252',
    surfaceHover: '#434c5e',
    
    // Borders
    border: 'rgba(216, 222, 233, 0.1)',
    borderSecondary: 'rgba(216, 222, 233, 0.2)',
    
    // Text
    text: '#eceff4',
    textSecondary: '#d8dee9',
    textTertiary: '#a5adbd',
    textInverse: '#2e3440',
    
    // Accents
    accent: '#88c0d0',
    accentSecondary: '#81a1c1',
    
    // Semantic
    success: '#a3be8c',
    warning: '#ebcb8b',
    error: '#bf616a',
    info: '#5e81ac',
    
    // Interactive
    focus: '#88c0d0',
    hover: 'rgba(216, 222, 233, 0.05)',
    active: 'rgba(216, 222, 233, 0.1)',
    disabled: '#4c566a',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLg: 'rgba(0, 0, 0, 0.5)',
  },
};

// Monokai-inspired theme - WCAG AA compliant
export const monokaiTheme = {
  id: 'monokai',
  name: 'Monokai',
  description: 'Vibrant, high-contrast theme',
  isBuiltIn: true,
  colors: {
    // Backgrounds
    background: '#272822',
    backgroundSecondary: '#2d2e27',
    backgroundTertiary: '#3e3d32',
    backgroundQuaternary: '#49483e',
    
    // Surfaces
    surface: '#2d2e27',
    surfaceHover: '#3e3d32',
    
    // Borders
    border: 'rgba(255, 255, 255, 0.1)',
    borderSecondary: 'rgba(255, 255, 255, 0.2)',
    
    // Text
    text: '#f8f8f2',
    textSecondary: '#cfcfc2',
    textTertiary: '#75715e',
    textInverse: '#272822',
    
    // Accents
    accent: '#f92672',
    accentSecondary: '#ae81ff',
    
    // Semantic
    success: '#a6e22e',
    warning: '#e6db74',
    error: '#f92672',
    info: '#66d9ef',
    
    // Interactive
    focus: '#f92672',
    hover: 'rgba(255, 255, 255, 0.05)',
    active: 'rgba(255, 255, 255, 0.1)',
    disabled: '#75715e',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLg: 'rgba(0, 0, 0, 0.5)',
  },
};

// Export all built-in themes
export const builtInThemes = {
  light: lightTheme,
  dark: darkTheme,
  nord: nordTheme,
  monokai: monokaiTheme,
};

// Get theme by ID
export function getThemeById(themeId) {
  return builtInThemes[themeId] || null;
}

// Validate theme structure
export function validateTheme(theme) {
  const requiredKeys = Object.keys(BASE_TOKENS);
  const themeKeys = Object.keys(theme.colors || {});
  
  const missingKeys = requiredKeys.filter(key => !themeKeys.includes(key));
  
  if (missingKeys.length > 0) {
    console.warn(`Theme "${theme.id}" is missing required tokens:`, missingKeys);
    return false;
  }
  
  return true;
}

// Create a custom theme with validation
export function createCustomTheme(themeDefinition) {
  const theme = {
    id: themeDefinition.id || `custom-${Date.now()}`,
    name: themeDefinition.name || 'Custom Theme',
    description: themeDefinition.description || '',
    isBuiltIn: false,
    colors: {
      ...themeDefinition.colors,
    },
  };
  
  if (!validateTheme(theme)) {
    throw new Error(`Invalid theme structure for "${theme.name}"`);
  }
  
  return theme;
}

// Export theme for sharing
export function exportTheme(theme) {
  return JSON.stringify({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    colors: theme.colors,
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

// Import theme from JSON
export function importTheme(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!parsed.colors || !parsed.name) {
      throw new Error('Invalid theme format');
    }
    
    return createCustomTheme({
      id: parsed.id || `imported-${Date.now()}`,
      name: parsed.name,
      description: parsed.description || 'Imported theme',
      colors: parsed.colors,
    });
  } catch (error) {
    throw new Error(`Failed to import theme: ${error.message}`);
  }
}

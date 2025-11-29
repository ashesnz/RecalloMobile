/**
 * RecalloMobile Color System
 * Comprehensive color palette with light and dark mode support
 */

// Light theme colors
export const lightColors = {
  // Primary brand color - Purple/Indigo theme
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',  // Main primary
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Secondary - Teal/Cyan
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',  // Main secondary
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  // Neutral grays
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Success - Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning - Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error - Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Info - Blue
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
};

// Dark theme colors
export const darkColors = {
  primary: {
    50: '#4c1d95',
    100: '#5b21b6',
    200: '#6d28d9',
    300: '#7c3aed',
    400: '#8b5cf6',
    500: '#a78bfa',  // Main primary in dark mode
    600: '#c4b5fd',
    700: '#ddd6fe',
    800: '#ede9fe',
    900: '#f5f3ff',
  },

  secondary: {
    50: '#164e63',
    100: '#155e75',
    200: '#0e7490',
    300: '#0891b2',
    400: '#06b6d4',
    500: '#22d3ee',  // Main secondary in dark mode
    600: '#67e8f9',
    700: '#a5f3fc',
    800: '#cffafe',
    900: '#ecfeff',
  },

  gray: {
    50: '#0a0a0a',
    100: '#171717',
    200: '#262626',
    300: '#404040',
    400: '#525252',
    500: '#737373',
    600: '#a3a3a3',
    700: '#d4d4d4',
    800: '#e5e5e5',
    900: '#f5f5f5',
    950: '#fafafa',
  },

  success: {
    50: '#14532d',
    100: '#166534',
    200: '#15803d',
    300: '#16a34a',
    400: '#22c55e',
    500: '#4ade80',
    600: '#86efac',
    700: '#bbf7d0',
    800: '#dcfce7',
    900: '#f0fdf4',
  },

  warning: {
    50: '#78350f',
    100: '#92400e',
    200: '#b45309',
    300: '#d97706',
    400: '#f59e0b',
    500: '#fbbf24',
    600: '#fcd34d',
    700: '#fde68a',
    800: '#fef3c7',
    900: '#fffbeb',
  },

  error: {
    50: '#7f1d1d',
    100: '#991b1b',
    200: '#b91c1c',
    300: '#dc2626',
    400: '#ef4444',
    500: '#f87171',
    600: '#fca5a5',
    700: '#fecaca',
    800: '#fee2e2',
    900: '#fef2f2',
  },

  info: {
    50: '#1e3a8a',
    100: '#1e40af',
    200: '#1d4ed8',
    300: '#2563eb',
    400: '#3b82f6',
    500: '#60a5fa',
    600: '#93c5fd',
    700: '#bfdbfe',
    800: '#dbeafe',
    900: '#eff6ff',
  },
};

// Semantic color mappings for easy use
export const Colors = {
  // Light theme defaults
  light: {
    primary: lightColors.primary[500],
    primaryLight: lightColors.primary[100],
    primaryDark: lightColors.primary[700],

    secondary: lightColors.secondary[500],
    secondaryLight: lightColors.secondary[100],

    background: '#ffffff',
    backgroundSecondary: lightColors.gray[50],
    surface: '#ffffff',
    surfaceSecondary: lightColors.gray[100],

    text: lightColors.gray[900],
    textSecondary: lightColors.gray[600],
    textTertiary: lightColors.gray[500],
    textInverse: '#ffffff',

    border: lightColors.gray[200],
    borderLight: lightColors.gray[100],
    borderDark: lightColors.gray[300],

    success: lightColors.success[500],
    successLight: lightColors.success[100],
    warning: lightColors.warning[500],
    warningLight: lightColors.warning[100],
    error: lightColors.error[500],
    errorLight: lightColors.error[100],
    info: lightColors.info[500],
    infoLight: lightColors.info[100],

    // Grade colors
    gradeA: lightColors.success[600],
    gradeB: lightColors.success[400],
    gradeC: lightColors.warning[500],
    gradeD: lightColors.warning[600],
    gradeF: lightColors.error[500],

    // Special
    recording: lightColors.error[500],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Dark theme
  dark: {
    primary: darkColors.primary[500],
    primaryLight: darkColors.primary[300],
    primaryDark: darkColors.primary[600],

    secondary: darkColors.secondary[500],
    secondaryLight: darkColors.secondary[300],

    background: darkColors.gray[50],
    backgroundSecondary: darkColors.gray[100],
    surface: darkColors.gray[100],
    surfaceSecondary: darkColors.gray[200],

    text: darkColors.gray[900],
    textSecondary: darkColors.gray[600],
    textTertiary: darkColors.gray[500],
    textInverse: darkColors.gray[50],

    border: darkColors.gray[300],
    borderLight: darkColors.gray[200],
    borderDark: darkColors.gray[400],

    success: darkColors.success[500],
    successLight: darkColors.success[300],
    warning: darkColors.warning[500],
    warningLight: darkColors.warning[300],
    error: darkColors.error[500],
    errorLight: darkColors.error[300],
    info: darkColors.info[500],
    infoLight: darkColors.info[300],

    // Grade colors
    gradeA: darkColors.success[500],
    gradeB: darkColors.success[600],
    gradeC: darkColors.warning[500],
    gradeD: darkColors.warning[400],
    gradeF: darkColors.error[500],

    // Special
    recording: darkColors.error[500],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

// Legacy compatibility - default to light theme
export const LegacyColors = Colors.light;



/**
 * RecalloMobile Theme System
 * Comprehensive design tokens including colors, typography, spacing, and more
 */

import { Platform } from 'react-native';
import { Colors as ColorPalette } from './colors';

const tintColorLight = ColorPalette.light.primary;
const tintColorDark = ColorPalette.dark.primary;

export const Colors = {
  light: {
    text: ColorPalette.light.text,
    textSecondary: ColorPalette.light.textSecondary,
    background: ColorPalette.light.background,
    backgroundSecondary: ColorPalette.light.backgroundSecondary,
    tint: tintColorLight,
    icon: ColorPalette.light.textSecondary,
    tabIconDefault: ColorPalette.light.textSecondary,
    tabIconSelected: tintColorLight,
    border: ColorPalette.light.border,
    card: ColorPalette.light.surface,
    primary: ColorPalette.light.primary,
    error: ColorPalette.light.error,
    success: ColorPalette.light.success,
    warning: ColorPalette.light.warning,
  },
  dark: {
    text: ColorPalette.dark.text,
    textSecondary: ColorPalette.dark.textSecondary,
    background: ColorPalette.dark.background,
    backgroundSecondary: ColorPalette.dark.backgroundSecondary,
    tint: tintColorDark,
    icon: ColorPalette.dark.textSecondary,
    tabIconDefault: ColorPalette.dark.textSecondary,
    tabIconSelected: tintColorDark,
    border: ColorPalette.dark.border,
    card: ColorPalette.dark.surface,
    primary: ColorPalette.dark.primary,
    error: ColorPalette.dark.error,
    success: ColorPalette.dark.success,
    warning: ColorPalette.dark.warning,
  },
};

// Typography system
export const Typography = {
  fontSize: {
    xs: 12,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing system (based on 4px grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// Border radius
export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Shadow/Elevation
export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Icon sizes
export const IconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 64,
};

// Font families
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'ui-serif',
    rounded: 'System',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'Roboto',
    mono: 'monospace',
  },
  default: {
    sans: 'system-ui',
    serif: 'serif',
    rounded: 'system-ui',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Animation durations
export const Animation = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Layout constants
export const Layout = {
  maxWidth: 768, // Max width for content on tablets/desktop
  containerPadding: Spacing.base,
  headerHeight: 56,
  tabBarHeight: 60,
};



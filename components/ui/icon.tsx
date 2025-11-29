import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { IconSize, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface IconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | number;
  color?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'text' | 'textSecondary';
}

export function Icon({ name, size = 'md', color, variant }: IconProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Determine icon size
  const iconSize = typeof size === 'number' ? size : IconSize[size];

  // Determine icon color
  let iconColor = color;
  if (!iconColor && variant) {
    switch (variant) {
      case 'primary':
        iconColor = themeColors.primary;
        break;
      case 'secondary':
        iconColor = themeColors.textSecondary;
        break;
      case 'success':
        iconColor = themeColors.success;
        break;
      case 'warning':
        iconColor = themeColors.warning;
        break;
      case 'error':
        iconColor = themeColors.error;
        break;
      case 'text':
        iconColor = themeColors.text;
        break;
      case 'textSecondary':
        iconColor = themeColors.textSecondary;
        break;
      default:
        iconColor = themeColors.text;
    }
  }

  return <Ionicons name={name} size={iconSize} color={iconColor || themeColors.text} />;
}

// Predefined icon components for common use cases
export const MicIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="mic" {...props} />
);

export const MicCircleIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="mic-circle" {...props} />
);

export const SettingsIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="settings-outline" {...props} />
);

export const CloseIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="close" {...props} />
);

export const CheckIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="checkmark" {...props} />
);

export const SearchIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="search" {...props} />
);

export const FolderIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="folder-outline" {...props} />
);

export const TimeIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="time-outline" {...props} />
);

export const CalendarIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="calendar-outline" {...props} />
);

export const ChartIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="analytics-outline" {...props} />
);

export const ChatIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="chatbubbles-outline" {...props} />
);

export const HelpIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="help-circle-outline" {...props} />
);

export const RefreshIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="refresh" {...props} />
);

export const LockIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="lock-closed" {...props} />
);

export const MailIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="mail-outline" {...props} />
);

export const ArrowForwardIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="arrow-forward" {...props} />
);

export const AlertIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="alert-circle" {...props} />
);

export const EyeIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="eye-outline" {...props} />
);

export const EyeOffIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="eye-off-outline" {...props} />
);


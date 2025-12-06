import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Layout, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Compute bottom offset so the floating bar sits above system UI and gestures.
  const bottomOffset = (insets?.bottom ?? 0) + 12;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          // Make the bar float with horizontal margins on larger devices
          position: 'absolute',
          left: Platform.OS === 'web' ? 0 : 16,
          right: Platform.OS === 'web' ? 0 : 16,
          bottom: Platform.OS === 'web' ? 0 : bottomOffset,
          height: Layout.tabBarHeight,
          borderRadius: BorderRadius.xl,
          paddingHorizontal: Spacing.lg,
          // Subtle shadow that is stronger in dark mode to lift the bar visually
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: colorScheme === 'dark' ? 0.6 : 0.08,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSize.sm,
          marginBottom: 4,
        },
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recallo',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="mic.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

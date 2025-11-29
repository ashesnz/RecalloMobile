import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MicCircleIcon } from '@/components/ui/icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';

interface DailyQuestionsWidgetProps {
  onPress: () => void;
}

export function DailyQuestionsWidget({ onPress }: DailyQuestionsWidgetProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            3 Questions of the Day
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Answer today&apos;s questions by voice and get instant feedback
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <MicCircleIcon size="3xl" variant="primary" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.md,
    borderWidth: 1,
    ...Shadow.medium,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});


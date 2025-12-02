import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MicCircleIcon } from '@/components/ui/icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';

interface DailyQuestionsWidgetProps {
  onPress: () => void;
  questionCount?: number;
  isLoading?: boolean;
}

export function DailyQuestionsWidget({ onPress, questionCount = 0, isLoading = false }: DailyQuestionsWidgetProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const displayText = isLoading
    ? 'Loading questions...'
    : questionCount > 0
      ? `${questionCount} Question${questionCount !== 1 ? 's' : ''} of the Day`
      : 'No questions available';

  const descriptionText = isLoading
    ? 'Fetching your daily questions'
    : questionCount > 0
      ? 'Answer today\'s questions by voice and get instant feedback'
      : 'Check back later for new questions';

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
      disabled={isLoading || questionCount === 0}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {displayText}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {descriptionText}
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


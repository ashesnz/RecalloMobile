import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { QuestionResult } from '@/types/question';
import { ChatIcon, RefreshIcon } from '@/components/ui/icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors as ThemeColors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { Colors as ColorPalette } from '@/constants/colors';

interface ResultsScreenProps {
  results: QuestionResult[];
  onQuestionPress: (result: QuestionResult) => void;
  onRestart?: () => void;
}

export function ResultsScreen({ results, onQuestionPress, onRestart }: ResultsScreenProps) {
  const colorScheme = useColorScheme();
  const colors = ThemeColors[colorScheme ?? 'light'];


  const getGradeColor = (grade: string) => {
    const gradeColors = colorScheme === 'dark' ? ColorPalette.dark : ColorPalette.light;
    switch (grade) {
      case 'A': return gradeColors.gradeA;
      case 'B': return gradeColors.gradeB;
      case 'C': return gradeColors.gradeC;
      case 'D': return gradeColors.gradeD;
      case 'F': return gradeColors.gradeF;
      default: return colors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Individual Question Results */}
        <View style={styles.resultsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Results
          </Text>

          {results.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No results available. Please complete the questions first.
              </Text>
            </View>
          ) : (
            results.map((result, index) => (
            <Pressable
              key={result.questionId}
              style={({ pressed }) => [
                styles.resultCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => onQuestionPress(result)}
            >
              <View style={styles.resultHeader}>
                <View style={styles.resultHeaderLeft}>
                  <Text style={[styles.questionNumber, { color: colors.text }]}>Q{index + 1}</Text>
                  <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(result.grade) }]}>
                    <Text style={styles.gradeBadgeText}>{result.grade}</Text>
                  </View>
                </View>
                <Text style={[styles.scoreLabel, { color: getGradeColor(result.grade) }]}>
                  {result.score}%
                </Text>
              </View>

              <Text style={[styles.questionText, { color: colors.textSecondary }]} numberOfLines={2}>
                {result.question}
              </Text>

              <View style={styles.feedbackPreview}>
                <ChatIcon size="xs" variant="textSecondary" />
                <Text style={[styles.feedbackText, { color: colors.textSecondary }]} numberOfLines={1}>
                  Tap to view feedback
                </Text>
              </View>
            </Pressable>
          ))
          )}
        </View>

        {/* Restart Button */}
        {onRestart && (
          <Pressable
            style={({ pressed }) => [
              styles.restartButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onRestart}
          >
            <RefreshIcon size="md" color="#ffffff" />
            <Text style={styles.restartButtonText}>Start New Session</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  resultsContainer: {
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  resultCard: {
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    borderWidth: 1,
    ...Shadow.small,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  questionNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  gradeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  gradeBadgeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  questionText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  feedbackPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  feedbackText: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
    ...Shadow.medium,
  },
  restartButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#ffffff',
  },
});


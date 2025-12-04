import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { QuestionResult } from '@/types/question';
import { CloseIcon, HelpIcon, ChatIcon, ChartIcon } from '@/components/ui/icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors as ThemeColors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { Colors as ColorPalette } from '@/constants/colors';

interface FeedbackDetailProps {
  result: QuestionResult;
  questionNumber: number;
  onClose: () => void;
}

export function FeedbackDetail({ result, questionNumber, onClose }: FeedbackDetailProps) {
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

  const gradeColor = getGradeColor(result.grade);
  const isNotAnswered = result.feedback === 'N/A - Question skipped' || result.feedback === 'N/A - Question not answered';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <CloseIcon size="lg" color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Question {questionNumber}
          </Text>
        </View>

        {/* Grade Card */}
        <View style={[styles.gradeCard, { backgroundColor: colors.card, borderColor: gradeColor }]}>
          <View style={[styles.gradeCircle, { backgroundColor: gradeColor }]}>
            <Text style={styles.gradeText}>{isNotAnswered ? 'N/A' : result.grade}</Text>
          </View>
          {!isNotAnswered && (
            <Text style={[styles.scoreText, { color: gradeColor }]}>
              {result.score}%
            </Text>
          )}
        </View>

        {/* Question */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpIcon size="md" variant="primary" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Question</Text>
          </View>
          <View style={[styles.questionBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.questionText, { color: colors.text }]}>{result.question}</Text>
          </View>
        </View>

        {/* Feedback */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ChatIcon size="md" variant="primary" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Feedback</Text>
          </View>
          <View style={[styles.feedbackBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>{result.feedback}</Text>
          </View>
        </View>

        {/* User Answer - only show if answered */}
        {!isNotAnswered && result.userAnswer && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ChatIcon size="md" variant="primary" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Answer</Text>
            </View>
            <View style={[styles.answerBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.answerText, { color: colors.text }]}>{result.userAnswer}</Text>
            </View>
          </View>
        )}

        {/* Correct Answer - only show if answered and available */}
        {!isNotAnswered && result.correctAnswer && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <HelpIcon size="md" variant="primary" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Expected Answer</Text>
            </View>
            <View style={[styles.answerBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <Text style={[styles.answerText, { color: colors.text }]}>{result.correctAnswer}</Text>
            </View>
          </View>
        )}

        {/* Performance Indicators - hide for N/A */}
        {!isNotAnswered && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ChartIcon size="md" variant="primary" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
            </View>
            <View style={styles.performanceContainer}>
              <View style={styles.performanceItem}>
                <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>Grade</Text>
                <View style={[styles.performanceValue, { backgroundColor: gradeColor }]}>
                  <Text style={styles.performanceValueText}>{result.grade}</Text>
                </View>
              </View>
              <View style={styles.performanceItem}>
                <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>Score</Text>
                <View style={[styles.performanceValue, { backgroundColor: gradeColor }]}>
                  <Text style={styles.performanceValueText}>{result.score}%</Text>
                </View>
              </View>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: Spacing.xs,
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  gradeCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    marginBottom: Spacing.xl,
    ...Shadow.medium,
  },
  gradeCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gradeText: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  scoreText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  questionBubble: {
    padding: Spacing.base,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  questionText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  feedbackBox: {
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  answerBox: {
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  answerText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  performanceContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  performanceItem: {
    flex: 1,
    gap: Spacing.sm,
  },
  performanceLabel: {
    fontSize: Typography.fontSize.sm,
  },
  performanceValue: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  performanceValueText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
});


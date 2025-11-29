import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { QuestionResult } from '@/types/question';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface FeedbackDetailProps {
  result: QuestionResult;
  questionNumber: number;
  onClose: () => void;
}

export function FeedbackDetail({ result, questionNumber, onClose }: FeedbackDetailProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return Colors.gradeA;
      case 'B': return Colors.gradeB;
      case 'C': return Colors.gradeC;
      case 'D': return Colors.gradeD;
      case 'F': return Colors.gradeF;
      default: return Colors.primary;
    }
  };

  const gradeColor = getGradeColor(result.grade);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Question {questionNumber}</Text>
        </View>

        {/* Grade Card */}
        <View style={[styles.gradeCard, { borderColor: gradeColor }]}>
          <View style={[styles.gradeCircle, { backgroundColor: gradeColor }]}>
            <Text style={styles.gradeText}>{result.grade}</Text>
          </View>
          <Text style={[styles.scoreText, { color: gradeColor }]}>
            {result.score}%
          </Text>
        </View>

        {/* Question */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Question</Text>
          </View>
          <View style={styles.questionBubble}>
            <Text style={styles.questionText}>{result.question}</Text>
          </View>
        </View>

        {/* Feedback */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Feedback</Text>
          </View>
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>{result.feedback}</Text>
          </View>
        </View>

        {/* Performance Indicators */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Performance</Text>
          </View>
          <View style={styles.performanceContainer}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Grade</Text>
              <View style={[styles.performanceValue, { backgroundColor: gradeColor }]}>
                <Text style={styles.performanceValueText}>{result.grade}</Text>
              </View>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Score</Text>
              <View style={[styles.performanceValue, { backgroundColor: gradeColor }]}>
                <Text style={styles.performanceValueText}>{result.score}%</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  gradeCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
    backgroundColor: Colors.white,
  },
  gradeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gradeText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.white,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  questionBubble: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.white,
  },
  feedbackBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  performanceContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceItem: {
    flex: 1,
    gap: 8,
  },
  performanceLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  performanceValue: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  performanceValueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
});


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
import { getMockResults, mockQuestions } from '@/data/mock-data';

interface ResultsScreenProps {
  results: QuestionResult[];
  onQuestionPress: (result: QuestionResult) => void;
  onRestart?: () => void;
}

export function ResultsScreen({ results, onQuestionPress, onRestart }: ResultsScreenProps) {
  // Use mock results if no results are provided
  const displayResults = results.length === 0
    ? getMockResults(mockQuestions.map(q => q.id))
    : results;

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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Individual Question Results */}
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>
            Your Results
          </Text>

          {displayResults.map((result, index) => (
            <Pressable
              key={result.questionId}
              style={({ pressed }) => [
                styles.resultCard,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => onQuestionPress(result)}
            >
              <View style={styles.resultHeader}>
                <View style={styles.resultHeaderLeft}>
                  <Text style={styles.questionNumber}>Q{index + 1}</Text>
                  <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(result.grade) }]}>
                    <Text style={styles.gradeBadgeText}>{result.grade}</Text>
                  </View>
                </View>
                <Text style={[styles.scoreLabel, { color: getGradeColor(result.grade) }]}>
                  {result.score}%
                </Text>
              </View>

              <Text style={styles.questionText} numberOfLines={2}>
                {result.question}
              </Text>

              <View style={styles.feedbackPreview}>
                <Ionicons name="chatbubble-outline" size={16} color={Colors.textLight} />
                <Text style={styles.feedbackText} numberOfLines={1}>
                  Tap to view feedback
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Restart Button */}
        {onRestart && (
          <Pressable
            style={({ pressed }) => [
              styles.restartButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onRestart}
          >
            <Ionicons name="refresh" size={24} color={Colors.white} />
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
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  overallCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  overallScoreContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  gradeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gradeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  resultsContainer: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
    backgroundColor: Colors.cardBackground,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textLight,
  },
  feedbackPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    backgroundColor: Colors.buttonPrimary,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
});


import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { QuestionSwiper } from '@/components/question-swiper';
import { ResultsScreen } from '@/components/results-screen';
import { FeedbackDetail } from '@/components/feedback-detail';
import { mockQuestions, getMockResults } from '@/data/mock-data';
import { QuestionResponse, QuestionResult } from '@/types/question';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type AppState = 'welcome' | 'questions' | 'results' | 'feedback';

export default function HomeScreen() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<QuestionResult | null>(null);

  const handleStartSession = () => {
    setResults([]);
    setAppState('questions');
  };

  const handleQuestionsComplete = (completedResponses: QuestionResponse[]) => {
    // Simulate LLM evaluation with mock results
    const mockResults = getMockResults(completedResponses.map(r => r.questionId));
    setResults(mockResults);
    setAppState('results');
  };

  const handleQuestionPress = (result: QuestionResult) => {
    setSelectedResult(result);
    setAppState('feedback');
  };

  const handleCloseFeedback = () => {
    setSelectedResult(null);
    setAppState('results');
  };

  const handleRestart = () => {
    setAppState('welcome');
  };

  // Welcome Screen
  if (appState === 'welcome') {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Ionicons name="mic-circle" size={120} color={Colors.primary} />
          <Text style={styles.welcomeTitle}>
            Welcome to Recallo
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Answer questions by voice and get instant feedback
          </Text>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubbles" size={32} color={Colors.primary} />
              <Text style={styles.featureText}>
                {mockQuestions.length} Questions
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="mic" size={32} color={Colors.primary} />
              <Text style={styles.featureText}>Voice Answers</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={32} color={Colors.primary} />
              <Text style={styles.featureText}>Instant Grades</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleStartSession}
          >
            <Text style={styles.startButtonText}>Start Session</Text>
            <Ionicons name="arrow-forward" size={24} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    );
  }

  // Questions Screen
  if (appState === 'questions') {
    return (
      <QuestionSwiper
        questions={mockQuestions}
        onComplete={handleQuestionsComplete}
      />
    );
  }

  // Feedback Detail Screen
  if (appState === 'feedback' && selectedResult) {
    const questionIndex = results.findIndex(r => r.questionId === selectedResult.questionId);
    return (
      <FeedbackDetail
        result={selectedResult}
        questionNumber={questionIndex + 1}
        onClose={handleCloseFeedback}
      />
    );
  }

  // Results Screen
  return (
    <ResultsScreen
      results={results}
      onQuestionPress={handleQuestionPress}
      onRestart={handleRestart}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: Colors.textLight,
    textAlign: 'center',
    maxWidth: 300,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 30,
    marginVertical: 30,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: Colors.buttonPrimary,
    marginTop: 20,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.buttonText,
  },
});

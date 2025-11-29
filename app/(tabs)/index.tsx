import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { QuestionSwiper } from '@/components/question-swiper';
import { ResultsScreen } from '@/components/results-screen';
import { FeedbackDetail } from '@/components/feedback-detail';
import { DailyQuestionsWidget } from '@/components/daily-questions-widget';
import { mockQuestions, getMockResults } from '@/data/mock-data';
import { QuestionResponse, QuestionResult } from '@/types/question';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/use-auth';

type AppState = 'dashboard' | 'questions' | 'results' | 'feedback';

export default function HomeScreen() {
  const [appState, setAppState] = useState<AppState>('dashboard');
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<QuestionResult | null>(null);
  const { user } = useAuth();

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
    setAppState('dashboard');
  };

  // Dashboard Screen
  if (appState === 'dashboard') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.dashboardContainer}>
          <Text style={styles.welcomeBack}>
            Welcome back, {user?.name || 'Guest'}!
          </Text>

          <DailyQuestionsWidget onPress={handleStartSession} />
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  dashboardContainer: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeBack: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
});

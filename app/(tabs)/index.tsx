import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { QuestionSwiper } from '@/components/question-swiper';
import { ResultsScreen } from '@/app/screens/results';
import { FeedbackDetail } from '@/components/feedback-detail';
import { DailyQuestionsWidget } from '@/components/daily-questions-widget';
import { QuestionSettingsForm } from '@/components/question-settings-form';
import { QuestionResponse, QuestionResult, Question, DailyQuestion } from '@/types/question';
import { QuestionSettings } from '@/types/project';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { getPersonalizedGreeting } from '@/utils/greeting';
import { settingsStorage } from '@/services/settings-storage';
import { apiService } from '@/services/api';

type AppState = 'dashboard' | 'questions' | 'results' | 'feedback' | 'settings';

export default function HomeScreen() {
  const [appState, setAppState] = useState<AppState>('dashboard');
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<QuestionResult | null>(null);
  const [questionSettings, setQuestionSettings] = useState<QuestionSettings | null>(null);
  const [dailyQuestions, setDailyQuestions] = useState<DailyQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const { user } = useAuth();

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Poll for daily questions every 15 seconds
  useEffect(() => {
    if (!user) return;

    const fetchDailyQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const questions = await apiService.getDailyQuestions();
        setDailyQuestions(questions);
        console.log('[HomeScreen] Daily questions fetched:', questions.length);
      } catch (error) {
        console.error('[HomeScreen] Error fetching daily questions:', error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    // Fetch immediately on mount
    fetchDailyQuestions();

    // Then poll every 15 seconds
    const interval = setInterval(fetchDailyQuestions, 15000);

    return () => clearInterval(interval);
  }, [user]);

  const loadSettings = async () => {
    try {
      const savedSettings = await settingsStorage.getSettings();
      if (savedSettings) {
        setQuestionSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleStartSession = () => {
    if (dailyQuestions.length === 0) {
      console.warn('[HomeScreen] No daily questions available');
      return;
    }
    setResults([]);
    setAppState('questions');
  };

  const handleSaveSettings = (settings: QuestionSettings) => {
    setQuestionSettings(settings);
    setAppState('dashboard');
  };

  const handleCancelSettings = () => {
    setAppState('dashboard');
  };

  const handleQuestionsComplete = (_completedResponses: QuestionResponse[]) => {
    console.log('[HomeScreen] Questions complete, generating mock results for backend questions');
    console.log('[HomeScreen] Daily questions available:', dailyQuestions.length);

    // Mock grading data - cycle through these for each question
    const mockGradingData = [
      {
        grade: 'B' as const,
        score: 73,
        feedback: 'Good answer! You provided relevant points, but could have elaborated more on specific examples. Your reasoning was clear, though adding more depth would strengthen your response. Consider providing concrete scenarios to illustrate your points better.',
      },
      {
        grade: 'A' as const,
        score: 80,
        feedback: 'Excellent response! You demonstrated strong understanding and communicated your ideas effectively. Your answer was well-structured and showed clear thought process. The examples you provided were relevant and helped illustrate your main points perfectly.',
      },
      {
        grade: 'B' as const,
        score: 65,
        feedback: 'Solid answer with good foundational knowledge. You covered the main points adequately, but there\'s room for improvement in terms of detail and specificity. Try to provide more concrete examples and explain your reasoning more thoroughly next time.',
      },
    ];

    // Generate mock results from all backend daily questions
    const mockResults = dailyQuestions.map((dailyQuestion, index) => {
      const gradingData = mockGradingData[index % mockGradingData.length];

      console.log(`[HomeScreen] Creating result ${index + 1}:`, {
        questionId: dailyQuestion.id,
        question: dailyQuestion.question,
      });

      return {
        questionId: dailyQuestion.id,
        question: dailyQuestion.question,
        grade: gradingData.grade,
        score: gradingData.score,
        feedback: gradingData.feedback,
      };
    });

    console.log('[HomeScreen] Generated mock results:', mockResults.length);
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
            {getPersonalizedGreeting(user?.name)}!
          </Text>

          <DailyQuestionsWidget
            onPress={handleStartSession}
            questionCount={dailyQuestions.length}
            isLoading={isLoadingQuestions}
          />

        </View>
      </ScrollView>
    );
  }

  // Settings Screen
  if (appState === 'settings') {
    return (
      <QuestionSettingsForm
        onSave={handleSaveSettings}
        onCancel={handleCancelSettings}
        initialSettings={questionSettings}
      />
    );
  }

  // Questions Screen
  if (appState === 'questions') {
    // Convert DailyQuestion to Question format for the QuestionSwiper
    const questions: Question[] = dailyQuestions.map(dq => ({
      id: dq.id,
      text: dq.question,
    }));

    return (
      <QuestionSwiper
        questions={questions}
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
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
});

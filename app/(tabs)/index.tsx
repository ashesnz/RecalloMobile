import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { QuestionSwiper } from '@/components/question-swiper';
import { ResultsScreen } from '@/app/screens/results';
import { FeedbackDetail } from '@/components/feedback-detail';
import { DailyQuestionsWidget } from '@/components/daily-questions-widget';
import { QuestionSettingsWidget } from '@/components/question-settings-widget';
import { QuestionSettingsForm } from '@/components/question-settings-form';
import { mockQuestions, getMockResults } from '@/data/mock-data';
import { QuestionResponse, QuestionResult } from '@/types/question';
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
  const [projectName, setProjectName] = useState<string | undefined>(undefined);
  const { user } = useAuth();

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Load project name when settings change
  useEffect(() => {
    if (questionSettings?.projectId) {
      loadProjectName(questionSettings.projectId);
    }
  }, [questionSettings?.projectId]);

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

  const loadProjectName = async (projectId: string) => {
    try {
      const projects = await apiService.getProjects();
      const project = projects.find((p) => p.id === projectId);
      setProjectName(project?.name);
    } catch (error) {
      console.error('Error loading project name:', error);
    }
  };

  const handleStartSession = () => {
    setResults([]);
    setAppState('questions');
  };

  const handleOpenSettings = () => {
    setAppState('settings');
  };

  const handleSaveSettings = (settings: QuestionSettings) => {
    setQuestionSettings(settings);
    setAppState('dashboard');
  };

  const handleCancelSettings = () => {
    setAppState('dashboard');
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
            {getPersonalizedGreeting(user?.name)}!
          </Text>

          <DailyQuestionsWidget onPress={handleStartSession} />

          <QuestionSettingsWidget
            onPress={handleOpenSettings}
            projectName={projectName}
            scheduledTime={questionSettings?.scheduledTime || undefined}
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

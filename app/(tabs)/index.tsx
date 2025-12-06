import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { QuestionSwiper } from '@/components/question-swiper';
import { ResultsScreen } from '@/app/screens/results';
import { FeedbackDetail } from '@/components/feedback-detail';
import { DailyQuestionsWidget } from '@/components/daily-questions-widget';
import { QuestionSettingsForm } from '@/components/question-settings-form';
import { QuestionResponse, QuestionResult, Question, DailyQuestion } from '@/types/question';
import { QuestionSettings } from '@/types/project';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { getPersonalizedGreeting } from '@/utils/greeting';
import { settingsStorage } from '@/services/settings-storage';
import { apiService } from '@/services/api';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type AppState = 'dashboard' | 'questions' | 'results' | 'feedback' | 'settings';

export function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState<AppState>('dashboard');
  const [notifications, setNotifications] = useState<{ id: string; type: string; message?: string; timestamp?: string }[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
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

  // Subscribe to lightweight WS notifications (connected / daily_questions_ready) and keep history
  useEffect(() => {
    const unsub = apiService.subscribeNotifications((n) => {
      console.log('[HomeScreen] Received notification:', n);
      const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      setNotifications(prev => [{ id, type: n.type, message: n.message, timestamp: n.timestamp }, ...prev]);
    });

    return () => unsub();
  }, []);

  // Subscribe to connection status changes for indicator
  useEffect(() => {
    const unsub = apiService.subscribeConnectionStatus((connected) => {
      setIsConnected(connected);
    });
    return () => unsub();
  }, []);

  // Poll for daily questions every 15 seconds
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchDailyQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const questions = await apiService.getDailyQuestions();
        if (!isMounted) return;
        setDailyQuestions(questions);
        console.log('[HomeScreen] Daily questions fetched:', questions.length);
      } catch (error) {
        console.error('[HomeScreen] Error fetching daily questions:', error);
      } finally {
        if (isMounted) setIsLoadingQuestions(false);
      }
    };

    // Fetch immediately on mount
    fetchDailyQuestions();

    // Subscribe to real-time updates (WS) from apiService
    const listener = (questions: DailyQuestion[]) => {
      console.log('[HomeScreen] Received daily questions via WS:', questions.length);
      if (!isMounted) return;
      setDailyQuestions(questions);
    };

    const unsubscribe = apiService.subscribeDailyQuestions(listener);

    return () => {
      isMounted = false;
      unsubscribe();
    };
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

  const handleQuestionsComplete = (_completedResponses: QuestionResponse[], evaluations: Map<string, import('@/types/question').EvaluationResponse>) => {
    console.log('[HomeScreen] Questions complete, processing evaluations');
    console.log('[HomeScreen] Daily questions available:', dailyQuestions.length);
    console.log('[HomeScreen] Evaluations received:', evaluations.size);

    // Debug: Log all evaluation keys and values
    console.log('[HomeScreen] Evaluation Map contents:');
    evaluations.forEach((evaluation, key) => {
      console.log(`  - Question ID: ${key}`);
      console.log(`    Grade: ${evaluation.grade}`);
      console.log(`    Score: ${evaluation.score}`);
      console.log(`    Feedback: ${evaluation.feedback}`);
      console.log(`    Transcript: ${evaluation.transcript}`);
    });

    // Convert evaluations to results
    const results = dailyQuestions.map((dailyQuestion) => {
      console.log(`[HomeScreen] Processing question: ${dailyQuestion.id}`);
      const evaluation = evaluations.get(dailyQuestion.id);

      if (!evaluation) {
        // This shouldn't happen, but handle it just in case
        console.warn(`[HomeScreen] No evaluation found for question ${dailyQuestion.id}`);
        return {
          questionId: dailyQuestion.id,
          question: dailyQuestion.question,
          grade: 'F' as const,
          score: 0,
          feedback: 'N/A - Question not answered',
          userAnswer: '',
          correctAnswer: dailyQuestion.answer,
        };
      }

      // Check if this was a "Not Sure" answer
      const isNotSure = evaluation.feedback === 'N/A - Question skipped';

      const result = {
        questionId: dailyQuestion.id,
        question: dailyQuestion.question,
        grade: evaluation.grade,
        score: evaluation.score,
        feedback: evaluation.feedback,
        userAnswer: isNotSure ? '' : evaluation.transcript,
        correctAnswer: isNotSure ? undefined : evaluation.correctAnswer,
      };

      console.log(`[HomeScreen] Created result for ${dailyQuestion.id}:`, result);
      return result;
    });

    console.log('[HomeScreen] Generated results:', results.length);
    console.log('[HomeScreen] Full results array:', JSON.stringify(results, null, 2));
    setResults(results);
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? insets.top : 0 }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }] } style={{ flex: 1 }}>
          <View style={styles.dashboardContainer}>
           <View style={styles.headerRow}>
             <Text style={[styles.welcomeBack, { color: colors.text }]}>{getPersonalizedGreeting(user?.name)}!</Text>
             <View style={[styles.connectionPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
               <Text style={[styles.connectionText, { color: isConnected ? colors.success : colors.textSecondary }]}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
             </View>
           </View>

           <DailyQuestionsWidget
             onPress={handleStartSession}
             questionCount={dailyQuestions.length}
             isLoading={isLoadingQuestions}
           />

           {/* Persistent notifications history */}
           {notifications.length > 0 && (
             <View style={styles.notificationsList}>
               <View style={styles.notificationsHeader}>
                 <Text style={styles.notificationsTitle}>Notifications</Text>
                 <TouchableOpacity onPress={() => setNotifications([])}>
                   <Text style={[styles.dismissAll, { color: colors.primary }]}>Dismiss all</Text>
                 </TouchableOpacity>
               </View>
               {notifications.map(n => (
                 <View key={n.id} style={[styles.notificationItem, { backgroundColor: colors.card, borderColor: colors.border }] }>
                   <Text style={[styles.notificationTextSmall, { color: colors.text }]}>{n.type === 'daily_questions_ready' ? 'Daily questions ready' : n.message ?? n.type}</Text>
                   <View style={styles.notificationActions}>
                     <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>{n.timestamp ? new Date(n.timestamp).toLocaleString() : ''}</Text>
                     <TouchableOpacity onPress={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}>
                       <Text style={[styles.dismissText, { color: colors.primary }]}>Dismiss</Text>
                     </TouchableOpacity>
                   </View>
                 </View>
               ))}
             </View>
           )}

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Settings Screen
  if (appState === 'settings') {
    return (
      <QuestionSettingsForm
        projectName={questionSettings?.projectName ?? null}
        scheduledTime={questionSettings?.scheduledTime ?? null}
        onSettingsChange={(settings: any) => {
          // Treat this as save and return to dashboard
          try {
            if (settings && typeof settings === 'object') {
              const maybe: QuestionSettings = {
                projectId: settings.projectId ?? null,
                projectName: settings.projectName ?? null,
                scheduledTime: settings.scheduledTime ?? null,
              };
              handleSaveSettings(maybe);
            } else {
              handleCancelSettings();
            }
          } catch (err) {
            console.error('Error handling settings change:', err);
            handleCancelSettings();
          }
        }}
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  connectionPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  connected: {
    // kept for backward compatibility; overridden by inline styles
  },
  disconnected: {
    // kept for backward compatibility; overridden by inline styles
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notificationsList: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationsTitle: {
    fontWeight: '700',
  },
  dismissAll: {
    fontWeight: '600',
  },
  notificationItem: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  notificationTextSmall: {
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  dismissText: {
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
  },
  dashboardContainer: {
    flex: 1,
    // top padding is handled by SafeAreaView / insets
    paddingBottom: 20,
  },
  welcomeBack: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  notificationContainer: {
    backgroundColor: '#e8f4ff',
    borderColor: '#a7d3ff',
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
  },
  notificationText: {
    color: '#0b5394',
    fontSize: 14,
  },
});

// Keep default export for Expo Router and suppress unused-default-export lint warning
export default HomeScreen;

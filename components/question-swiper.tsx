import React, { useReducer, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SpeechBubble } from '@/components/speech-bubble';
import { MicButton } from '@/components/mic-button';
import { Question, QuestionResponse, EvaluationResponse } from '@/types/question';
import { Colors } from '@/constants/theme';
import { apiService } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuestionSwiperProps {
  questions: Question[];
  onComplete: (responses: QuestionResponse[], evaluations: Map<string, EvaluationResponse>) => void;
}

interface QuestionState {
  currentIndex: number;
  responses: QuestionResponse[];
  evaluations: Map<string, EvaluationResponse>;
  notSureQuestions: Set<string>;
  isRecording: boolean;
  isEvaluating: boolean;
  currentTranscript: string;
  canSwipe: boolean;
}

type QuestionAction =
  | { type: 'SET_CURRENT_INDEX'; index: number }
  | { type: 'SET_RECORDING'; isRecording: boolean }
  | { type: 'SET_EVALUATING'; isEvaluating: boolean }
  | { type: 'SET_TRANSCRIPT'; transcript: string }
  | { type: 'ADD_RESPONSE'; response: QuestionResponse }
  | { type: 'ADD_EVALUATION'; questionId: string; evaluation: EvaluationResponse }
  | { type: 'MARK_NOT_SURE'; questionId: string; evaluation: EvaluationResponse }
  | { type: 'UPDATE_CAN_SWIPE'; questions: Question[] };

function questionReducer(state: QuestionState, action: QuestionAction): QuestionState {
  switch (action.type) {
    case 'SET_CURRENT_INDEX':
      return {
        ...state,
        currentIndex: action.index,
        currentTranscript: '',
        canSwipe: action.index < state.evaluations.size ?
          state.evaluations.has(Array.from(state.evaluations.keys())[action.index]) :
          false,
      };

    case 'SET_RECORDING':
      return { ...state, isRecording: action.isRecording };

    case 'SET_EVALUATING':
      return { ...state, isEvaluating: action.isEvaluating };

    case 'SET_TRANSCRIPT':
      return { ...state, currentTranscript: action.transcript };

    case 'ADD_RESPONSE': {
      const filtered = state.responses.filter(r => r.questionId !== action.response.questionId);
      return {
        ...state,
        responses: [...filtered, action.response],
      };
    }

    case 'ADD_EVALUATION': {
      const newEvaluations = new Map(state.evaluations);
      newEvaluations.set(action.questionId, action.evaluation);
      return {
        ...state,
        evaluations: newEvaluations,
        canSwipe: true,
      };
    }

    case 'MARK_NOT_SURE': {
      const newEvaluations = new Map(state.evaluations);
      newEvaluations.set(action.questionId, action.evaluation);
      const newNotSureQuestions = new Set(state.notSureQuestions);
      newNotSureQuestions.add(action.questionId);
      const filtered = state.responses.filter(r => r.questionId !== action.questionId);
      return {
        ...state,
        evaluations: newEvaluations,
        notSureQuestions: newNotSureQuestions,
        responses: [...filtered, { questionId: action.questionId, transcript: 'Not Sure' }],
        canSwipe: true,
        currentTranscript: '',
      };
    }

    case 'UPDATE_CAN_SWIPE': {
      if (state.currentIndex >= action.questions.length) {
        return state;
      }
      const currentQuestion = action.questions[state.currentIndex];
      const hasEvaluation = state.evaluations.has(currentQuestion.id);
      const isNotSure = state.notSureQuestions.has(currentQuestion.id);
      return {
        ...state,
        canSwipe: hasEvaluation || isNotSure,
      };
    }

    default:
      return state;
  }
}

const initialState: QuestionState = {
  currentIndex: 0,
  responses: [],
  evaluations: new Map(),
  notSureQuestions: new Set(),
  isRecording: false,
  isEvaluating: false,
  currentTranscript: '',
  canSwipe: false,
};

export function QuestionSwiper({ questions, onComplete }: QuestionSwiperProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [state, dispatch] = useReducer(questionReducer, initialState);
  const flatListRef = useRef<FlatList>(null);
  const recordingStartTime = useRef<number>(0);
  const stateRef = useRef(state);

  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const dataWithEnd = [...questions, { id: '__completion__', text: '' } as Question];

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;

        if (newIndex >= questions.length) {
          const currentState = stateRef.current;
          console.log('[QuestionSwiper] Reached completion marker');
          console.log('[QuestionSwiper] Evaluations Map size:', currentState.evaluations.size);
          console.log('[QuestionSwiper] Evaluations Map keys:', Array.from(currentState.evaluations.keys()));
          currentState.evaluations.forEach((evaluation, key) => {
            console.log(`[QuestionSwiper] Evaluation for ${key}:`, evaluation);
          });
          onComplete(currentState.responses, currentState.evaluations);
          return;
        }

        dispatch({ type: 'SET_CURRENT_INDEX', index: newIndex });
      }
    },
    [questions, onComplete]
  );

  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const handleRecordingStart = () => {
    dispatch({ type: 'SET_RECORDING', isRecording: true });
    dispatch({ type: 'SET_TRANSCRIPT', transcript: '' });
    recordingStartTime.current = Date.now();
    console.log('Recording started for question:', questions[state.currentIndex].id);
  };

  const handleTranscriptUpdate = async (transcript: string) => {
    dispatch({ type: 'SET_TRANSCRIPT', transcript });

    if (transcript.trim()) {
      dispatch({ type: 'SET_EVALUATING', isEvaluating: true });
      try {
        const currentQuestion = questions[state.currentIndex];
        console.log('[QuestionSwiper] Evaluating answer for:', currentQuestion.id);
        console.log('[QuestionSwiper] Question text:', currentQuestion.text);
        console.log('[QuestionSwiper] Transcript:', transcript);

        const evaluation = await apiService.evaluateAnswer(
          currentQuestion.id,
          currentQuestion.text,
          transcript
        );

        console.log('[QuestionSwiper] Evaluation received from API:', evaluation);

        const fullEvaluation = {
          questionId: currentQuestion.id,
          transcript,
          ...evaluation,
        };

        console.log('[QuestionSwiper] Storing full evaluation:', fullEvaluation);

        dispatch({
          type: 'ADD_EVALUATION',
          questionId: currentQuestion.id,
          evaluation: fullEvaluation
        });

        console.log('[QuestionSwiper] Evaluation complete:', evaluation);
      } catch (error) {
        console.error('[QuestionSwiper] Evaluation error:', error);
      } finally {
        dispatch({ type: 'SET_EVALUATING', isEvaluating: false });
      }
    }
  };

  const handleRecordingEnd = () => {
    dispatch({ type: 'SET_RECORDING', isRecording: false });
    const duration = Date.now() - recordingStartTime.current;
    console.log('Recording ended. Duration:', duration, 'ms');

    if (state.currentTranscript.trim()) {
      const newResponse: QuestionResponse = {
        questionId: questions[state.currentIndex].id,
        transcript: state.currentTranscript,
      };

      dispatch({ type: 'ADD_RESPONSE', response: newResponse });
    }
  };

  const handleNotSure = () => {
    const currentQuestion = questions[state.currentIndex];
    console.log('[QuestionSwiper] User marked as Not Sure:', currentQuestion.id);

    const naEvaluation: EvaluationResponse = {
      questionId: currentQuestion.id,
      transcript: '',
      grade: 'F',
      score: 0,
      feedback: 'N/A - Question skipped',
    };

    console.log('[QuestionSwiper] Creating N/A evaluation:', naEvaluation);

    dispatch({
      type: 'MARK_NOT_SURE',
      questionId: currentQuestion.id,
      evaluation: naEvaluation
    });
  };

  const renderQuestion = ({ item, index }: { item: Question; index: number }) => {
    if (item.id === '__completion__') {
      return (
        <View style={styles.questionContainer}>
          <View style={styles.contentWrapper}>
            <Text style={[styles.completionText, { color: colors.text }]}>
              Processing your answers...
            </Text>
          </View>
        </View>
      );
    }

    const evaluation = state.evaluations.get(item.id);
    const isCurrentQuestion = index === state.currentIndex;

    return (
      <View style={styles.questionContainer}>
        <View style={styles.contentWrapper}>
          <SpeechBubble
            text={item.text}
            questionNumber={index + 1}
            totalQuestions={questions.length}
          />

          {/* Transcript display area */}
          {(() => {
            const saved = state.responses.find(r => r.questionId === item.id)?.transcript;
            const showLive = isCurrentQuestion && state.currentTranscript && state.currentTranscript.trim().length > 0;

            if (showLive) {
              return (
                <View style={[styles.transcriptContainer, {
                  backgroundColor: colors.card,
                  borderColor: colors.primary,
                }]}>
                  <Text style={[styles.transcriptLabel, { color: colors.primary }]}>
                    Your answer (live):
                  </Text>
                  <Text style={[styles.transcriptText, { color: colors.text }]}>
                    {state.currentTranscript}
                  </Text>
                </View>
              );
            }

            if (saved && saved.trim().length > 0) {
              return (
                <View style={[styles.transcriptContainer, {
                  backgroundColor: colors.card,
                  borderColor: colors.primary,
                }]}>
                  <Text style={[styles.transcriptLabel, { color: colors.primary }]}>
                    Your answer:
                  </Text>
                  <Text style={[styles.transcriptText, { color: colors.text }]}>
                    {saved}
                  </Text>
                </View>
              );
            }

            return null;
          })()}

          {/* Evaluation feedback display */}
          {isCurrentQuestion && state.isEvaluating && (
            <View style={[styles.evaluationContainer, { backgroundColor: colors.card }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.evaluatingText, { color: colors.textSecondary }]}>
                Evaluating your answer...
              </Text>
            </View>
          )}

          {evaluation && (
            <View style={[styles.feedbackContainer, {
              backgroundColor: colors.card,
              borderColor: getGradeColor(evaluation.grade),
            }]}>
              <View style={styles.feedbackHeader}>
                <Text style={[styles.gradeText, { color: getGradeColor(evaluation.grade) }]}>
                  {evaluation.feedback === 'N/A - Question skipped' ? 'N/A' : `Grade: ${evaluation.grade}`}
                </Text>
                {evaluation.feedback !== 'N/A - Question skipped' && (
                  <Text style={[styles.scoreText, { color: colors.textSecondary }]}>
                    {evaluation.score}%
                  </Text>
                )}
              </View>
              <Text style={[styles.feedbackText, { color: colors.text }]}>
                {evaluation.feedback}
              </Text>
              {evaluation.correctAnswer && evaluation.feedback !== 'N/A - Question skipped' && (
                <View style={[styles.correctAnswerContainer, { borderTopColor: colors.border }]}>
                  <Text style={[styles.correctAnswerLabel, { color: colors.textSecondary }]}>
                    Expected answer:
                  </Text>
                  <Text style={[styles.correctAnswerText, { color: colors.text }]}>
                    {evaluation.correctAnswer}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.micContainer}>
            <MicButton
              onRecordingStart={handleRecordingStart}
              onRecordingEnd={handleRecordingEnd}
              onTranscriptUpdate={handleTranscriptUpdate}
            />
          </View>

          {/* Not Sure Button */}
          {isCurrentQuestion && !evaluation && !state.isEvaluating && (
            <View style={styles.notSureContainer}>
              <TouchableOpacity
                style={[styles.notSureButton, {
                  backgroundColor: colors.card,
                  borderColor: colors.textSecondary,
                }]}
                onPress={handleNotSure}
                disabled={state.isRecording}
              >
                <Text style={[styles.notSureButtonText, {
                  color: colors.textSecondary,
                  opacity: state.isRecording ? 0.5 : 1,
                }]}>
                  Not Sure
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              {questions.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: idx === index ? colors.primary : colors.textSecondary,
                      opacity: idx === index ? 1 : 0.3,
                    },
                  ]}
                />
              ))}
            </View>
            {isCurrentQuestion && state.canSwipe && (
              <Text style={[styles.swipeHint, { color: colors.textSecondary }]}>
                {index < questions.length - 1 ? 'Swipe left for next question →' : 'Swipe left to finish →'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const getGradeColor = (grade: 'A' | 'B' | 'C' | 'D' | 'F') => {
    switch (grade) {
      case 'A': return '#22c55e'; // green
      case 'B': return '#3b82f6'; // blue
      case 'C': return '#eab308'; // yellow
      case 'D': return '#f97316'; // orange
      case 'F': return '#ef4444'; // red
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={dataWithEnd}
        renderItem={renderQuestion}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfigRef.current}
        scrollEnabled={!state.isRecording && state.canSwipe}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 10,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  progressContainer: {
    alignItems: 'center',
    gap: 20,
    marginTop: 20,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  swipeHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  transcriptContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
  },
  completionText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  evaluationContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  evaluatingText: {
    fontSize: 14,
  },
  feedbackContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gradeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  correctAnswerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  correctAnswerLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  correctAnswerText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  notSureContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  notSureButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notSureButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

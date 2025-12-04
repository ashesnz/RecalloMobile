import React, { useState, useRef } from 'react';
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

export function QuestionSwiper({ questions, onComplete }: QuestionSwiperProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [evaluations, setEvaluations] = useState<Map<string, EvaluationResponse>>(new Map());
  const [notSureQuestions, setNotSureQuestions] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [canSwipe, setCanSwipe] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const recordingStartTime = useRef<number>(0);

  const dataWithEnd = [...questions, { id: '__completion__', text: '' } as Question];

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;

        // Check if we've reached the completion marker
        if (newIndex >= questions.length) {
          onComplete(responses, evaluations);
          return;
        }

        setCurrentIndex(newIndex);

        // Clear transcript when moving to a new question
        setCurrentTranscript('');

        // Check if the new question has already been answered or marked as "Not Sure"
        const newQuestion = questions[newIndex];
        const hasEvaluation = evaluations.has(newQuestion.id);
        const isNotSure = notSureQuestions.has(newQuestion.id);
        setCanSwipe(hasEvaluation || isNotSure);
      }
    }
  ).current;

  const handleRecordingStart = () => {
    setIsRecording(true);
    setCurrentTranscript('');
    recordingStartTime.current = Date.now();
    console.log('Recording started for question:', questions[currentIndex].id);
  };

  const handleTranscriptUpdate = async (transcript: string) => {
    setCurrentTranscript(transcript);

    // Evaluate the answer immediately after transcription
    if (transcript.trim()) {
      setIsEvaluating(true);
      try {
        const currentQuestion = questions[currentIndex];
        console.log('[QuestionSwiper] Evaluating answer for:', currentQuestion.id);

        const evaluation = await apiService.evaluateAnswer(
          currentQuestion.id,
          currentQuestion.text,
          transcript
        );

        // Store the evaluation result
        setEvaluations(prev => new Map(prev).set(currentQuestion.id, {
          questionId: currentQuestion.id,
          transcript,
          ...evaluation,
        }));

        // Enable swiping after evaluation completes
        setCanSwipe(true);

        console.log('[QuestionSwiper] Evaluation complete:', evaluation);
      } catch (error) {
        console.error('[QuestionSwiper] Evaluation error:', error);
        // Still save the transcript even if evaluation fails
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const handleRecordingEnd = () => {
    setIsRecording(false);
    const duration = Date.now() - recordingStartTime.current;
    console.log('Recording ended. Duration:', duration, 'ms');

    // Save the response with the current transcript
    if (currentTranscript.trim()) {
      const newResponse: QuestionResponse = {
        questionId: questions[currentIndex].id,
        transcript: currentTranscript,
      };

      const updatedResponses = [
        ...responses.filter(r => r.questionId !== questions[currentIndex].id),
        newResponse,
      ];
      setResponses(updatedResponses);
    }

    // No auto-advance - user must swipe to next question
  };

  const handleNotSure = () => {
    const currentQuestion = questions[currentIndex];
    console.log('[QuestionSwiper] User marked as Not Sure:', currentQuestion.id);

    // Add to not sure set
    setNotSureQuestions(prev => new Set(prev).add(currentQuestion.id));

    // Create N/A evaluation
    const naEvaluation: EvaluationResponse = {
      questionId: currentQuestion.id,
      transcript: '',
      grade: 'F',
      score: 0,
      feedback: 'N/A - Question skipped',
      correctAnswer: currentQuestion.text, // Show the question as reference
    };

    setEvaluations(prev => new Map(prev).set(currentQuestion.id, naEvaluation));

    // Save response with N/A
    const naResponse: QuestionResponse = {
      questionId: currentQuestion.id,
      transcript: 'Not Sure',
    };

    const updatedResponses = [
      ...responses.filter(r => r.questionId !== currentQuestion.id),
      naResponse,
    ];
    setResponses(updatedResponses);

    // Enable swiping
    setCanSwipe(true);

    // Clear any current transcript
    setCurrentTranscript('');
  };

  const renderQuestion = ({ item, index }: { item: Question; index: number }) => {
    // Render completion screen for the final swipe
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

    const evaluation = evaluations.get(item.id);
    const isCurrentQuestion = index === currentIndex;

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
            const saved = responses.find(r => r.questionId === item.id)?.transcript;
            const showLive = isCurrentQuestion && currentTranscript && currentTranscript.trim().length > 0;

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
                    {currentTranscript}
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
          {isCurrentQuestion && isEvaluating && (
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
          {isCurrentQuestion && !evaluation && !isEvaluating && (
            <View style={styles.notSureContainer}>
              <TouchableOpacity
                style={[styles.notSureButton, {
                  backgroundColor: colors.card,
                  borderColor: colors.textSecondary,
                }]}
                onPress={handleNotSure}
                disabled={isRecording}
              >
                <Text style={[styles.notSureButtonText, {
                  color: colors.textSecondary,
                  opacity: isRecording ? 0.5 : 1,
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
            {isCurrentQuestion && canSwipe && (
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
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        scrollEnabled={!isRecording && canSwipe}
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

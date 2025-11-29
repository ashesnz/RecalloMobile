import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
} from 'react-native';
import { SpeechBubble } from '@/components/speech-bubble';
import { MicButton } from '@/components/mic-button';
import { Question, QuestionResponse } from '@/types/question';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuestionSwiperProps {
  questions: Question[];
  onComplete: (responses: QuestionResponse[]) => void;
}

export function QuestionSwiper({ questions, onComplete }: QuestionSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const recordingStartTime = useRef<number>(0);

  // Add a completion marker item at the end
  const dataWithEnd = [...questions, { id: '__completion__', text: '' } as Question];

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;

        // Check if we've reached the completion marker
        if (newIndex >= questions.length) {
          onComplete(responses);
          return;
        }

        setCurrentIndex(newIndex);

        // Clear transcript when moving to a new question
        setCurrentTranscript('');
      }
    }
  ).current;

  const handleRecordingStart = () => {
    setIsRecording(true);
    setCurrentTranscript('');
    recordingStartTime.current = Date.now();
    console.log('Recording started for question:', questions[currentIndex].id);
  };

  const handleTranscriptUpdate = (transcript: string) => {
    setCurrentTranscript(transcript);
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

  const renderQuestion = ({ item, index }: { item: Question; index: number }) => {
    // Render completion screen for the final swipe
    if (item.id === '__completion__') {
      return (
        <View style={styles.questionContainer}>
          <View style={styles.contentWrapper}>
            <Text style={styles.completionText}>Processing your answers...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.questionContainer}>
        <View style={styles.contentWrapper}>
          <SpeechBubble
            text={item.text}
            questionNumber={index + 1}
            totalQuestions={questions.length}
          />

          {/* Transcript display area */}
          {currentTranscript && index === currentIndex && (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>Your answer:</Text>
              <Text style={styles.transcriptText}>{currentTranscript}</Text>
            </View>
          )}

          <View style={styles.micContainer}>
            <MicButton
              onRecordingStart={handleRecordingStart}
              onRecordingEnd={handleRecordingEnd}
              onTranscriptUpdate={handleTranscriptUpdate}
            />
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              {questions.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: idx === index ? Colors.primary : Colors.textLight,
                      opacity: idx === index ? 1 : 0.3,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.swipeHint}>
              {index < questions.length - 1 ? 'Swipe left for next question →' : 'Swipe left to finish →'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
        scrollEnabled={!isRecording}
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
    backgroundColor: Colors.background,
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
    color: Colors.textLight,
    textAlign: 'center',
  },
  transcriptContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: Colors.black,
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
    color: Colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  transcriptText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  completionText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});


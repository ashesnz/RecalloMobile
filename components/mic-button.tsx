import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface MicButtonProps {
  onRecordingStart: () => void;
  onRecordingEnd: () => void;
  onTranscriptUpdate?: (transcript: string) => void;
}

export function MicButton({ onRecordingStart, onRecordingEnd, onTranscriptUpdate }: MicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const transcriptIntervalRef = React.useRef<any>(null);

  const handlePressIn = () => {
    setIsRecording(true);
    onRecordingStart();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.spring(scaleAnim, {
      toValue: 1.1,
      useNativeDriver: true,
      friction: 3,
    }).start();

    // Simulate streaming transcript updates
    if (onTranscriptUpdate) {
      const mockWords = ['Hello', 'this', 'is', 'my', 'answer', 'to', 'the', 'question'];
      let wordIndex = 0;
      let currentTranscript = '';

      transcriptIntervalRef.current = setInterval(() => {
        if (wordIndex < mockWords.length) {
          currentTranscript += (wordIndex > 0 ? ' ' : '') + mockWords[wordIndex];
          onTranscriptUpdate(currentTranscript);
          wordIndex++;
        }
      }, 500) as unknown as any;
    }
  };

  const handlePressOut = () => {
    setIsRecording(false);

    // Clear transcript interval
    if (transcriptIntervalRef.current) {
      clearInterval(transcriptIntervalRef.current);
      transcriptIntervalRef.current = null;
    }

    onRecordingEnd();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        {isRecording ? 'Recording... Release to stop' : 'Hold to record your answer'}
      </Text>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.micButton,
            {
              backgroundColor: isRecording ? Colors.recording : Colors.primary,
            },
          ]}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic'}
            size={48}
            color={Colors.white}
          />
        </Pressable>
      </Animated.View>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.textLight,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.recording,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.recording,
  },
});


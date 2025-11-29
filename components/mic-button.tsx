import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { MicIcon } from '@/components/ui/icon';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors as ThemeColors, Spacing, BorderRadius, Typography, Shadow, IconSize } from '@/constants/theme';
import { Colors as ColorPalette } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

interface MicButtonProps {
  onRecordingStart: () => void;
  onRecordingEnd: () => void;
  onTranscriptUpdate?: (transcript: string) => void;
}

export function MicButton({ onRecordingStart, onRecordingEnd, onTranscriptUpdate }: MicButtonProps) {
  const colorScheme = useColorScheme();
  const colors = ThemeColors[colorScheme ?? 'light'];
  const gradeColors = colorScheme === 'dark' ? ColorPalette.dark : ColorPalette.light;
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
      <Text style={[styles.instruction, { color: colors.textSecondary }]}>
        {isRecording ? 'Recording... Release to stop' : 'Hold to record your answer'}
      </Text>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.micButton,
            {
              backgroundColor: isRecording ? gradeColors.recording : colors.primary,
            },
          ]}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic'}
            size={IconSize['2xl']}
            color="#ffffff"
          />
        </Pressable>
      </Animated.View>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={[styles.recordingDot, { backgroundColor: gradeColors.recording }]} />
          <Text style={[styles.recordingText, { color: gradeColors.recording }]}>Recording</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  instruction: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.large,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  recordingText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});


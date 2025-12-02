import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors as ThemeColors, Spacing, BorderRadius, Typography, Shadow, IconSize } from '@/constants/theme';
import { Colors as ColorPalette } from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { whisperService } from '@/services/whisper-service';

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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    // Request audio permissions on mount
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to record audio.');
      }
    })();

    return () => {
      // Cleanup: stop recording if component unmounts
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, []);

  const handlePressIn = async () => {
    try {
      console.log('[MicButton] Starting recording...');

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      onRecordingStart();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
        friction: 3,
      }).start();

      console.log('[MicButton] Recording started');
    } catch (error) {
      console.error('[MicButton] Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  };

  const handlePressOut = async () => {
    try {
      if (!recording) return;

      console.log('[MicButton] Stopping recording...');
      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }).start();

      console.log('[MicButton] Recording stopped, URI:', uri);

      // Transcribe the audio using Whisper
      if (uri && onTranscriptUpdate) {
        setIsTranscribing(true);
        try {
          console.log('[MicButton] Starting transcription...');
          const transcript = await whisperService.transcribeAudio(uri);
          onTranscriptUpdate(transcript);
          console.log('[MicButton] Transcription complete');
        } catch (error) {
          console.error('[MicButton] Transcription error:', error);
          Alert.alert(
            'Transcription Error',
            error instanceof Error ? error.message : 'Failed to transcribe audio. Please try again.'
          );
        } finally {
          setIsTranscribing(false);
        }
      }

      onRecordingEnd();
    } catch (error) {
      console.error('[MicButton] Failed to stop recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording. Please try again.');
    }
  };

  const isProcessing = isRecording || isTranscribing;
  const statusText = isTranscribing
    ? 'Transcribing...'
    : isRecording
      ? 'Recording... Release to stop'
      : 'Hold to record your answer';

  return (
    <View style={styles.container}>
      <Text style={[styles.instruction, { color: colors.textSecondary }]}>
        {statusText}
      </Text>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isTranscribing}
          style={[
            styles.micButton,
            {
              backgroundColor: isProcessing ? gradeColors.recording : colors.primary,
              opacity: isTranscribing ? 0.6 : 1,
            },
          ]}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : isTranscribing ? 'hourglass' : 'mic'}
            size={IconSize['2xl']}
            color="#ffffff"
          />
        </Pressable>
      </Animated.View>

      {isProcessing && (
        <View style={styles.recordingIndicator}>
          <View style={[styles.recordingDot, { backgroundColor: gradeColors.recording }]} />
          <Text style={[styles.recordingText, { color: gradeColors.recording }]}>
            {isTranscribing ? 'Transcribing' : 'Recording'}
          </Text>
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


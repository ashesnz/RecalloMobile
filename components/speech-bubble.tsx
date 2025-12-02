import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors as ThemeColors } from '@/constants/theme';

interface SpeechBubbleProps {
  text: string;
  questionNumber: number;
  totalQuestions: number;
  autoPlay?: boolean;
}

export function SpeechBubble({ text, questionNumber, totalQuestions, autoPlay = true }: SpeechBubbleProps) {
  const colorScheme = useColorScheme();
  const colors = ThemeColors[colorScheme ?? 'light'];
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Auto-play the question when it appears
    if (autoPlay && text) {
      speakQuestion();
    }

    // Cleanup: stop speaking when component unmounts
    return () => {
      Speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoPlay]);

  const speakQuestion = async () => {
    try {
      // Stop any ongoing speech
      await Speech.stop();

      setIsSpeaking(true);

      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: (error) => {
          console.error('[SpeechBubble] Speech error:', error);
          setIsSpeaking(false);
        },
      });
    } catch (error) {
      console.error('[SpeechBubble] Failed to speak:', error);
      setIsSpeaking(false);
    }
  };

  const handleSpeakerPress = async () => {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
    } else {
      speakQuestion();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>
          Question {questionNumber} of {totalQuestions}
        </Text>
      </View>
      <View style={[styles.bubble, { backgroundColor: colors.primary }]}>
        <Pressable
          style={styles.speakerButton}
          onPress={handleSpeakerPress}
        >
          <Ionicons
            name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
            size={24}
            color="#ffffff"
          />
        </Pressable>
        <Text style={styles.text}>{text}</Text>
        <View style={[styles.tail, { borderTopColor: colors.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    marginBottom: 10,
  },
  questionCounter: {
    fontSize: 14,
    textAlign: 'center',
  },
  bubble: {
    borderRadius: 20,
    padding: 20,
    maxWidth: '90%',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  speakerButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    color: '#ffffff',
  },
  tail: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});


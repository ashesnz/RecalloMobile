import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors as ThemeColors } from '@/constants/theme';

interface SpeechBubbleProps {
  text: string;
  questionNumber: number;
  totalQuestions: number;
}

export function SpeechBubble({ text, questionNumber, totalQuestions }: SpeechBubbleProps) {
  const colorScheme = useColorScheme();
  const colors = ThemeColors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>
          Question {questionNumber} of {totalQuestions}
        </Text>
      </View>

      <View style={[styles.bubble, { backgroundColor: colors.primary }]}>
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

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface SpeechBubbleProps {
  text: string;
  questionNumber: number;
  totalQuestions: number;
}

export function SpeechBubble({ text, questionNumber, totalQuestions }: SpeechBubbleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.questionCounter}>
          Question {questionNumber} of {totalQuestions}
        </Text>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
        <View style={styles.tail} />
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
    color: Colors.textLight,
    textAlign: 'center',
  },
  bubble: {
    borderRadius: 20,
    padding: 20,
    maxWidth: '90%',
    position: 'relative',
    backgroundColor: Colors.primary,
    shadowColor: Colors.black,
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
    color: Colors.white,
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
    borderTopColor: Colors.primary,
  },
});


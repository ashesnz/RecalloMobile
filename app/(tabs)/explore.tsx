import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  const features = [
    {
      icon: 'mic-circle' as const,
      title: 'Voice Recording',
      description: 'Hold the mic button to record your answers naturally',
    },
    {
      icon: 'swap-horizontal' as const,
      title: 'Swipe Navigation',
      description: 'Easily navigate between questions with smooth swipes',
    },
    {
      icon: 'ribbon' as const,
      title: 'Instant Grading',
      description: 'Get immediate feedback and grades on your responses',
    },
    {
      icon: 'chatbubbles' as const,
      title: 'Detailed Feedback',
      description: 'Tap any result to view comprehensive feedback',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="information-circle" size={60} color={Colors.primary} />
          <Text style={styles.title}>About Recallo</Text>
          <Text style={styles.subtitle}>
            Voice-based learning and assessment
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          {features.map((feature, index) => (
            <View
              key={index}
              style={styles.featureCard}
            >
              <View style={styles.featureHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name={feature.icon} size={24} color={Colors.white} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
              </View>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepCard}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Start a new session from the Recallo tab
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Read each question in the speech bubble
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Hold the mic button and speak your answer
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Swipe left to move to the next question
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>5</Text>
              </View>
              <Text style={styles.stepText}>
                Review your results and tap for detailed feedback
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with React Native + Expo
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    gap: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
    backgroundColor: Colors.cardBackground,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginLeft: 52,
  },
  stepCard: {
    padding: 20,
    borderRadius: 12,
    gap: 16,
    backgroundColor: Colors.cardBackground,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});


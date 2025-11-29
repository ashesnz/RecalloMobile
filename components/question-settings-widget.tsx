import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/colors';

interface QuestionSettingsWidgetProps {
  onPress: () => void;
  projectName?: string;
  scheduledTime?: string;
}

export function QuestionSettingsWidget({
  onPress,
  projectName,
  scheduledTime
}: QuestionSettingsWidgetProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Question Settings</Text>
      <Text style={styles.subtitle}>
        Configure how your daily questions are generated
      </Text>

      <View style={styles.settingsDisplay}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Project:</Text>
          <Text style={styles.settingValue}>
            {projectName || 'Not configured'}
          </Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Time:</Text>
          <Text style={styles.settingValue}>
            {scheduledTime ? formatTime(scheduledTime) : 'Not configured'}
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]}
        onPress={onPress}
      >
        <Text style={styles.buttonText}>
          {projectName ? 'Edit Settings' : 'Configure Settings'}
        </Text>
      </Pressable>
    </View>
  );
}

function formatTime(isoTime: string): string {
  try {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return isoTime;
  }
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  settingsDisplay: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});


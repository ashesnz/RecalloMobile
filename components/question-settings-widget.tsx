import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SettingsIcon, FolderIcon, TimeIcon } from '@/components/ui/icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors as ThemeColors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';

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
  const colorScheme = useColorScheme();
  const colors = ThemeColors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <SettingsIcon size="md" variant="primary" />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>Question Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Configure how your daily questions are generated
          </Text>
        </View>
      </View>

      <View style={[styles.settingsDisplay, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <FolderIcon size="sm" variant="textSecondary" />
            <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>Project</Text>
          </View>
          <Text style={[styles.settingValue, { color: colors.text }]}>
            {projectName || 'Not configured'}
          </Text>
        </View>

        <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <TimeIcon size="sm" variant="textSecondary" />
            <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>Time</Text>
          </View>
          <Text style={[styles.settingValue, { color: colors.text }]}>
            {scheduledTime ? formatTime(scheduledTime) : 'Not configured'}
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.primary || '#8b5cf6',  // Fallback to purple if undefined
          },
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
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  settingsDisplay: {
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  settingValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    maxWidth: '50%',
    textAlign: 'right',
  },
  settingDivider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  button: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.small,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});


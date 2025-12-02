import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SettingsIcon, LockIcon } from '@/components/ui/icon';
import { Colors as ThemeColors, Spacing, BorderRadius, Typography, Shadow, IconSize } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { apiService } from '@/services/api';
import { getProfileFulfilled } from '@/stores/auth/authSlice';
import { QuestionSettingsForm } from './question-settings-form';

interface SettingsWidgetProps {
  projectName?: string | undefined;
  scheduledTime?: string | undefined;
  onSettingsChange?: (settings: any) => void;
}

export function SettingsWidget({ projectName, scheduledTime, onSettingsChange }: SettingsWidgetProps) {
  const colors: any = ThemeColors.light;
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s: any) => s.auth?.user ?? null);

  const [openAiKeySet, setOpenAiKeySet] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (currentUser) {
          setOpenAiKeySet(!!currentUser.openAiKey);
          return;
        }
        const profile = await apiService.getUserProfile();
        if (profile) {
          dispatch(getProfileFulfilled({ user: profile }));
          setOpenAiKeySet(!!profile.openAiKey);
        } else {
          setOpenAiKeySet(false);
        }
      } catch (err) {
        console.error('Failed to determine OpenAI key status', err);
        setOpenAiKeySet(false);
      }
    })();
  }, [currentUser, dispatch]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card || colors.background }]}>
      <View style={styles.header}>
        <SettingsIcon size="md" color={colors.primary} />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Configure how your daily questions are generated</Text>
        </View>
      </View>

      <QuestionSettingsForm projectName={projectName ?? null} scheduledTime={scheduledTime ?? null} onSettingsChange={onSettingsChange} />
        <Text style={[styles.subtitle, styles.indentedSubtitle, { color: colors.textSecondary }]}>AI settings</Text>

      <View style={[styles.section, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <LockIcon size="sm" color={colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>Open AI Key</Text>
          </View>
          {openAiKeySet === null ? (
            <ActivityIndicator size="small" />
          ) : openAiKeySet ? (
            <Text style={[styles.settingValue, { color: colors.text }]} numberOfLines={1}>API Key Set</Text>
          ) : (
            <Text style={[styles.settingValue, { color: colors.textSecondary }]} numberOfLines={1}>Not configured</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.base,
    ...Shadow.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerText: { flex: 1 },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  indentedSubtitle: {
    // Align subtitle with the header text (icon width + gap)
    marginLeft: IconSize.md + Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  section: {
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
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
    minWidth: 0,
    textAlign: 'right',
  },
});

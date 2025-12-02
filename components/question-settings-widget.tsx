import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SettingsIcon, FolderIcon, TimeIcon } from '@/components/ui/icon';
import { Colors as ThemeColors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { apiService } from '@/services/api';
import type { UpdateUserDto } from '@/types/auth';
import { settingsStorage } from '@/services/settings-storage';
import { ProjectList, ProjectItem } from './project-list';
import { useAppDispatch } from '@/stores/hooks';
import { getProfileFulfilled } from '@/stores/auth/authSlice';

interface QuestionSettingsWidgetProps {
  projectName?: string;
  scheduledTime?: string;
  onSettingsChange?: (settings: any) => void;
}

export function QuestionSettingsWidget({
  projectName,
  scheduledTime,
  onSettingsChange,
}: QuestionSettingsWidgetProps) {
  // Use the app light theme tokens so the widget matches the Explore/Profile page styling
  const colors: any = ThemeColors.light;
  const dispatch = useAppDispatch();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // load currently saved settings to pre-select project
    (async () => {
      try {
        const saved = await settingsStorage.getSettings();
        if (saved?.projectId) setSelectedProjectId(saved.projectId);
        if (saved?.scheduledTime) setTempTime(new Date(saved.scheduledTime));
      } catch (e) {
        console.error('Error loading saved settings', e);
      }
    })();
  }, []);

  const openModal = async () => {
    setModalVisible(true);
    setLoadingProjects(true);
    try {
      const list = await apiService.getProjects();
      setProjects(list || []);
    } catch (e) {
      console.error('Failed to load projects', e);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleOk = async () => {
    // Save selected project to settings storage, preserving scheduledTime if present
    try {
      const existing = await settingsStorage.getSettings();
      const selectedProject = projects.find((p) => p.id === selectedProjectId);
      const newSettings = {
        projectId: selectedProjectId || null,
        projectName: selectedProject?.name || existing?.projectName || null,
        scheduledTime: existing?.scheduledTime || scheduledTime || null,
      };
      await settingsStorage.saveSettings(newSettings);

      if (selectedProjectId) {
        const dto: UpdateUserDto = { preferredProjectId: selectedProjectId };
        try {
          const updatedUser = await apiService.updateUser(dto);
          console.log('[QuestionSettings] Preferred project updated on server');
          dispatch(getProfileFulfilled({ user: updatedUser }));
        } catch (apiErr) {
          console.error('Failed to update preferred project on server', apiErr);
        }
      }

      setModalVisible(false);
      if (onSettingsChange) onSettingsChange(newSettings);
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const openTimePicker = () => {
    // initialize tempTime with existing scheduledTime or now
    setTempTime(tempTime ?? (scheduledTime ? new Date(scheduledTime) : new Date()));
    setShowTimePicker(true);
  };

  const onTimeChange = async (event: any, date?: Date) => {
    // The native picker returns different events across platforms.
    // On Android, event.type === 'dismissed' when the user cancels.
    // On iOS the picker may call onChange repeatedly; we only act when a date is provided.
    try {
      if (Platform.OS === 'android') {
        // dialog-based picker: hide the picker immediately
        setShowTimePicker(false);
        if (!date) {
          // user dismissed the dialog
          return;
        }
      } else {
        // iOS: close the inline spinner after selection
        if (!date) return;
        setShowTimePicker(false);
      }

      // Persist the selected time
      setTempTime(date);
      const existing = await settingsStorage.getSettings();
      const newSettings = {
        projectId: existing?.projectId || selectedProjectId || null,
        projectName: existing?.projectName || null,
        scheduledTime: date.toISOString(),
      };
      await settingsStorage.saveSettings(newSettings);
      if (onSettingsChange) onSettingsChange(newSettings);
    } catch (err) {
      console.error('Failed to save scheduled time', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card || colors.background }]}>
      <View style={styles.header}>
        <SettingsIcon size="md" color={colors.primary} />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>Question Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Configure how your daily questions are generated
          </Text>
        </View>
      </View>

      <View style={[styles.settingsDisplay, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <Pressable onPress={openModal} style={styles.settingRow} android_ripple={{ color: colors.border }}>
          <View style={styles.settingLabelContainer}>
            <FolderIcon size="sm" color={colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>Project</Text>
          </View>
          <Text style={[styles.settingValue, { color: colors.text }]}>
            {projectName || 'Not configured'}
          </Text>
        </Pressable>

        <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

        <Pressable onPress={openTimePicker} style={styles.settingRow} android_ripple={{ color: colors.border }}>
          <View style={styles.settingLabelContainer}>
            <TimeIcon size="sm" color={colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>Time</Text>
          </View>
          <Text style={[styles.settingValue, { color: colors.text }]}>
            {tempTime ? formatTime(tempTime.toISOString()) : scheduledTime ? formatTime(scheduledTime) : 'Not configured'}
          </Text>
        </Pressable>
      </View>

      {/* Modal for project selection */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ width: '92%', borderRadius: BorderRadius.lg, padding: Spacing.base, backgroundColor: colors.card }}>
            <Text style={{ fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: colors.text }}>Select Project</Text>
            {loadingProjects ? (
              <ActivityIndicator style={{ marginTop: 16 }} />
            ) : (
              <ProjectList projects={projects} currentProjectId={selectedProjectId} onSelect={(id) => setSelectedProjectId(id)} />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md, marginTop: Spacing.md }}>
              <Pressable onPress={handleCancel} style={{ paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md, backgroundColor: colors.card }}>
                <Text style={{ color: colors.textSecondary }}>{'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={handleOk} disabled={!selectedProjectId} style={{ paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md, backgroundColor: selectedProjectId ? colors.primary : colors.card }}>
                <Text style={{ color: selectedProjectId ? '#fff' : colors.textSecondary }}>{'OK'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {showTimePicker && (
        <DateTimePicker
          value={tempTime ?? new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    </View>
  );
}

function formatTime(isoTime: string): string {
  try {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoTime;
  }
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
});

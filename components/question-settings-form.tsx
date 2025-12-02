import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FolderIcon, TimeIcon } from '@/components/ui/icon';
import { Colors as ThemeColors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { apiService } from '@/services/api';
import { settingsStorage } from '@/services/settings-storage';
import { ProjectList } from './project-list';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { getProfileFulfilled } from '@/stores/auth/authSlice';
import type { UpdateUserDto, User } from '@/types/auth';

interface QuestionSettingsFormProps {
  projectName?: string | null;
  scheduledTime?: string | null;
  onSettingsChange?: (settings: any) => void;
}

export function QuestionSettingsForm({ projectName: initialProjectName, scheduledTime: initialScheduledTime, onSettingsChange }: QuestionSettingsFormProps) {
  const colors: any = ThemeColors.light;
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s: any) => s.auth?.user ?? null) as User | null;

  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(initialProjectName ?? null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date | null>(initialScheduledTime ? new Date(initialScheduledTime) : null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await settingsStorage.getSettings();
        if (saved?.projectId) {
          setSelectedProjectId(saved.projectId);
          if (saved.projectName) setProjectName(saved.projectName);
        } else if (currentUser?.preferredProjectId) {
          const serverProjectId = currentUser.preferredProjectId;
          setSelectedProjectId(serverProjectId ?? null);

          try {
            setLoadingProjects(true);
            const list = await apiService.getProjects();
            setProjects(list || []);
            const match = (list || []).find((p: any) => p.id === serverProjectId);
            const resolvedName = match?.name ?? null;
            setProjectName(resolvedName);
            const newSettings = {
              projectId: serverProjectId || null,
              projectName: resolvedName,
              scheduledTime: saved?.scheduledTime || initialScheduledTime || null,
            };
            await settingsStorage.saveSettings(newSettings);
            if (onSettingsChange) onSettingsChange(newSettings);
          } catch (err) {
            console.error('Failed to fetch projects to resolve server preferred project', err);
          } finally {
            setLoadingProjects(false);
          }
        } else {
          // no saved settings and no server preferred project: use provided initial props
          if (initialProjectName && !saved?.projectId) setProjectName(initialProjectName);
          if (initialScheduledTime && !saved?.scheduledTime) setTempTime(new Date(initialScheduledTime));
        }
        if (saved?.scheduledTime) setTempTime(new Date(saved.scheduledTime));
      } catch (e) {
        console.error('Error loading saved settings', e);
      }
    })();
  }, [currentUser, onSettingsChange, initialProjectName, initialScheduledTime]);

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

  const handleCancel = () => setModalVisible(false);

  const handleOk = async () => {
    try {
      const existing = await settingsStorage.getSettings();
      const selectedProject = projects.find((p: any) => p.id === selectedProjectId);
      const newSettings = {
        projectId: selectedProjectId || null,
        projectName: selectedProject?.name || existing?.projectName || projectName || null,
        scheduledTime: existing?.scheduledTime || null,
      };
      await settingsStorage.saveSettings(newSettings);
      setProjectName(newSettings.projectName || null);

      if (selectedProjectId) {
        const dto: UpdateUserDto = { preferredProjectId: selectedProjectId };
        try {
          const updatedUser = await apiService.updateUser(dto);
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
    setTempTime(tempTime ?? new Date());
    setShowTimePicker(true);
  };

  const onTimeChange = async (event: any, date?: Date) => {
    try {
      if (Platform.OS === 'android') {
        setShowTimePicker(false);
        if (!date) return;
      } else {
        if (!date) return;
        setShowTimePicker(false);
      }

      setTempTime(date || null);
      const existing = await settingsStorage.getSettings();
      const newSettings = {
        projectId: existing?.projectId || selectedProjectId || null,
        projectName: existing?.projectName || projectName || null,
        scheduledTime: date?.toISOString() || null,
      };
      await settingsStorage.saveSettings(newSettings);
      if (onSettingsChange) onSettingsChange(newSettings);
    } catch (err) {
      console.error('Failed to save scheduled time', err);
    }
  };

  return (
    <View style={[styles.section, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
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
          {tempTime ? formatTime(tempTime.toISOString()) : 'Not configured'}
        </Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ width: '92%', borderRadius: BorderRadius.lg, padding: Spacing.base, backgroundColor: colors.card }}>
            <Text style={{ fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: colors.text }}>Select Project</Text>
            {loadingProjects ? (
              <ActivityIndicator style={{ marginTop: 16 }} />
            ) : (
              <ProjectList projects={projects} currentProjectId={selectedProjectId} onSelect={(id: string) => setSelectedProjectId(id)} />
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
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return isoTime;
  }
}

const styles = StyleSheet.create({
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
    textAlign: 'right',
  },
  settingDivider: { height: 1, marginVertical: Spacing.xs },
});

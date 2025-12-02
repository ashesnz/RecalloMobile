import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SettingsIcon, FolderIcon, TimeIcon, CheckIcon } from '@/components/ui/icon';
import { Colors as ThemeColors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { apiService } from '@/services/api';
import { settingsStorage } from '@/services/settings-storage';

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

  const [modalVisible, setModalVisible] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    // load currently saved settings to pre-select project
    (async () => {
      try {
        const saved = await settingsStorage.getSettings();
        if (saved?.projectId) setSelectedProjectId(saved.projectId);
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
      const newSettings = {
        projectId: selectedProjectId || null,
        scheduledTime: existing?.scheduledTime || scheduledTime || null,
      };
      await settingsStorage.saveSettings(newSettings);
      setModalVisible(false);
      if (onSettingsChange) onSettingsChange(newSettings);
    } catch (e) {
      console.error('Failed to save settings', e);
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

        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <TimeIcon size="sm" color={colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>Time</Text>
          </View>
          <Text style={[styles.settingValue, { color: colors.text }]}>
            {scheduledTime ? formatTime(scheduledTime) : 'Not configured'}
          </Text>
        </View>
      </View>

      {/* Modal for project selection */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[modalStyles.modalTitle, { color: colors.text }]}>Select Project</Text>

            {loadingProjects ? (
              <ActivityIndicator style={{ marginTop: 16 }} />
            ) : (
              <FlatList
                data={projects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const selected = selectedProjectId === item.id;
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedProjectId(item.id)}
                      style={[
                        modalStyles.projectRow,
                        selected && { backgroundColor: colors.primaryLight || '#eef2ff', borderRadius: 8 },
                      ]}
                    >
                      <Text style={[modalStyles.projectName, { color: colors.text }]}>{item.name}</Text>
                      {selected && <CheckIcon size="md" color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
                style={{ marginTop: 12, maxHeight: 320 }}
              />
            )}

            <View style={modalStyles.modalFooter}>
              <Pressable
                style={({ pressed }) => [
                  modalStyles.modalButton,
                  { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={handleCancel}
              >
                <Text style={[modalStyles.modalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleOk}
                disabled={!selectedProjectId}
                style={({ pressed }) => [
                  modalStyles.modalButton,
                  { backgroundColor: selectedProjectId ? colors.primary : colors.card, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={[modalStyles.modalButtonText, { color: selectedProjectId ? '#fff' : colors.textSecondary }]}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '92%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  projectRow: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectName: {
    fontSize: Typography.fontSize.base,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  modalButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

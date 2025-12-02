import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/theme';
import { Project, QuestionSettings } from '@/types/project';
import { apiService } from '@/services/api';
import { settingsStorage } from '@/services/settings-storage';

interface QuestionSettingsFormProps {
  onSave: (settings: QuestionSettings) => void;
  onCancel: () => void;
  initialSettings?: QuestionSettings | null;
}

export function QuestionSettingsForm({
  onSave,
  onCancel,
  initialSettings,
}: QuestionSettingsFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialSettings?.projectId || null
  );
  const [selectedTime, setSelectedTime] = useState<Date>(() => {
    if (initialSettings?.scheduledTime) {
      return new Date(initialSettings.scheduledTime);
    }
    // Default to 9:00 AM
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    return now;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const fetchedProjects = await apiService.getProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert('Error', 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProjectId) {
      Alert.alert('Validation Error', 'Please select a project');
      return;
    }

    try {
      setSaving(true);
      const settings: QuestionSettings = {
        projectId: selectedProjectId,
        scheduledTime: selectedTime.toISOString(),
      };

      await settingsStorage.saveSettings(settings);
      onSave(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (date) {
      setSelectedTime(date);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Question Settings</Text>
        <Text style={styles.headerSubtitle}>
          Choose a project and time for your daily questions
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Project</Text>
          <Text style={styles.sectionDescription}>
            Questions will be generated from this project
          </Text>

          {projects.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No projects available. Create a project first.
              </Text>
            </View>
          ) : (
            <View style={styles.projectList}>
              {projects.map((project) => (
                <Pressable
                  key={project.id}
                  style={({ pressed }) => [
                    styles.projectItem,
                    selectedProjectId === project.id && styles.projectItemSelected,
                    pressed && styles.projectItemPressed,
                  ]}
                  onPress={() => setSelectedProjectId(project.id)}
                >
                  <View style={styles.projectItemContent}>
                    <View
                      style={[
                        styles.radioCircle,
                        selectedProjectId === project.id && styles.radioCircleSelected,
                      ]}
                    >
                      {selectedProjectId === project.id && (
                        <View style={styles.radioCircleInner} />
                      )}
                    </View>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      {project.description && (
                        <Text style={styles.projectDescription}>
                          {project.description}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Time</Text>
          <Text style={styles.sectionDescription}>
            When should questions be generated daily?
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.timeButton,
              pressed && styles.timeButtonPressed,
            ]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeButtonLabel}>Time:</Text>
            <Text style={styles.timeButtonValue}>
              {selectedTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </Pressable>

          {(showTimePicker || Platform.OS === 'ios') && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              style={styles.timePicker}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.cancelButtonPressed,
          ]}
          onPress={onCancel}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
            saving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyState: {
    padding: 24,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  projectList: {
    gap: 12,
  },
  projectItem: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  projectItemSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight || Colors.light.card,
  },
  projectItemPressed: {
    opacity: 0.7,
  },
  projectItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.light.primary,
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
  },
  timeButtonPressed: {
    opacity: 0.7,
  },
  timeButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  timeButtonValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  timePicker: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

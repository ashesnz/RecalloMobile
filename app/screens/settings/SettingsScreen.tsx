import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors as ThemeColors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { showAlert } from '@/utils/alert';
import { QuestionSettingsWidget } from '@/components/question-settings-widget';
import { settingsStorage } from '@/services/settings-storage';
import { apiService } from '@/services/api';

export function SettingsScreen() {
  const { user, logout, isLoadingUser } = useAuth();
  const colorScheme = useColorScheme();
  const colors = ThemeColors[colorScheme ?? 'light'];
  const [projectName, setProjectName] = useState<string | undefined>(undefined);
  const [questionSettings, setQuestionSettings] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (questionSettings?.projectId) {
      loadProjectName(questionSettings.projectId);
    }
  }, [questionSettings?.projectId]);

  const loadSettings = async () => {
    try {
      const saved = await settingsStorage.getSettings();
      if (saved) setQuestionSettings(saved);
      if (saved?.projectName) setProjectName(saved.projectName);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const loadProjectName = async (projectId: string) => {
    try {
      const projects = await apiService.getProjects();
      const project = projects.find((p) => p.id === projectId);
      setProjectName(project?.name);
    } catch (e) {
      console.error('Failed to load project name', e);
    }
  };

  const handleSaveSettings = (settings: any) => {
    setQuestionSettings(settings);
    if (settings?.projectName) {
      setProjectName(settings.projectName);
    } else if (settings?.projectId) {
      loadProjectName(settings.projectId);
    }
  };

  const handleLogout = () => {
    showAlert.confirmDestructive(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        await logout();
      },
      () => {},
      'Sign Out',
      'Cancel'
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={100} color={colors.primary} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || ''}</Text>
        </View>

        <QuestionSettingsWidget projectName={projectName} scheduledTime={questionSettings?.scheduledTime} onSettingsChange={handleSaveSettings} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>

          <View style={[styles.card, { backgroundColor: colors.card }] }>
            <View style={styles.aboutRow}>
              <Ionicons name="code-outline" size={20} color={colors.textSecondary} />
              <View style={styles.aboutContent}>
                <Text style={[styles.aboutTitle, { color: colors.text }]}>Version</Text>
                <Text style={[styles.aboutText, { color: colors.textSecondary }]}>1.0.0</Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            { opacity: pressed || isLoadingUser ? 0.7 : 1, borderColor: colors.error, backgroundColor: colors.card, shadowColor: colors.error },
          ]}
          onPress={handleLogout}
          disabled={isLoadingUser}
        >
          {isLoadingUser ? (
            <ActivityIndicator color={colors.error} size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
              <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.footer, { color: colors.textSecondary }]}>© 2026 Recallo. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  avatarContainer: {
    marginBottom: Spacing.base,
  },
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: Typography.fontSize.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  aboutContent: {
    flex: 1,
  },
  aboutTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 4,
  },
  aboutText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing['2xl'],
    marginTop: Spacing.lg,
    marginBottom: Spacing['2xl'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  footer: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});


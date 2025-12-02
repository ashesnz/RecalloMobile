import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';
import { showAlert } from '@/utils/alert';
import { QuestionSettingsWidget } from '@/components/question-settings-widget';
import { settingsStorage } from '@/services/settings-storage';
import { apiService } from '@/services/api';

export default function ProfileScreen() {
  const { user, logout, isLoadingUser } = useAuth();
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
    // use stored projectName when available to avoid extra network calls
    if (settings?.projectName) {
      setProjectName(settings.projectName);
    } else if (settings?.projectId) {
      // fallback to resolving name if name wasn't stored
      loadProjectName(settings.projectId);
    }
  };

  const handleLogout = () => {
    console.log('[ProfileScreen] Logout button clicked');

    showAlert.confirmDestructive(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        console.log('[ProfileScreen] Logout confirmed');
        await logout();
      },
      () => {
        console.log('[ProfileScreen] Logout cancelled');
      },
      'Sign Out',
      'Cancel'
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={100} color={Colors.light.primary} />
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Question Settings Widget - moved from Dashboard */}
        <QuestionSettingsWidget
          projectName={projectName}
          scheduledTime={questionSettings?.scheduledTime}
          onSettingsChange={handleSaveSettings}
        />

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.card}>


            <View style={styles.aboutRow}>
              <Ionicons name="code-outline" size={20} color={Colors.light.textSecondary} />
              <View style={styles.aboutContent}>
                <Text style={styles.aboutTitle}>Version</Text>
                <Text style={styles.aboutText}>1.0.0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            { opacity: pressed || isLoadingUser ? 0.7 : 1 },
          ]}
          onPress={handleLogout}
          disabled={isLoadingUser}
        >
          {isLoadingUser ? (
            <ActivityIndicator color={Colors.light.error} size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={24} color={Colors.light.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </Pressable>

        {/* Footer */}
        <Text style={styles.footer}>
          © 2026 Recallo. All rights reserved.
        </Text>
      </ScrollView>
      {/* settings form removed — project selection handled inside widget */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoLabelText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.textSecondary + '20',
  },
  aboutRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  aboutContent: {
    flex: 1,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.error,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: Colors.light.error,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.error,
  },
  footer: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

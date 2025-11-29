import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';

export default function ProfileScreen() {
  const { user, logout, isLoadingUser } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            // The logout function handles all state management
            // No need to manage local state since component will unmount
            await logout();
          },
        },
      ],
      { cancelable: true }
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
            <Ionicons name="person-circle" size={100} color={Colors.primary} />
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="mail-outline" size={20} color={Colors.textLight} />
                <Text style={styles.infoLabelText}>Email</Text>
              </View>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="person-outline" size={20} color={Colors.textLight} />
                <Text style={styles.infoLabelText}>Name</Text>
              </View>
              <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textLight} />
                <Text style={styles.infoLabelText}>User ID</Text>
              </View>
              <Text style={styles.infoValue} numberOfLines={1}>
                {user?.id || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.textLight} />
              <View style={styles.aboutContent}>
                <Text style={styles.aboutTitle}>Recallo</Text>
                <Text style={styles.aboutText}>
                  Voice-based learning and assessment platform
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.aboutRow}>
              <Ionicons name="code-outline" size={20} color={Colors.textLight} />
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
            <ActivityIndicator color={Colors.gradeF} size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={24} color={Colors.gradeF} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </Pressable>

        {/* Footer */}
        <Text style={styles.footer}>
          © 2024 Recallo. All rights reserved.
        </Text>
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
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
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
    color: Colors.text,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textLight,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.textLight + '20',
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
    color: Colors.text,
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gradeF,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: Colors.gradeF,
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
    color: Colors.gradeF,
  },
  footer: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
});


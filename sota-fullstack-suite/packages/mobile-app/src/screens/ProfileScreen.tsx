import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export function ProfileScreen() {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={['top']}>
          <Text style={styles.title}>Profile</Text>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JS</Text>
            </View>
            <Text style={styles.userName}>John Smith</Text>
            <Text style={styles.userEmail}>john@example.com</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planText}>Pro Plan</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Deploys</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>99%</Text>
              <Text style={styles.statLabel}>Uptime</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Account</Text>

            {[
              { icon: '👤', label: 'Edit Profile', action: 'edit' },
              { icon: '🔒', label: 'Security', action: 'security' },
              { icon: '💳', label: 'Billing', action: 'billing' },
              { icon: '🔔', label: 'Notifications', action: 'notifications' },
            ].map((item) => (
              <TouchableOpacity
                key={item.action}
                style={styles.menuItem}
                onPress={handlePress}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Preferences</Text>

            {[
              { icon: '🎨', label: 'Appearance', action: 'appearance' },
              { icon: '🌐', label: 'Language', action: 'language' },
              { icon: '❓', label: 'Help & Support', action: 'help' },
            ].map((item) => (
              <TouchableOpacity
                key={item.action}
                style={styles.menuItem}
                onPress={handlePress}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handlePress}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fafafa',
    marginBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9333ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 12,
  },
  planBadge: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  planText: {
    fontSize: 12,
    color: '#a855f7',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fafafa',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#71717a',
  },
  menu: {
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#fafafa',
  },
  menuArrow: {
    fontSize: 20,
    color: '#71717a',
  },
  signOutButton: {
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
});

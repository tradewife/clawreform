import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const features = [
  {
    icon: '⚡',
    title: 'Aggressive Performance',
    description: '45-70% faster Core Web Vitals with automatic optimization and GPU-accelerated animations.',
  },
  {
    icon: '📱',
    title: 'Native Experience',
    description: 'Smooth 60fps animations, haptic feedback, and platform-specific optimizations.',
  },
  {
    icon: '🔒',
    title: 'Security First',
    description: 'Biometric authentication, secure storage, and encrypted communications.',
  },
  {
    icon: '📡',
    title: 'Offline First',
    description: 'Full offline capabilities with intelligent sync when connection is restored.',
  },
  {
    icon: '🔔',
    title: 'Push Notifications',
    description: 'Rich push notifications with deep linking and action buttons.',
  },
  {
    icon: '🎨',
    title: 'Solid Design',
    description: 'Professional aesthetics without gradients or glassmorphism.',
  },
];

export function FeaturesScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={['top']}>
          <Text style={styles.title}>Features</Text>
          <Text style={styles.subtitle}>
            Everything you need for high-performance mobile apps
          </Text>

          <View style={styles.features}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                activeOpacity={0.7}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#71717a',
    marginBottom: 24,
  },
  features: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
  },
});

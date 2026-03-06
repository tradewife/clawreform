import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(147, 51, 234, 0.2)', 'transparent']}
        style={styles.gradient}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoText}>S</Text>
              </View>
              <Text style={styles.brandName}>SOTA Suite</Text>
            </View>
          </View>

          {/* Hero Section */}
          <View style={styles.hero}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>45-70% faster Core Web Vitals</Text>
            </View>

            <Text style={styles.heroTitle}>
              Build{' '}
              <Text style={styles.highlight}>high-performance</Text>
              {' '}mobile experiences
            </Text>

            <Text style={styles.heroSubtitle}>
              State-of-the-Art mobile app with aggressive performance optimization
              and solid design principles.
            </Text>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Get Started Free</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            {[
              { value: '45-70%', label: 'Faster CWV' },
              { value: '15-35%', label: 'More Conversions' },
              { value: '60%', label: 'Less Dev Time' },
              { value: '300%', label: 'Avg ROI' },
            ].map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Features Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>

            {[
              { icon: '⚡', title: 'Aggressive Performance', desc: 'GPU-accelerated animations' },
              { icon: '📱', title: 'Native Experience', desc: '60fps guaranteed' },
              { icon: '🔒', title: 'Secure by Default', desc: 'Biometric authentication' },
              { icon: '📡', title: 'Offline First', desc: 'Work without connection' },
            ].map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                onPress={handlePress}
                activeOpacity={0.7}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
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
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#9333ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  brandName: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '600',
  },
  hero: {
    paddingTop: 40,
    paddingBottom: 30,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 20,
    gap: 8,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d4af37',
  },
  badgeText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fafafa',
    lineHeight: 40,
    marginBottom: 16,
  },
  highlight: {
    color: '#a855f7',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#71717a',
    lineHeight: 24,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 40,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#71717a',
  },
});

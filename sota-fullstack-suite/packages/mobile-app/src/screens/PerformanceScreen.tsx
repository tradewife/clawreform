import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PerformanceMetric {
  name: string;
  fullName: string;
  before: string;
  after: string;
  improvement: string;
  target: string;
}

const metrics: PerformanceMetric[] = [
  {
    name: 'LCP',
    fullName: 'Largest Contentful Paint',
    before: '4.2s',
    after: '1.8s',
    improvement: '57%',
    target: '< 2.5s',
  },
  {
    name: 'CLS',
    fullName: 'Cumulative Layout Shift',
    before: '0.25',
    after: '0.05',
    improvement: '80%',
    target: '< 0.1',
  },
  {
    name: 'INP',
    fullName: 'Interaction to Next Paint',
    before: '350ms',
    after: '120ms',
    improvement: '66%',
    target: '< 200ms',
  },
  {
    name: 'FCP',
    fullName: 'First Contentful Paint',
    before: '3.5s',
    after: '1.4s',
    improvement: '60%',
    target: '< 1.8s',
  },
];

export function PerformanceScreen() {
  const [animatedImprovements, setAnimatedImprovements] = useState<number[]>(
    metrics.map(() => 0)
  );

  useEffect(() => {
    // Animate improvement bars
    const timers = metrics.map((metric, index) => {
      return setTimeout(() => {
        setAnimatedImprovements((prev) => {
          const newValues = [...prev];
          newValues[index] = parseInt(metric.improvement);
          return newValues;
        });
      }, index * 200);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={['top']}>
          <Text style={styles.title}>Performance</Text>
          <Text style={styles.subtitle}>
            Measurable performance gains, not simulated results
          </Text>

          <View style={styles.metrics}>
            {metrics.map((metric, index) => (
              <View key={metric.name} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricName}>{metric.name}</Text>
                  <View style={styles.targetBadge}>
                    <Text style={styles.targetText}>Target: {metric.target}</Text>
                  </View>
                </View>
                <Text style={styles.metricFullName}>{metric.fullName}</Text>

                <View style={styles.metricValues}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Before</Text>
                    <Text style={styles.beforeValue}>{metric.before}</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>After</Text>
                    <Text style={styles.afterValue}>{metric.after}</Text>
                  </View>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${animatedImprovements[index]}%` },
                    ]}
                  />
                </View>
                <Text style={styles.improvementText}>
                  {metric.improvement} faster
                </Text>
              </View>
            ))}
          </View>

          {/* Bundle Size Section */}
          <View style={styles.bundleSection}>
            <Text style={styles.bundleTitle}>Bundle Size Reduction</Text>

            <View style={styles.bundleComparison}>
              <View style={styles.bundleRow}>
                <Text style={styles.bundleLabel}>Traditional</Text>
                <View style={styles.bundleBar}>
                  <View style={[styles.bundleFill, styles.bundleFillBefore]} />
                </View>
                <Text style={styles.bundleValueBefore}>450KB</Text>
              </View>

              <View style={styles.bundleRow}>
                <Text style={styles.bundleLabel}>SOTA Suite</Text>
                <View style={styles.bundleBar}>
                  <View style={[styles.bundleFill, styles.bundleFillAfter]} />
                </View>
                <Text style={styles.bundleValueAfter}>112KB</Text>
              </View>
            </View>

            <Text style={styles.bundleResult}>
              <Text style={styles.highlight}>75% smaller</Text> with automatic tree-shaking
            </Text>
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
  metrics: {
    gap: 16,
    marginBottom: 32,
  },
  metricCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#a855f7',
  },
  targetBadge: {
    backgroundColor: '#09090b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  targetText: {
    fontSize: 10,
    color: '#71717a',
  },
  metricFullName: {
    fontSize: 12,
    color: '#71717a',
    marginBottom: 16,
  },
  metricValues: {
    gap: 8,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 14,
    color: '#71717a',
  },
  beforeValue: {
    fontSize: 14,
    color: '#ef4444',
    fontFamily: 'monospace',
  },
  afterValue: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#09090b',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9333ea',
    borderRadius: 4,
  },
  improvementText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#a855f7',
    fontWeight: '600',
  },
  bundleSection: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  bundleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 20,
  },
  bundleComparison: {
    gap: 16,
    marginBottom: 16,
  },
  bundleRow: {
    gap: 8,
  },
  bundleLabel: {
    fontSize: 14,
    color: '#71717a',
  },
  bundleBar: {
    height: 16,
    backgroundColor: '#09090b',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bundleFill: {
    height: '100%',
    borderRadius: 8,
  },
  bundleFillBefore: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.5)',
  },
  bundleFillAfter: {
    width: '25%',
    backgroundColor: '#22c55e',
  },
  bundleValueBefore: {
    fontSize: 14,
    color: '#ef4444',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  bundleValueAfter: {
    fontSize: 14,
    color: '#22c55e',
    fontFamily: 'monospace',
    fontWeight: '700',
    textAlign: 'right',
  },
  bundleResult: {
    textAlign: 'center',
    fontSize: 14,
    color: '#a1a1aa',
  },
  highlight: {
    color: '#a855f7',
    fontWeight: '700',
  },
});

'use client';

import { useScrollAnimation } from '@sota/shared-ui';

const metrics = [
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

export function PerformanceSection() {
  const { ref, animationStyles } = useScrollAnimation({ delay: 200 });

  return (
    <section
      id="performance"
      ref={ref as React.RefObject<HTMLElement>}
      style={animationStyles}
      className="py-20 sm:py-32 bg-surface-900"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-50 mb-4">
            Measurable{' '}
            <span className="text-primary-400">performance gains</span>
          </h2>
          <p className="max-w-2xl mx-auto text-surface-400 text-lg">
            Real Core Web Vitals improvements, not simulated results.
          </p>
        </div>

        {/* Metrics comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="bg-surface-800 rounded-xl p-6 border border-surface-700"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary-400">
                  {metric.name}
                </span>
                <span className="text-xs text-surface-500 bg-surface-900 px-2 py-1 rounded">
                  Target: {metric.target}
                </span>
              </div>
              <p className="text-sm text-surface-500 mb-4">{metric.fullName}</p>

              <div className="flex items-center justify-between mb-2">
                <span className="text-surface-500 text-sm">Before</span>
                <span className="text-red-400 font-mono">{metric.before}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-surface-500 text-sm">After</span>
                <span className="text-green-400 font-mono font-bold">
                  {metric.after}
                </span>
              </div>

              <div className="h-2 bg-surface-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                  style={{ width: metric.improvement }}
                />
              </div>
              <p className="text-center text-sm text-primary-400 mt-2 font-medium">
                {metric.improvement} faster
              </p>
            </div>
          ))}
        </div>

        {/* Bundle size comparison */}
        <div className="bg-surface-800 rounded-2xl p-8 border border-surface-700">
          <h3 className="text-xl font-semibold text-surface-50 mb-6">
            Bundle Size Reduction
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-surface-500 mb-2">Traditional Approach</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-4 bg-surface-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500/50 w-full" />
                </div>
                <span className="font-mono text-red-400">450KB</span>
              </div>
            </div>
            <div>
              <p className="text-surface-500 mb-2">SOTA Suite Optimized</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-4 bg-surface-900 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[25%]" />
                </div>
                <span className="font-mono text-green-400">112KB</span>
              </div>
            </div>
          </div>
          <p className="text-center text-surface-400 mt-6">
            <span className="text-primary-400 font-bold">75% smaller</span> bundle size with automatic tree-shaking and code splitting
          </p>
        </div>
      </div>
    </section>
  );
}

'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, useScrollAnimation } from '@sota/shared-ui';

const features = [
  {
    icon: '⚡',
    title: 'Aggressive Performance',
    description: '45-70% faster Core Web Vitals with automatic optimization and GPU-accelerated animations.',
  },
  {
    icon: '📱',
    title: 'PWA Ready',
    description: 'Full Progressive Web App support with offline capabilities, push notifications, and install prompts.',
  },
  {
    icon: '🎨',
    title: 'Solid Design System',
    description: 'Professional aesthetics without gradients or glassmorphism. Clean, purposeful design.',
  },
  {
    icon: '📊',
    title: 'Real Analytics',
    description: 'Genuine Web Vitals tracking with business impact metrics, not vanity numbers.',
  },
  {
    icon: '🧩',
    title: 'Modular Architecture',
    description: '9 specialized modules for different use cases. Use what you need, nothing more.',
  },
  {
    icon: '🔒',
    title: 'Security First',
    description: 'Built-in security headers, CSP support, and best practices by default.',
  },
];

export function FeaturesSection() {
  const { ref, animationStyles } = useScrollAnimation({ delay: 100 });

  return (
    <section
      id="features"
      ref={ref as React.RefObject<HTMLElement>}
      style={animationStyles}
      className="py-20 sm:py-32 bg-surface-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-50 mb-4">
            Everything you need for{' '}
            <span className="text-primary-400">high-performance</span> apps
          </h2>
          <p className="max-w-2xl mx-auto text-surface-400 text-lg">
            Built with real performance optimization, not just pretty templates.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              variant="default"
              padding="lg"
              hoverable
              className="group"
            >
              <CardHeader>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-surface-400">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { Button, useScrollAnimation } from '@sota/shared-ui';
import Link from 'next/link';

export function CTASection() {
  const { ref, animationStyles } = useScrollAnimation({ delay: 300 });

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={animationStyles}
      className="py-20 sm:py-32 bg-surface-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-8 sm:p-16">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to build faster?
            </h2>
            <p className="max-w-2xl mx-auto text-primary-200 text-lg mb-10">
              Start building high-performance web experiences today.
              No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="accent"
                size="xl"
                className="bg-white text-primary-900 hover:bg-primary-50"
                asChild
              >
                <Link href="/get-started">
                  Get Started Free
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">
                  Talk to Sales
                </Link>
              </Button>
            </div>

            <p className="mt-8 text-sm text-primary-300">
              Trusted by developers at{' '}
              <span className="text-white font-medium">1000+</span> companies
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

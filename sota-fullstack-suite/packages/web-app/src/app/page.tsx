import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@sota/shared-ui';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { PerformanceSection } from '@/components/sections/PerformanceSection';
import { CTASection } from '@/components/sections/CTASection';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

export default function HomePage() {
  return (
    <>
      <PerformanceMonitor />
      <Navigation />

      <main className="relative">
        <HeroSection />
        <FeaturesSection />
        <PerformanceSection />
        <CTASection />
      </main>

      <Footer />
    </>
  );
}

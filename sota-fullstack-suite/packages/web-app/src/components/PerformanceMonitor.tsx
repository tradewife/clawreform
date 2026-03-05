'use client';

import { usePerformanceMonitor } from '@sota/shared-ui';
import { useEffect, useState } from 'react';

export function PerformanceMonitor() {
  const { vitals, getOverallRating } = usePerformanceMonitor({
    logToConsole: process.env.NODE_ENV === 'development',
  });
  const [showMetrics, setShowMetrics] = useState(false);

  // Only show in development or when query param is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowMetrics(
      process.env.NODE_ENV === 'development' || params.has('perf')
    );
  }, []);

  if (!showMetrics) return null;

  const rating = getOverallRating();
  const ratingColors = {
    good: 'text-green-400',
    'needs-improvement': 'text-yellow-400',
    poor: 'text-red-400',
    pending: 'text-surface-500',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-surface-900/90 backdrop-blur-sm border border-surface-700 rounded-lg p-3 text-xs font-mono">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-surface-500">Performance:</span>
        <span className={ratingColors[rating]}>{rating}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {Object.entries(vitals).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-surface-500 uppercase">{key}:</span>
            <span className={value !== null ? 'text-surface-300' : 'text-surface-600'}>
              {value !== null ? `${Math.round(value)}ms` : '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

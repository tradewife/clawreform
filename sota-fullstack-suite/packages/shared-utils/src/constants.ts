// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  timeout: 30000,
  retries: 3,
} as const;

// Performance thresholds (in milliseconds)
export const PERFORMANCE_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
  inp: { good: 200, poor: 500 },
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Animation durations (in milliseconds)
export const ANIMATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const;

// Easing functions
export const EASING = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Plan limits
export const PLAN_LIMITS = {
  free: {
    projects: 1,
    teamMembers: 1,
    analytics: false,
    customDomain: false,
  },
  pro: {
    projects: 10,
    teamMembers: 5,
    analytics: true,
    customDomain: true,
  },
  enterprise: {
    projects: -1, // unlimited
    teamMembers: -1, // unlimited
    analytics: true,
    customDomain: true,
  },
} as const;

// Social links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/sotasuite',
  github: 'https://github.com/sotasuite',
  discord: 'https://discord.gg/sotasuite',
} as const;

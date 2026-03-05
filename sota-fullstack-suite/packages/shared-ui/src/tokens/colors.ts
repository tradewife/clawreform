// Solid Design System Color Tokens
// Professional palette without gradients or glassmorphism

export const colors = {
  // Primary brand color
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Surface colors for backgrounds and cards
  surface: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // Accent colors - metallic tones
  accent: {
    gold: '#d4af37',
    goldLight: '#e5c76b',
    goldDark: '#b8962e',
    copper: '#b87333',
    copperLight: '#d4956a',
    copperDark: '#8f5726',
    platinum: '#e5e4e2',
    platinumLight: '#f5f5f5',
    platinumDark: '#c0c0c0',
  },

  // Semantic colors
  success: {
    light: '#4ade80',
    DEFAULT: '#22c55e',
    dark: '#16a34a',
  },
  warning: {
    light: '#fbbf24',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  error: {
    light: '#f87171',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#60a5fa',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
  },
} as const;

// CSS custom properties generator
export function generateCSSCustomProperties(): string {
  const properties: string[] = [];

  Object.entries(colors).forEach(([category, shades]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      const varName = typeof shade === 'string' && !isNaN(Number(shade))
        ? `--color-${category}-${shade}`
        : `--color-${category}${shade === 'DEFAULT' ? '' : `-${shade}`}`;
      properties.push(`  ${varName}: ${value};`);
    });
  });

  return `:root {\n${properties.join('\n')}\n}`;
}

export type ColorCategory = keyof typeof colors;

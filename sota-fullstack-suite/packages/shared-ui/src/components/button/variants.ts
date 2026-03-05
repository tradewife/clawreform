import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  // Base styles - solid design, no gradients
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
        secondary:
          'bg-surface-800 text-surface-100 hover:bg-surface-700 border border-surface-700',
        outline:
          'border border-surface-600 text-surface-100 hover:bg-surface-800 hover:border-surface-500',
        ghost:
          'text-surface-300 hover:text-surface-100 hover:bg-surface-800/50',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        accent:
          'bg-accent-gold text-surface-900 hover:bg-accent-copper font-semibold',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

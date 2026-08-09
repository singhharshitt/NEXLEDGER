import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-accent-primary text-text-inverse hover:bg-accent-hover shadow-sm',
        secondary: 'bg-bg-elevated text-text-primary border border-border-default hover:bg-bg-muted',
        outline: 'border border-border-default bg-transparent text-text-primary hover:bg-bg-elevated',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
        danger: 'bg-danger text-white hover:bg-red-700',
        success: 'bg-success text-white hover:bg-green-700',
        link: 'text-accent-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 text-sm rounded-[var(--radius-md)]',
        sm: 'h-8 px-3 text-xs rounded-[var(--radius-sm)]',
        lg: 'h-12 px-6 text-base rounded-[var(--radius-md)]',
        icon: 'h-10 w-10 rounded-[var(--radius-md)]',
        'icon-sm': 'h-8 w-8 rounded-[var(--radius-sm)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

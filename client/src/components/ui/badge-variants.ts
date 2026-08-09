import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-accent-primary text-text-inverse',
        secondary: 'bg-bg-elevated text-text-secondary border border-border-subtle',
        success: 'bg-success-bg text-success border border-success-border',
        warning: 'bg-warning-bg text-warning border border-warning-border',
        danger: 'bg-danger-bg text-danger border border-danger-border',
        info: 'bg-info-bg text-info',
        outline: 'border border-border-default text-text-secondary bg-transparent',
        DRAFT: 'bg-bg-elevated text-text-muted',
        CONFIRMED: 'bg-success-bg text-success border border-success-border',
        CANCELLED: 'bg-danger-bg text-danger border border-danger-border',
        LEAD: 'bg-info-bg text-info',
        ACTIVE: 'bg-success-bg text-success border border-success-border',
        INACTIVE: 'bg-bg-elevated text-text-muted',
        healthy: 'bg-success-bg text-success border border-success-border',
        low: 'bg-warning-bg text-warning border border-warning-border',
        out: 'bg-danger-bg text-danger border border-danger-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

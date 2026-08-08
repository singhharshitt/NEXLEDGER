import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
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

        // Status-specific
        draft: 'bg-warning-bg text-amber-700 border border-warning-border',
        confirmed: 'bg-success-bg text-success border border-success-border',
        cancelled: 'bg-danger-bg text-danger border border-danger-border',

        // Customer status
        lead: 'bg-blue-50 text-blue-700 border border-blue-200',
        active: 'bg-success-bg text-success border border-success-border',
        inactive: 'bg-gray-100 text-gray-600 border border-gray-200',

        // Stock status
        healthy: 'bg-success-bg text-success border border-success-border',
        low: 'bg-warning-bg text-amber-700 border border-warning-border',
        out: 'bg-danger-bg text-danger border border-danger-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-bg-card border border-border-subtle rounded-[var(--radius-lg)] p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-10 w-10 rounded-[var(--radius-md)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border-subtle rounded-[var(--radius-lg)] p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-metadata mb-3">{label}</p>
          <p className="text-2xl font-bold font-mono text-text-primary tabular-nums">{value}</p>
          {trend && (
            <p className={cn('text-xs font-medium mt-2', trend.positive ? 'text-success' : 'text-danger')}>
              {trend.value}
            </p>
          )}
        </div>
        <div className="h-10 w-10 rounded-[var(--radius-md)] bg-bg-elevated flex items-center justify-center group-hover:bg-accent-lime/20 transition-colors">
          <Icon className="h-5 w-5 text-text-secondary group-hover:text-accent-primary transition-colors" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

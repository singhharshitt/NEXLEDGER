import { cn } from '@/lib/utils';
import type { CustomerStatus, ChallanStatus, StockStatus } from '@/types';

const statusLabels: Record<string, string> = {
  // Challan status (UPPERCASE)
  DRAFT: 'Draft',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  // Customer status (UPPERCASE)
  LEAD: 'Lead',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  // Stock status (lowercase — computed, not stored)
  healthy: 'In Stock',
  low: 'Low Stock',
  out: 'Out of Stock',
};

const statusConfig: Record<string, { bg: string; text: string; border: string; dot?: string }> = {
  DRAFT: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  CONFIRMED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  LEAD: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  INACTIVE: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  healthy: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  low: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  out: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

interface StatusBadgeProps {
  status: CustomerStatus | ChallanStatus | StockStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  const label = statusLabels[status] ?? status;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
      config.bg, config.text, config.border,
      className
    )}>
      {status === 'DRAFT' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
        </span>
      )}
      {label}
    </span>
  );
}

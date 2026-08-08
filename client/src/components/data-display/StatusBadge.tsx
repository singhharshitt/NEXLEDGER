import { Badge } from '@/components/ui/badge';
import type { CustomerStatus, ChallanStatus, StockStatus } from '@/types';

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  lead: 'Lead',
  active: 'Active',
  inactive: 'Inactive',
  healthy: 'In Stock',
  low: 'Low Stock',
  out: 'Out of Stock',
};

interface StatusBadgeProps {
  status: CustomerStatus | ChallanStatus | StockStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={status} className={className}>
      {statusLabels[status] || status}
    </Badge>
  );
}

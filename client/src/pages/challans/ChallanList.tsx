import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { EmptyState } from '@/components/data-display/EmptyState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useChallans } from '@/hooks/useChallans';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Challan, ChallanStatus } from '@/types';

export default function ChallanList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChallanStatus | 'all'>('all');
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, refetch } = useChallans({
    search: debouncedSearch,
    status: statusFilter,
  });

  const challans = data?.data || [];

  if (isError) return <ErrorState title="Unable to load challans" onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader
        title="Sales Challans"
        description="Manage delivery challans and sales documentation."
        action={<Button onClick={() => navigate('/challans/new')}><Plus className="h-4 w-4" aria-hidden="true" /> New Challan</Button>}
      />

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
            <Input placeholder="Search by challan number or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X className="h-4 w-4" /></button>}
          </div>
          <div className="flex gap-1 bg-bg-elevated p-1 rounded-[var(--radius-md)]">
            {[
              { value: 'all', label: 'All' },
              { value: 'draft', label: 'Draft' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'cancelled', label: 'Cancelled' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value as ChallanStatus | 'all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-[var(--radius-sm)] transition-colors ${
                  statusFilter === opt.value ? 'bg-bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card className="p-4"><div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div></Card>
      ) : !challans.length ? (
        <EmptyState
          title="No challans found"
          description={search || statusFilter !== 'all'
            ? 'Try adjusting your search or filters.'
            : 'Create your first sales challan to get started.'}
          action={!search && statusFilter === 'all' ? { label: 'New Challan', onClick: () => navigate('/challans/new') } : undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Challan No.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Items</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c: Challan) => (
                  <tr key={c.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-medium text-text-primary">{c.challanNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-text-primary">{c.customerName}</p>
                      <p className="text-xs text-text-muted truncate max-w-[180px]">{c.customerBusiness}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm font-mono text-text-secondary tabular-nums">{formatDate(c.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="text-sm text-text-secondary">{c.items.length}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono tabular-nums font-medium text-text-primary">{formatCurrency(c.totalAmount)}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/challans/${c.id}`)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Plus, Eye, Check, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChallans, useConfirmChallan, useCancelChallan } from '@/hooks/useChallans';
import type { ChallanStatus } from '@/types';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { ErrorState } from '@/components/data-display/ErrorState';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/stores/auth.store';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ChallanList() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChallanStatus | 'all' | undefined>(undefined);
  const debouncedSearch = useDebounce(search, 400);

  const { data: paginatedData, isLoading, error, refetch } = useChallans({
    search: debouncedSearch,
    status: statusFilter,
    limit: 50,
  });

  const challans = paginatedData?.data ?? [];

  // Dialog states
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const confirmMutation = useConfirmChallan();
  const cancelMutation = useCancelChallan();

  const handleConfirm = () => {
    if (!confirmId) return;
    confirmMutation.mutate(confirmId, {
      onSuccess: () => setConfirmId(null)
    });
  };

  const handleCancel = () => {
    if (!cancelId) return;
    cancelMutation.mutate(cancelId, {
      onSuccess: () => setCancelId(null)
    });
  };

  const activeTab = statusFilter ?? 'all';
  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'DRAFT', label: 'Draft' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4F0] p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#142814]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 bg-[#F0F4F0] min-h-screen">
        <ErrorState title="Unable to load challans" message="Something went wrong." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-[#F0F4F0] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1F0A] tracking-tight font-space">
            Sales Challans
          </h1>
          <p className="text-[#5A6B5A] mt-1 text-sm">
            Manage your sales challans and inventory deductions
          </p>
        </div>
        
        {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
          <Link to="/challans/new">
            <Button className="h-10 px-4 bg-[#142814] text-white rounded-lg text-sm hover:bg-[#1a2e1a]">
              <Plus className="w-4 h-4 mr-2" />
              New Challan
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key === 'all' ? undefined : tab.key as ChallanStatus)}
              className={cn(
                "h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeTab === tab.key
                  ? "bg-[#142814] text-white"
                  : "bg-white text-[#5A6B5A] border border-[#E2EFE2] hover:bg-[#E8F0E8]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8A9A8A]" />
          <Input 
            placeholder="Search challan or customer..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm overflow-hidden">
        {challans.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#F0F4F0] rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[#8A9A8A]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0A1F0A] mb-2 font-space">
              No challans found
            </h3>
            <p className="text-sm text-[#5A6B5A] max-w-sm">
              {(search || statusFilter) ? 'Try adjusting your filters.' : 'Create your first challan to get started.'}
            </p>
            {!(search || statusFilter) && (user?.role === 'ADMIN' || user?.role === 'SALES') && (
              <Link to="/challans/new">
                <Button className="mt-6 bg-[#142814] text-white hover:bg-[#1a2e1a]">
                  New Challan
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-[#E8F0E8]">
                <tr className="h-10 text-left text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium">
                  <th className="px-4">Challan No.</th>
                  <th className="px-4">Customer</th>
                  <th className="px-4">Date</th>
                  <th className="px-4 text-center">Items</th>
                  <th className="px-4 text-right">Total</th>
                  <th className="px-4 text-center">Status</th>
                  <th className="px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id} className="h-14 border-b border-[#E2EFE2] last:border-0 hover:bg-[#E8F0E8]/50 transition-colors">
                    <td className="px-4">
                      <Link to={`/challans/${c.id}`} className="font-mono text-sm font-medium text-[#0A1F0A] hover:underline">
                        {c.challanNumber}
                      </Link>
                    </td>
                    <td className="px-4">
                      <p className="text-sm font-medium text-[#0A1F0A]">{c.customerName}</p>
                    </td>
                    <td className="px-4 font-mono text-xs text-[#8A9A8A]">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F0F4F0] text-xs font-medium text-[#5A6B5A]">
                        {c.totalQuantity}
                      </span>
                    </td>
                    <td className="px-4 text-right font-mono text-sm font-medium text-[#0A1F0A]">
                      {formatCurrency(c.totalAmount)}
                    </td>
                    <td className="px-4 text-center">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 text-right space-x-2">
                      <Link to={`/challans/${c.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5A6B5A] hover:text-[#0A1F0A] hover:bg-[#E8F0E8]">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      {c.status === 'DRAFT' && (user?.role === 'ADMIN' || user?.role === 'SALES') && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setConfirmId(c.id)}
                            className="h-8 w-8 text-[#16A34A] hover:text-[#15803d] hover:bg-[#F0FDF4]"
                            title="Confirm"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setCancelId(c.id)}
                            className="h-8 w-8 text-[#F43F5E] hover:text-[#BE123C] hover:bg-[#FFF1F2]"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Confirm Challan"
        description="Confirming this challan will deduct stock from inventory. This action cannot be undone."
        confirmText="Confirm Challan"
        confirmVariant="default"
        onConfirm={handleConfirm}
        isLoading={confirmMutation.isPending}
      />

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(open) => !open && setCancelId(null)}
        title="Cancel Challan"
        description="Are you sure you want to cancel this draft challan? It will be marked as cancelled."
        confirmText="Cancel Challan"
        confirmVariant="danger"
        onConfirm={handleCancel}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'DRAFT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#FEF3C7] text-[#D97706]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
        Draft
      </span>
    );
  }
  if (status === 'CONFIRMED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#DCFCE7] text-[#15803D]">
        Confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#F1F5F9] text-[#64748B] line-through opacity-70">
      Cancelled
    </span>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, Building2, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { useChallan, useConfirmChallan, useCancelChallan } from '@/hooks/useChallans';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, formatDate, formatDateTime, cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import { useState } from 'react';
import type { ChallanItem } from '@/types';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function ChallanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: challan, isLoading, isError, refetch } = useChallan(id!);
  const confirmChallan = useConfirmChallan();
  const cancelChallan = useCancelChallan();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const handleConfirm = async () => {
    try {
      await confirmChallan.mutateAsync(id!);
      setShowConfirm(false);
      toast({ title: 'Challan confirmed', description: 'Inventory has been updated.', type: 'success' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast({ title: 'Error', description: axiosErr?.response?.data?.message || 'Failed to confirm challan.', type: 'error' });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelChallan.mutateAsync(id!);
      setShowCancel(false);
      toast({ title: 'Challan cancelled', type: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel challan.', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4"><Skeleton className="h-24" /><Skeleton className="h-48" /></div>
          <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-32" /></div>
        </div>
      </div>
    );
  }

  if (isError || !challan) return <ErrorState title="Unable to load challan" onRetry={() => refetch()} />;

  const timeline = [
    { label: 'Created', date: challan.createdAt, icon: FileText, color: 'text-text-muted' },
    ...(challan.confirmedAt ? [{ label: 'Confirmed', date: challan.confirmedAt, icon: CheckCircle2, color: 'text-success' }] : []),
    ...(challan.cancelledAt ? [{ label: 'Cancelled', date: challan.cancelledAt, icon: XCircle, color: 'text-danger' }] : []),
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/challans')} aria-label="Back to challans">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h2 font-mono text-text-primary">{challan.challanNumber}</h1>
            <StatusBadge status={challan.status} />
          </div>
          <p className="text-body-sm text-text-muted mt-1">Created by {challan.createdByName} · {formatDate(challan.createdAt)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {challan.status === 'DRAFT' && (
            <>
              <Button variant="outline" onClick={() => setShowCancel(true)}>Cancel</Button>
              <Button onClick={() => setShowConfirm(true)}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Confirm
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[var(--radius-md)] bg-bg-elevated flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-text-muted" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{challan.customerName}</p>
                  <p className="text-xs text-text-muted">{challan.customerBusiness}</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate(`/customers/${challan.customerId}`)}>
                  View Customer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items table */}
          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">SKU</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Price</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Qty</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challan.items.map((item: ChallanItem) => (
                      <tr key={item.id} className="border-b border-border-subtle last:border-0">
                        <td className="px-3 py-2.5">
                          <p className="text-sm text-text-primary">{item.productName}</p>
                        </td>
                        <td className="px-3 py-2.5 hidden sm:table-cell">
                          <span className="text-sm font-mono text-text-muted">{item.sku}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-sm font-mono tabular-nums text-text-secondary">{formatCurrency(item.unitPrice)}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-sm font-mono tabular-nums font-medium text-text-primary">{item.quantity}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-sm font-mono tabular-nums font-semibold text-text-primary">{formatCurrency(item.total)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border-default">
                      <td colSpan={3} className="px-3 py-3 text-sm font-semibold text-text-primary hidden sm:table-cell">Total</td>
                      <td className="px-3 py-3 text-right sm:hidden" colSpan={2}><span className="text-sm font-semibold">Total</span></td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-sm font-mono tabular-nums font-semibold text-text-primary">{challan.totalQuantity}</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-base font-mono tabular-nums font-bold text-text-primary">{formatCurrency(challan.totalAmount)}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">Items</span>
                <span className="text-sm font-mono text-text-primary">{challan.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">Total Quantity</span>
                <span className="text-sm font-mono text-text-primary">{challan.totalQuantity}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border-subtle">
                <span className="text-sm font-semibold text-text-primary">Total Amount</span>
                <span className="text-base font-mono tabular-nums font-bold text-text-primary">{formatCurrency(challan.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-0">
                {timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-6 pb-4 last:pb-0">
                    {idx < timeline.length - 1 && <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border-subtle" />}
                    <div className={cn('absolute left-0 top-0.5', event.color)}>
                      <event.icon className="h-[14px] w-[14px]" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">{event.label}</p>
                    <p className="text-xs font-mono text-text-muted">{formatDateTime(event.date)}</p>
                  </div>
                ))}
                {challan.status === 'DRAFT' && (
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-0.5 text-text-muted">
                      <Clock className="h-[14px] w-[14px]" />
                    </div>
                    <p className="text-sm text-text-muted italic">Awaiting confirmation</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {challan.notes && (
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-text-secondary">{challan.notes}</p></CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Challan?</DialogTitle>
            <DialogDescription>
              Confirming challan <span className="font-mono font-semibold">{challan.challanNumber}</span> will deduct stock for all {challan.items.length} items. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={confirmChallan.isPending}>
              {confirmChallan.isPending ? 'Confirming...' : 'Confirm Challan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Challan?</DialogTitle>
            <DialogDescription>
              This will mark challan <span className="font-mono font-semibold">{challan.challanNumber}</span> as cancelled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancel(false)}>Keep Challan</Button>
            <Button variant="danger" onClick={handleCancel} disabled={cancelChallan.isPending}>
              {cancelChallan.isPending ? 'Cancelling...' : 'Cancel Challan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

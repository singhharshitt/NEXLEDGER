import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Printer, Check, X, Building2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChallan, useConfirmChallan, useCancelChallan } from '@/hooks/useChallans';
import { useProducts } from '@/hooks/useProducts';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { ErrorState } from '@/components/data-display/ErrorState';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuthStore } from '@/stores/auth.store';

export default function ChallanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: challan, isLoading, error, refetch } = useChallan(id as string);
  const { data: productsData } = useProducts({ limit: 1000 }); // To check if current price differs
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const confirmMutation = useConfirmChallan();
  const cancelMutation = useCancelChallan();

  const handleConfirm = () => {
    confirmMutation.mutate(id as string, {
      onSuccess: () => setConfirmOpen(false)
    });
  };

  const handleCancel = () => {
    cancelMutation.mutate(id as string, {
      onSuccess: () => setCancelOpen(false)
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4F0] p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#142814]" />
      </div>
    );
  }

  if (error || !challan) {
    return (
      <div className="p-6 lg:p-8 bg-[#F0F4F0] min-h-screen">
        <ErrorState title="Unable to load challan" message="Something went wrong while fetching challan data." onRetry={() => refetch()} />
      </div>
    );
  }

  const products = productsData?.data || [];
  const isDraft = challan.status === 'DRAFT';
  const canEdit = isDraft && (user?.role === 'ADMIN' || user?.role === 'SALES');

  return (
    <div className="min-h-screen bg-[#F0F4F0] pb-24">
      {/* Top Nav / Breadcrumb (Hidden on Print) */}
      <div className="bg-white border-b border-[#E2EFE2] sticky top-0 z-40 print:hidden">
        <div className="p-4 lg:px-8 max-w-6xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm">
            <Button variant="ghost" size="icon" onClick={() => navigate('/challans')} className="text-[#5A6B5A] -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/challans" className="text-[#8A9A8A] hover:text-[#0A1F0A] transition-colors">
              Challans
            </Link>
            <span className="text-[#8A9A8A]">/</span>
            <span className="text-[#0A1F0A] font-medium font-mono">{challan.challanNumber}</span>
          </nav>

          <div className="flex gap-2">
            {challan.status === 'CONFIRMED' && (
              <Button variant="outline" onClick={handlePrint} className="h-9 border-[#E2EFE2] text-[#5A6B5A]">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            )}
            
            {canEdit && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setCancelOpen(true)}
                  className="h-9 border-[#FBCFE8] text-[#E11D48] hover:bg-[#FFF1F2]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={() => setConfirmOpen(true)}
                  className="h-9 bg-[#142814] text-white hover:bg-[#1a2e1a]"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-6">
        
        {/* Print Header (Only visible on print) */}
        <div className="hidden print:block mb-8 pb-8 border-b-2 border-black">
          <h1 className="text-3xl font-bold uppercase tracking-widest">DELIVERY CHALLAN</h1>
          <p className="font-mono mt-2">No. {challan.challanNumber}</p>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-6 print:shadow-none print:border-black">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-[#0A1F0A] font-space">{challan.challanNumber}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-[#5A6B5A]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(challan.createdAt)}
                </span>
                <span>By {challan.createdByName}</span>
              </div>
            </div>
            <div className="print:hidden">
              <StatusBadge status={challan.status} />
            </div>
            <div className="hidden print:block">
              <p className="font-bold text-lg uppercase">{challan.status}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            
            {/* Customer Card */}
            <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-6 print:shadow-none print:border-black">
              <h3 className="text-sm font-bold text-[#0A1F0A] uppercase tracking-widest mb-4">Bill To</h3>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#F0F4F0] rounded-lg flex items-center justify-center print:hidden">
                  <Building2 className="w-6 h-6 text-[#8A9A8A]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[#0A1F0A]">{challan.customerName}</h4>
                  <p className="text-[#5A6B5A] mt-1">{challan.customerBusiness}</p>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    {/* Assuming we might fetch full customer details, but we only have basic info in challan right now */}
                    <div className="flex items-center gap-2 text-[#5A6B5A]">
                       <Link to={`/customers/${challan.customerId}`} className="text-[#142814] font-medium hover:underline print:no-underline">
                         View Customer Profile →
                       </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm overflow-hidden print:shadow-none print:border-black">
              <div className="p-5 border-b border-[#E2EFE2] print:border-black">
                <h3 className="text-sm font-bold text-[#0A1F0A] uppercase tracking-widest">Line Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#E8F0E8] print:bg-transparent print:border-b-2 print:border-black">
                    <tr className="h-10 text-left text-[11px] uppercase tracking-widest text-[#8A9A8A] print:text-black font-medium">
                      <th className="px-5 w-12 text-center">#</th>
                      <th className="px-5">Product</th>
                      <th className="px-5 text-right">Price</th>
                      <th className="px-5 text-center">Qty</th>
                      <th className="px-5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challan.items.map((item, index) => {
                      const currentProduct = products.find(p => p.id === item.productId);
                      const priceChanged = currentProduct && currentProduct.unitPrice !== item.unitPrice;

                      return (
                        <tr key={item.id} className="border-b border-[#E2EFE2] last:border-0 print:border-black/20">
                          <td className="px-5 py-4 text-center text-sm text-[#8A9A8A] font-mono">{index + 1}</td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-[#0A1F0A]">{item.productName}</p>
                            <p className="text-xs text-[#5A6B5A] font-mono mt-0.5">{item.sku}</p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="font-mono text-sm text-[#0A1F0A]">{formatCurrency(item.unitPrice)}</span>
                            {priceChanged && (
                              <span className="block text-[10px] text-[#8A9A8A] line-through print:hidden">
                                Cur: {formatCurrency(currentProduct.unitPrice)}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center font-mono text-sm font-medium text-[#0A1F0A]">
                            {item.quantity}
                          </td>
                          <td className="px-5 py-4 text-right font-mono text-sm font-bold text-[#142814]">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-[#F9FBF9] p-5 border-t border-[#E2EFE2] flex justify-end print:bg-transparent print:border-black">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5A6B5A]">Subtotal</span>
                    <span className="font-mono text-[#0A1F0A]">{formatCurrency(challan.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-[#E2EFE2] print:border-black">
                    <span className="text-[#0A1F0A]">Grand Total</span>
                    <span className="font-mono text-[#142814]">{formatCurrency(challan.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-6 print:hidden">
              <h3 className="text-sm font-bold text-[#0A1F0A] uppercase tracking-widest mb-6">Timeline</h3>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E2EFE2] before:to-transparent">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-[#142814] text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow" />
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 md:group-odd:text-right">
                     <p className="font-medium text-sm text-[#0A1F0A]">Draft Created</p>
                     <p className="text-xs text-[#8A9A8A] font-mono mt-1">{formatDateTime(challan.createdAt)}</p>
                  </div>
                </div>

                {challan.confirmedAt && (
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-[#16A34A] text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 md:group-odd:text-right">
                       <p className="font-medium text-sm text-[#059669]">Challan Confirmed</p>
                       <p className="text-xs text-[#8A9A8A] font-mono mt-1">{formatDateTime(challan.confirmedAt)}</p>
                       <p className="text-xs text-[#5A6B5A] mt-1">Stock deducted successfully.</p>
                    </div>
                  </div>
                )}

                {challan.cancelledAt && (
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-[#E11D48] text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 md:group-odd:text-right">
                       <p className="font-medium text-sm text-[#E11D48]">Challan Cancelled</p>
                       <p className="text-xs text-[#8A9A8A] font-mono mt-1">{formatDateTime(challan.cancelledAt)}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
            
            {/* Notes */}
            {challan.notes && (
              <div className="bg-[#FFFBEB] rounded-xl border border-[#FDE68A] shadow-sm p-6 print:hidden">
                <h3 className="text-sm font-bold text-[#D97706] uppercase tracking-widest mb-2">Notes</h3>
                <p className="text-sm text-[#92400E] whitespace-pre-wrap">{challan.notes}</p>
              </div>
            )}
            
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Challan"
        description="Confirming this challan will deduct stock from inventory permanently."
        confirmText="Confirm"
        confirmVariant="default"
        onConfirm={handleConfirm}
        isLoading={confirmMutation.isPending}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Challan"
        description="Are you sure you want to cancel this draft? It will be marked as cancelled."
        confirmText="Cancel Draft"
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
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider bg-[#FEF3C7] text-[#D97706]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
        Draft
      </span>
    );
  }
  if (status === 'CONFIRMED') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider bg-[#DCFCE7] text-[#15803D]">
        Confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider bg-[#F1F5F9] text-[#64748B] line-through opacity-70">
      Cancelled
    </span>
  );
}

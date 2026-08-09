import { History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useProductStockMovements } from '@/hooks/useProducts';
import { formatDate, cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface StockHistoryModalProps {
  productId: string | null;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StockHistoryModal({
  productId,
  productName,
  isOpen,
  onClose,
}: StockHistoryModalProps) {
  const { data: movements, isLoading } = useProductStockMovements(productId || '');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white rounded-2xl p-0 overflow-hidden border-0 shadow-xl [&>button]:right-5 [&>button]:top-5">
        <DialogHeader className="p-5 pb-3 border-b border-[#E2EFE2]">
          <DialogTitle className="text-lg font-semibold text-[#0A1F0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Stock History
          </DialogTitle>
          <p className="text-sm text-[#5A6B5A]">{productName}</p>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between">
                  <div className="h-4 bg-[#E8F0E8] rounded w-24" />
                  <div className="h-4 bg-[#E8F0E8] rounded w-16" />
                  <div className="h-4 bg-[#E8F0E8] rounded w-12" />
                  <div className="h-4 bg-[#E8F0E8] rounded w-32" />
                </div>
              ))}
            </div>
          ) : !movements || movements.length === 0 ? (
            <div className="py-8">
              <EmptyState 
                icon={<History className="w-8 h-8 text-[#8A9A8A]" />} 
                title="No movements yet" 
                description="Stock adjustments will appear here." 
              />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#E8F0E8] sticky top-0 z-10">
                <tr className="h-9 text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium text-left">
                  <th className="px-4 font-medium">Date</th>
                  <th className="px-4 font-medium">Type</th>
                  <th className="px-4 font-medium text-right">Qty</th>
                  <th className="px-4 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(m => (
                  <tr key={m.id} className="h-11 border-b border-[#E2EFE2] last:border-0 hover:bg-[#E8F0E8]/30 transition-colors">
                    <td className="px-4 font-mono text-xs text-[#8A9A8A] whitespace-nowrap">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-4">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border',
                        m.type === 'IN' 
                          ? 'bg-green-50 text-[#16A34A] border-green-200' 
                          : 'bg-amber-50 text-[#F59E0B] border-amber-200'
                      )}>
                        {m.type === 'IN' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {m.type === 'IN' ? 'IN' : 'OUT'}
                      </span>
                    </td>
                    <td className="px-4 font-mono text-sm text-right tabular-nums text-[#0A1F0A] font-medium">
                      {m.quantity}
                    </td>
                    <td className="px-4 text-sm text-[#5A6B5A] truncate max-w-[140px]" title={m.notes || m.referenceId || '—'}>
                      {m.notes || m.referenceId || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-3 border-t border-[#E2EFE2] bg-[#F9FBF9] text-center">
          <Link 
            to="/inventory" 
            className="text-[13px] text-[#5A6B5A] hover:text-[#0A1F0A] font-medium transition-colors"
            onClick={onClose}
          >
            View full inventory →
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

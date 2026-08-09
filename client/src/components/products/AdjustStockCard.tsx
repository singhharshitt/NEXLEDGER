import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStockAdjust } from '@/hooks/useStock';
import { toast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface AdjustStockCardProps {
  product: Product;
  canAdjustStock: boolean;
}

export function AdjustStockCard({ product, canAdjustStock }: AdjustStockCardProps) {
  const queryClient = useQueryClient();
  const stockAdjust = useStockAdjust();
  
  const [adjustmentType, setAdjustmentType] = useState<'IN' | 'OUT'>('IN');
  const [qty, setQty] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  if (!canAdjustStock) {
    return (
      <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-5 text-center">
        <div className="w-12 h-12 rounded-full bg-[#E8F0E8] flex items-center justify-center mx-auto mb-3">
          <Eye className="w-5 h-5 text-[#8A9A8A]" />
        </div>
        <p className="text-sm font-medium text-[#0A1F0A]">View-only access</p>
        <p className="text-xs text-[#5A6B5A] mt-1 px-4 leading-relaxed">
          You do not have permission to adjust inventory. Please contact the warehouse team.
        </p>
      </div>
    );
  }

  const resultingStock = adjustmentType === 'IN' 
    ? product.currentStock + qty 
    : product.currentStock - qty;

  const insufficientStock = adjustmentType === 'OUT' && qty > product.currentStock;

  const handleSubmit = async () => {
    if (!qty || qty <= 0 || !reason.trim() || insufficientStock) return;
    
    try {
      await stockAdjust.mutateAsync({
        productId: product.id,
        type: adjustmentType,
        quantity: qty,
        reason: reason.trim(),
      });
      
      queryClient.invalidateQueries({ queryKey: ['products', product.id] });
      queryClient.invalidateQueries({ queryKey: ['products', product.id, 'stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      
      toast({ 
        title: 'Stock adjusted', 
        description: `Successfully ${adjustmentType === 'IN' ? 'added' : 'removed'} ${qty} units.`, 
        type: 'success' 
      });
      
      setQty(0);
      setReason('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to adjust stock';
      toast({ title: 'Adjustment Failed', description: msg, type: 'error' });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-5">
      <h3 className="text-sm font-medium text-[#0A1F0A] mb-4">Adjust Stock</h3>
      
      {/* Type Toggle */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => setAdjustmentType('IN')}
          className={cn(
            "h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#A3E635]/40",
            adjustmentType === 'IN'
              ? "bg-[#F7FEE7] text-[#16A34A] border border-[#A3E635] ring-1 ring-[#A3E635]"
              : "bg-white text-[#5A6B5A] border border-[#E2EFE2] hover:bg-[#E8F0E8]"
          )}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Stock In
        </button>
        <button
          type="button"
          onClick={() => setAdjustmentType('OUT')}
          className={cn(
            "h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#F472B6]/40",
            adjustmentType === 'OUT'
              ? "bg-[#FDF2F8] text-[#F43F5E] border border-[#F472B6] ring-1 ring-[#F472B6]"
              : "bg-white text-[#5A6B5A] border border-[#E2EFE2] hover:bg-[#E8F0E8]"
          )}
        >
          <ArrowUpRight className="w-4 h-4" />
          Stock Out
        </button>
      </div>
      
      {/* Quantity */}
      <div className="mb-4">
        <label className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block mb-1.5">
          Quantity *
        </label>
        <Input
          type="number"
          min="1"
          value={qty || ''}
          onChange={(e) => setQty(Math.max(0, parseInt(e.target.value) || 0))}
          disabled={stockAdjust.isPending}
          className={cn(
            "h-10 rounded-lg font-mono",
            insufficientStock ? "border-[#F43F5E] bg-[#FFF1F2] focus-visible:ring-[#F43F5E]/40" : "border-[#E2EFE2] focus-visible:ring-[#A3E635]/40"
          )}
          placeholder="0"
        />
        {insufficientStock && (
          <p className="text-xs text-[#F43F5E] mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3 h-3" />
            Insufficient stock. Available: {product.currentStock}
          </p>
        )}
      </div>
      
      {/* Reason */}
      <div className="mb-4">
        <label className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block mb-1.5">
          Reason *
        </label>
        <Textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={stockAdjust.isPending}
          placeholder="e.g., Damaged goods, Received from supplier..."
          className="border-[#E2EFE2] rounded-lg resize-none text-sm focus-visible:ring-[#A3E635]/40"
        />
      </div>
      
      {/* Preview */}
      {qty > 0 && (
        <div className="bg-[#F9FBF9] rounded-lg p-3 mb-4 space-y-2 border border-[#E2EFE2]/50">
          <div className="flex justify-between text-xs">
            <span className="text-[#8A9A8A]">Current Stock</span>
            <span className="font-mono text-[#0A1F0A]">{product.currentStock}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#8A9A8A]">Requested Change</span>
            <span className={cn(
              "font-mono font-medium",
              adjustmentType === 'IN' ? "text-[#16A34A]" : "text-[#F43F5E]"
            )}>
              {adjustmentType === 'IN' ? '+' : '-'}{qty}
            </span>
          </div>
          <div className="h-px bg-[#E2EFE2]" />
          <div className="flex justify-between text-sm font-medium pt-1">
            <span className="text-[#0A1F0A]">Resulting Stock</span>
            <span className={cn(
              "font-mono",
              resultingStock < 0 ? "text-[#F43F5E]" : "text-[#0A1F0A]"
            )}>
              {resultingStock}
            </span>
          </div>
        </div>
      )}
      
      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!qty || qty <= 0 || !reason.trim() || insufficientStock || stockAdjust.isPending}
        className="w-full h-10 bg-[#142814] text-white rounded-lg text-sm font-medium hover:bg-[#1a2e1a] disabled:opacity-50 transition-colors"
      >
        {stockAdjust.isPending ? 'Processing...' : 'Confirm Adjustment'}
      </Button>
    </div>
  );
}

import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStockStatus, getStockProgress } from '@/utils/product.utils';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  canManageProducts: boolean;
  onView: (id: string) => void;
  onEdit: (product: Product) => void;
  onHistory: (id: string, name: string) => void;
}

export function ProductCard({
  product,
  canManageProducts,
  onView,
  onEdit,
  onHistory,
}: ProductCardProps) {
  const status = getStockStatus(product.currentStock, product.minStock);
  const progress = getStockProgress(product.currentStock, product.minStock);

  return (
    <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E8F0E8] flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-[#8A9A8A]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#0A1F0A] truncate">{product.name}</p>
            <p className="font-mono text-xs text-[#8A9A8A]">{product.sku}</p>
          </div>
        </div>
        <span className={cn(
          "text-[10px] font-medium px-1.5 py-0.5 rounded border whitespace-nowrap",
          status.bgTint, status.textColor, `border-${status.textColor.split('-')[1]}-200`
        )}>
          {status.label}
        </span>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[#8A9A8A] block mb-0.5">Price</span>
          <span className="font-mono text-[#0A1F0A]">
            {Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.unitPrice)}
          </span>
        </div>
        <div>
          <span className="text-[#8A9A8A] block mb-0.5">Stock</span>
          <span className={cn("font-mono font-medium", status.textColor)}>{product.currentStock}</span>
          <span className="font-mono text-[#8A9A8A]"> / {product.minStock} {product.unit}</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1.5 w-full rounded-full bg-[#E2EFE2] overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", status.barColor)} 
          style={{ width: `${progress}%` }} 
        />
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-[#E2EFE2]">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-10 text-xs border-[#E2EFE2]"
          onClick={() => onView(product.id)}
        >
          View
        </Button>
        {canManageProducts && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-10 text-xs border-[#E2EFE2]"
            onClick={() => onEdit(product)}
          >
            Edit
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-10 text-xs border-[#E2EFE2]"
          onClick={() => onHistory(product.id, product.name)}
        >
          History
        </Button>
      </div>
    </div>
  );
}

import { Eye, Pencil, History, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStockStatus, getStockProgress } from '@/utils/product.utils';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductTableProps {
  products: Product[];
  canManageProducts: boolean;
  onView: (id: string) => void;
  onEdit: (product: Product) => void;
  onHistory: (id: string, name: string) => void;
}

export function ProductTable({
  products,
  canManageProducts,
  onView,
  onEdit,
  onHistory,
}: ProductTableProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E2EFE2] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[1024px]">
          {/* Header */}
          <div className="h-10 bg-[#E8F0E8] px-4 grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1.2fr_100px] items-center gap-4 text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium">
            <div>Product</div>
            <div>SKU</div>
            <div>Category</div>
            <div className="text-right">Unit Price</div>
            <div className="text-right">Stock</div>
            <div className="text-right">Min Stock</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          
          {/* Body */}
          <div className="divide-y divide-[#E2EFE2]">
            {products.map((product) => {
              const status = getStockStatus(product.currentStock, product.minStock);
              const progress = getStockProgress(product.currentStock, product.minStock);
              
              return (
                <div 
                  key={product.id} 
                  className="h-16 px-4 grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1.2fr_100px] items-center gap-4 hover:bg-[#E8F0E8]/50 transition-colors duration-150"
                >
                  {/* Product */}
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded bg-[#E8F0E8] flex-shrink-0 flex items-center justify-center">
                      <Package className="w-4 h-4 text-[#8A9A8A]" />
                    </div>
                    <span className="text-sm font-medium text-[#0A1F0A] truncate" title={product.name}>
                      {product.name}
                    </span>
                  </div>
                  
                  {/* SKU */}
                  <div className="font-mono text-xs text-[#5A6B5A] truncate">
                    {product.sku}
                  </div>
                  
                  {/* Category */}
                  <div className="text-sm text-[#5A6B5A] truncate">
                    {product.category || '—'}
                  </div>
                  
                  {/* Unit Price */}
                  <div className="font-mono text-sm text-[#0A1F0A] text-right">
                    {Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.unitPrice)}
                  </div>
                  
                  {/* Stock */}
                  <div className="text-right flex items-center justify-end gap-1">
                    <span className={cn("font-mono text-sm tabular-nums", status.textColor)}>
                      {product.currentStock}
                    </span>
                    <span className="text-xs text-[#8A9A8A]">{product.unit}</span>
                  </div>
                  
                  {/* Min Stock */}
                  <div className="font-mono text-xs text-[#8A9A8A] text-right">
                    {product.minStock}
                  </div>
                  
                  {/* Status */}
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-16 rounded-full bg-[#E2EFE2] overflow-hidden flex-shrink-0">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", status.barColor)}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded border whitespace-nowrap",
                        status.bgTint, status.textColor, `border-${status.textColor.split('-')[1]}-200`
                      )}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      onClick={() => onView(product.id)}
                      title="View Product"
                      aria-label="View Product"
                    >
                      <Eye className="w-4 h-4 text-[#8A9A8A] hover:text-[#0A1F0A]" />
                    </Button>
                    {canManageProducts && (
                      <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        onClick={() => onEdit(product)}
                        title="Edit Product"
                        aria-label="Edit Product"
                      >
                        <Pencil className="w-4 h-4 text-[#8A9A8A] hover:text-[#0A1F0A]" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      onClick={() => onHistory(product.id, product.name)}
                      title="Stock History"
                      aria-label="Stock History"
                    >
                      <History className="w-4 h-4 text-[#8A9A8A] hover:text-[#0A1F0A]" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

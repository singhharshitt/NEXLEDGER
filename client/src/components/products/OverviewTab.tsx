import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getStockStatus, getStockProgress } from '@/utils/product.utils';
import { formatDateTime } from '@/lib/utils';
import type { Product } from '@/types';

interface OverviewTabProps {
  product: Product;
}

export function OverviewTab({ product }: OverviewTabProps) {
  const stockStatus = getStockStatus(product.currentStock, product.minStock);
  const progress = getStockProgress(product.currentStock, product.minStock);

  return (
    <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-6 space-y-6">
      {/* Stock Health */}
      <div>
        <h3 className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium mb-3">
          Stock Health
        </h3>
        <div className="flex items-center gap-4">
          <span className={cn("text-3xl font-bold font-mono tabular-nums", stockStatus.textColor)}>
            {product.currentStock}
          </span>
          <span className="text-sm text-[#8A9A8A]">/ {product.minStock} min</span>
          
          <span className={cn(
            "ml-auto text-[10px] font-medium px-2 py-0.5 rounded border whitespace-nowrap",
            stockStatus.bgTint, stockStatus.textColor, `border-${stockStatus.textColor.split('-')[1]}-200`
          )}>
            {stockStatus.label}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#E2EFE2] overflow-hidden mt-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn("h-full rounded-full", stockStatus.barColor)}
          />
        </div>
        <p className="text-xs text-[#8A9A8A] mt-2">
          {stockStatus.status === 'HEALTHY' && "Stock level is healthy"}
          {stockStatus.status === 'LOW' && "Stock is below minimum threshold"}
          {stockStatus.status === 'OUT' && "Product is out of stock"}
        </p>
      </div>
      
      {/* Description (if exists) */}
      {product.description && (
        <div className="pt-4 border-t border-[#E2EFE2]">
          <h3 className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium mb-2">
            Description
          </h3>
          <p className="text-sm text-[#5A6B5A] leading-relaxed">{product.description}</p>
        </div>
      )}
      
      {/* Timestamps */}
      <div className="pt-4 border-t border-[#E2EFE2] grid grid-cols-2 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block mb-1">
            Created
          </span>
          <span className="font-mono text-sm text-[#0A1F0A]">
            {formatDateTime(product.createdAt)}
          </span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block mb-1">
            Last Updated
          </span>
          <span className="font-mono text-sm text-[#0A1F0A]">
            {formatDateTime(product.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

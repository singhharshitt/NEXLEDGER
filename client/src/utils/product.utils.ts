// client/src/utils/product.utils.ts

export type ComputedStockStatus = 'HEALTHY' | 'LOW' | 'OUT';

interface StockStatusResult {
  status: ComputedStockStatus;
  label: string;
  dotColor: string;      // Tailwind class for the dot
  textColor: string;     // Tailwind class for text
  barColor: string;      // Tailwind class for progress fill
  bgTint: string;        // Tailwind class for badge bg
}

export const getStockStatus = (
  currentStock: number,
  minStock: number
): StockStatusResult => {
  if (currentStock <= 0) {
    return {
      status: 'OUT',
      label: 'Out of Stock',
      dotColor: 'bg-[#F43F5E]',
      textColor: 'text-[#F43F5E]',
      barColor: 'bg-[#F43F5E]',
      bgTint: 'bg-rose-50',
    };
  }
  if (currentStock <= minStock) {
    return {
      status: 'LOW',
      label: 'Low Stock',
      dotColor: 'bg-[#F59E0B]',
      textColor: 'text-[#F59E0B]',
      barColor: 'bg-[#F59E0B]',
      bgTint: 'bg-amber-50',
    };
  }
  return {
    status: 'HEALTHY',
    label: 'Healthy',
    dotColor: 'bg-[#16A34A]',
    textColor: 'text-[#16A34A]',
    barColor: 'bg-[#16A34A]',
    bgTint: 'bg-green-50',
  };
};

export const getStockProgress = (
  currentStock: number,
  minStock: number
): number => {
  if (currentStock <= 0) return 0;
  
  // Denominator ensures the bar never instantly fills for healthy stock
  // It creates a "buffer zone" above minStock
  const denominator = Math.max(currentStock * 1.5, minStock * 1.5, 1);
  const pct = (currentStock / denominator) * 100;
  
  return Math.min(Math.round(pct), 100);
};

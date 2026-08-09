import { useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StockMovement } from '@/types';

interface StockSummaryCardProps {
  movements: StockMovement[] | undefined;
  isLoading: boolean;
}

export function StockSummaryCard({ movements, isLoading }: StockSummaryCardProps) {
  const monthlyStats = useMemo(() => {
    if (!movements) return { totalIn: 0, totalOut: 0, netChange: 0 };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const stats = movements.reduce((acc, m) => {
      const d = new Date(m.createdAt);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (m.type === 'IN') acc.totalIn += m.quantity;
        else acc.totalOut += m.quantity;
      }
      return acc;
    }, { totalIn: 0, totalOut: 0, netChange: 0 });

    stats.netChange = stats.totalIn - stats.totalOut;
    return stats;
  }, [movements]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-5 mt-4 space-y-4 animate-pulse">
        <div className="h-5 bg-[#E8F0E8] rounded w-20" />
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-[#E8F0E8] rounded w-24" />
            <div className="h-4 bg-[#E8F0E8] rounded w-12" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-[#E8F0E8] rounded w-24" />
            <div className="h-4 bg-[#E8F0E8] rounded w-12" />
          </div>
          <div className="h-px bg-[#E2EFE2] my-2" />
          <div className="flex justify-between items-center">
            <div className="h-4 bg-[#E8F0E8] rounded w-24" />
            <div className="h-5 bg-[#E8F0E8] rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-5 mt-4">
      <h3 className="text-sm font-medium text-[#0A1F0A] mb-4">This Month</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#5A6B5A] flex items-center gap-2">
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#16A34A]" />
            Total IN
          </span>
          <span className="font-mono text-sm font-medium text-[#16A34A] tabular-nums">
            +{monthlyStats.totalIn}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#5A6B5A] flex items-center gap-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#F59E0B]" />
            Total OUT
          </span>
          <span className="font-mono text-sm font-medium text-[#F59E0B] tabular-nums">
            -{monthlyStats.totalOut}
          </span>
        </div>
        
        <div className="h-px bg-[#E2EFE2]" />
        
        <div className="flex justify-between items-center pt-1">
          <span className="text-xs font-medium text-[#0A1F0A]">Net Change</span>
          <span className={cn(
            "font-mono text-sm font-bold tabular-nums",
            monthlyStats.netChange > 0 ? "text-[#16A34A]" : monthlyStats.netChange < 0 ? "text-[#F43F5E]" : "text-[#5A6B5A]"
          )}>
            {monthlyStats.netChange > 0 ? '+' : ''}{monthlyStats.netChange}
          </span>
        </div>
      </div>
    </div>
  );
}

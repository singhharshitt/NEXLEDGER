import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { formatDate, formatTime, cn } from '@/lib/utils';
import { EmptyState } from '@/components/data-display/EmptyState';
import type { StockMovement } from '@/types';

interface MovementsTabProps {
  movements: StockMovement[];
}

function StockTypeBadge({ type }: { type: 'IN' | 'OUT' }) {
  if (type === 'IN') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
        <ArrowDownLeft className="h-3 w-3" /> IN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-orange-50 text-orange-700 border-orange-200">
      <ArrowUpRight className="h-3 w-3" /> OUT
    </span>
  );
}

export function MovementsTab({ movements }: MovementsTabProps) {
  if (!movements || movements.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-12">
        <EmptyState 
          icon={<History className="w-10 h-10 text-[#8A9A8A]" />} 
          title="No stock movements yet" 
          description="Inventory changes for this product will appear here." 
        />
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E2EFE2] shadow-sm overflow-hidden">
        <div className="bg-[#E8F0E8] h-10 px-4 grid grid-cols-[120px_80px_80px_1fr_1fr_140px] items-center text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium">
          <span>Date</span>
          <span>Type</span>
          <span className="text-right">Qty</span>
          <span>Reason</span>
          <span>Created By</span>
          <span className="text-right">Time</span>
        </div>
        
        {movements.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="h-12 px-4 grid grid-cols-[120px_80px_80px_1fr_1fr_140px] items-center border-b border-[#E2EFE2] last:border-0 hover:bg-[#E8F0E8]/50 transition-colors"
          >
            <span className="font-mono text-xs text-[#8A9A8A]">{formatDate(m.createdAt)}</span>
            <div><StockTypeBadge type={m.type} /></div>
            <span className={cn(
              "font-mono text-sm text-right tabular-nums font-medium",
              m.type === 'IN' ? "text-[#16A34A]" : "text-[#F59E0B]"
            )}>
              {m.type === 'IN' ? '+' : '-'}{m.quantity}
            </span>
            <span className="text-sm text-[#5A6B5A] truncate pr-4">
              {m.referenceId ? (
                <Link to={`/challans/${m.referenceId}`} className="text-[#142814] font-medium hover:text-[#1a2e1a] hover:underline transition-all">
                  {m.notes || 'Linked Challan'}
                </Link>
              ) : (
                m.notes || '—'
              )}
            </span>
            <span className="text-xs text-[#5A6B5A] truncate pr-4" title={m.createdByName || '—'}>
              {m.createdByName || '—'}
            </span>
            <span className="font-mono text-[11px] text-[#8A9A8A] text-right">
              {formatTime(m.createdAt)}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Mobile Movement Cards */}
      <div className="md:hidden space-y-3">
        {movements.map(m => (
          <div key={m.id} className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <StockTypeBadge type={m.type} />
              <span className="font-mono text-xs text-[#8A9A8A]">{formatDate(m.createdAt)}</span>
            </div>
            <p className={cn("text-sm font-medium", m.type === 'IN' ? "text-[#16A34A]" : "text-[#F59E0B]")}>
              {m.type === 'IN' ? '+' : '-'}{m.quantity} {m.type === 'IN' ? 'added' : 'removed'}
            </p>
            <p className="text-xs text-[#5A6B5A] mt-1 line-clamp-2">
              {m.referenceId ? (
                <Link to={`/challans/${m.referenceId}`} className="text-[#142814] font-medium hover:underline">
                  {m.notes || 'Linked Challan'}
                </Link>
              ) : (
                m.notes || 'No reason provided'
              )}
            </p>
            <div className="flex justify-between mt-3 pt-2 border-t border-[#E2EFE2]">
              <span className="text-[11px] text-[#8A9A8A] truncate max-w-[150px]">{m.createdByName || '—'}</span>
              <span className="font-mono text-[11px] text-[#8A9A8A]">{formatTime(m.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, History, ArrowDownLeft, ArrowUpRight, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGlobalInventoryMovements } from '@/hooks/useGlobalInventoryMovements';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

type MovementType = 'ALL' | 'IN' | 'OUT';

export default function InventoryPage() {
  const { movements, products, isLoading } = useGlobalInventoryMovements();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementType>('ALL');
  const debouncedSearch = useDebounce(search, 400);

  // Compute Today Stats
  const stats = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayMovements = movements.filter((m) => {
      const d = new Date(m.createdAt);
      return d >= todayStart && d <= todayEnd;
    });

    const totalStockValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);

    return {
      totalStockValue,
      totalMovements: todayMovements.length,
      stockIn: todayMovements.filter((m) => m.type === 'IN').reduce((s, m) => s + m.quantity, 0),
      stockOut: todayMovements.filter((m) => m.type === 'OUT').reduce((s, m) => s + m.quantity, 0),
    };
  }, [movements, products]);

  // Apply filters
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        return (
          m.productName.toLowerCase().includes(q) ||
          m.productSku.toLowerCase().includes(q) ||
          (m.notes && m.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [movements, typeFilter, debouncedSearch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4F0] p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#142814]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-[#F0F4F0] min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0A1F0A] tracking-tight font-space">
          Inventory
        </h1>
        <p className="text-[#5A6B5A] mt-1 text-sm">
          Track all stock movements across warehouses
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-[#E2EFE2] p-5 shadow-sm">
          <p className="text-xs text-[#5A6B5A] uppercase tracking-wider font-semibold mb-1">Total Stock Value</p>
          <p className="font-mono text-2xl font-bold text-[#0A1F0A]">{formatCurrency(stats.totalStockValue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E2EFE2] p-5 shadow-sm">
          <p className="text-xs text-[#5A6B5A] uppercase tracking-wider font-semibold mb-1">Movements Today</p>
          <p className="font-mono text-2xl font-bold text-[#0A1F0A]">{stats.totalMovements}</p>
        </div>
        <div className="bg-[#F7FEE7] rounded-xl border border-[#D9F99D] p-5 shadow-sm">
          <p className="text-xs text-[#65A30D] uppercase tracking-wider font-semibold mb-1">Stock IN Today</p>
          <p className="font-mono text-2xl font-bold text-[#16A34A]">{stats.stockIn}</p>
        </div>
        <div className="bg-[#FDF2F8] rounded-xl border border-[#FBCFE8] p-5 shadow-sm">
          <p className="text-xs text-[#E11D48] uppercase tracking-wider font-semibold mb-1">Stock OUT Today</p>
          <p className="font-mono text-2xl font-bold text-[#F43F5E]">{stats.stockOut}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-[#8A9A8A]" />
          <Input 
            placeholder="Search products or SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-[#8A9A8A] hover:text-[#0A1F0A]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {['ALL', 'IN', 'OUT'].map((type) => (
            <Button
              key={type}
              onClick={() => setTypeFilter(type as MovementType)}
              variant="outline"
              className={`h-10 px-4 rounded-lg text-sm border-[#E2EFE2] ${typeFilter === type ? 'bg-[#142814] text-white' : 'bg-white hover:bg-[#E8F0E8]'}`}
            >
              {type === 'ALL' ? 'All Movements' : type}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm overflow-hidden">
        {filteredMovements.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#F0F4F0] rounded-full flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-[#8A9A8A]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0A1F0A] mb-2 font-space">
              No stock movements found
            </h3>
            <p className="text-sm text-[#5A6B5A] max-w-sm">
              {(search || typeFilter !== 'ALL') ? 'No movements match your filters.' : 'Stock changes will appear here when inventory is updated.'}
            </p>
            {(search || typeFilter !== 'ALL') && (
              <Button 
                variant="outline" 
                onClick={() => { setSearch(''); setTypeFilter('ALL'); }}
                className="mt-6 border-[#E2EFE2]"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#E8F0E8]">
                <tr className="h-10 text-left text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium">
                  <th className="px-4 whitespace-nowrap">Date</th>
                  <th className="px-4">Product</th>
                  <th className="px-4">SKU</th>
                  <th className="px-4">Type</th>
                  <th className="px-4 text-right">Qty</th>
                  <th className="px-4">Reason</th>
                  <th className="px-4">By</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="h-12 border-b border-[#E2EFE2] last:border-0 hover:bg-[#E8F0E8]/50">
                    <td className="px-4 font-mono text-xs text-[#8A9A8A] whitespace-nowrap">
                      {formatDateTime(m.createdAt)}
                    </td>
                    <td className="px-4">
                      <Link to={`/products/${m.productId}`} className="text-sm font-medium text-[#0A1F0A] hover:underline">
                        {m.productName}
                      </Link>
                    </td>
                    <td className="px-4 font-mono text-xs text-[#5A6B5A]">
                      {m.productSku}
                    </td>
                    <td className="px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${m.type === 'IN' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FFF7ED] text-[#EA580C]'}`}>
                        {m.type === 'IN' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {m.type}
                      </span>
                    </td>
                    <td className={`px-4 text-right font-mono text-sm font-medium ${m.type === 'IN' ? 'text-[#059669]' : 'text-[#EA580C]'}`}>
                      {m.type === 'IN' ? '+' : '-'}{m.quantity}
                    </td>
                    <td className="px-4 text-sm text-[#5A6B5A] truncate max-w-[200px]">
                      {m.notes || '-'}
                    </td>
                    <td className="px-4 text-sm text-[#0A1F0A]">
                      {m.createdByName || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

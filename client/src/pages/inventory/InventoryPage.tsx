import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { EmptyState } from '@/components/data-display/EmptyState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useInventory, useStockMovements } from '@/hooks/useStock';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, cn } from '@/lib/utils';
import type { Product, StockMovement, StockStatus } from '@/types';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function InventoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockStatus | 'all'>('all');
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, refetch } = useInventory({
    search: debouncedSearch,
    stockStatus: stockFilter === 'all' ? undefined : stockFilter,
  });
  const { data: movements, isLoading: loadingMovements } = useStockMovements();

  const products = data?.data || [];

  if (isError) return <ErrorState title="Unable to load inventory" onRetry={() => refetch()} />;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <PageHeader title="Inventory" description="Monitor stock levels and movement history." />

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Current Stock</TabsTrigger>
          <TabsTrigger value="movements">Movement History</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card className="p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
                <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X className="h-4 w-4" /></button>}
              </div>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockStatus | 'all')}
                className="h-10 px-3 border border-border-default rounded-[var(--radius-md)] bg-bg-white text-sm text-text-primary"
              >
                <option value="all">All Status</option>
                <option value="healthy">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </Card>

          {isLoading ? (
            <Card className="p-4"><div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div></Card>
          ) : !products.length ? (
            <EmptyState title="No inventory items found" description="Products will appear here once added." />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle bg-bg-elevated/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">SKU</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Warehouse</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Current</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Min</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p: Product) => (
                      <tr key={p.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-text-primary">{p.name}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm font-mono text-text-secondary">{p.sku}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-text-secondary">{p.warehouse}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn('text-sm font-mono tabular-nums font-semibold', p.status === 'out' ? 'text-danger' : p.status === 'low' ? 'text-warning' : 'text-text-primary')}>
                            {p.currentStock}
                          </span>
                          <span className="text-xs text-text-muted ml-1">{p.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-right hidden sm:table-cell">
                          <span className="text-sm font-mono tabular-nums text-text-muted">{p.minStock}</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${p.id}`)}>View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader><CardTitle>Recent Stock Movements</CardTitle></CardHeader>
            <CardContent>
              {loadingMovements ? (
                <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : !movements?.length ? (
                <EmptyState title="No stock movements" description="Stock adjustments will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Type</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Qty</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Reason</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((m: StockMovement) => (
                        <tr key={m.id} className="border-b border-border-subtle last:border-0">
                          <td className="px-3 py-2.5"><span className="text-sm font-mono text-text-primary tabular-nums">{formatDate(m.createdAt)}</span></td>
                          <td className="px-3 py-2.5">
                            <button onClick={() => navigate(`/products/${m.productId}`)} className="text-sm text-text-primary hover:underline">{m.productName}</button>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={cn('inline-flex items-center gap-1 text-sm font-medium', m.type === 'IN' ? 'text-success' : 'text-warning')}>
                              {m.type === 'IN' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                              {m.type === 'IN' ? 'IN' : 'OUT'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right"><span className="text-sm font-mono tabular-nums font-medium">{m.quantity}</span></td>
                          <td className="px-3 py-2.5 hidden sm:table-cell"><span className="text-sm text-text-secondary">{m.notes || '—'}</span></td>
                          <td className="px-3 py-2.5 hidden md:table-cell"><span className="text-sm text-text-muted">{m.createdByName}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

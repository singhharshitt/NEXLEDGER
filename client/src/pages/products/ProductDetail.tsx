import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Warehouse as WarehouseIcon, Tag, Hash, ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';
import { useProduct, useProductStockMovements } from '@/hooks/useProducts';
import { useStockAdjust } from '@/hooks/useStock';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { EmptyState } from '@/components/data-display/EmptyState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import type { StockMovement } from '@/types';

const stockAdjustSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  quantity: z.number().int().positive('Quantity must be positive'),
  reason: z.string().min(1, 'Reason is required'),
});

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, refetch } = useProduct(id!);
  const { data: movements, isLoading: loadingMovements } = useProductStockMovements(id!);
  const stockAdjust = useStockAdjust();
  const [showAdjust, setShowAdjust] = useState(false);

  const form = useForm<z.infer<typeof stockAdjustSchema>>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: { type: 'IN' },
  });
  const selectedType = useWatch({ control: form.control, name: 'type' });

  const handleAdjust = async (data: z.infer<typeof stockAdjustSchema>) => {
    try {
      await stockAdjust.mutateAsync({ productId: id!, ...data });
      setShowAdjust(false);
      form.reset();
      toast({ title: 'Stock adjusted', description: `${data.type === 'IN' ? 'Added' : 'Removed'} ${data.quantity} units.`, type: 'success' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast({ title: 'Error', description: axiosErr?.response?.data?.message || 'Failed to adjust stock.', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><Skeleton className="h-48" /></div>
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (isError || !product) return <ErrorState title="Unable to load product" onRetry={() => refetch()} />;

  const stockPercent = product.minStock > 0 ? Math.min(100, (product.currentStock / (product.minStock * 3)) * 100) : 100;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/products')} aria-label="Back to products">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h2 text-text-primary">{product.name}</h1>
            <StatusBadge status={product.status} />
          </div>
          <p className="text-sm font-mono text-text-muted mt-1">{product.sku}</p>
        </div>
        <Button onClick={() => setShowAdjust(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Adjust Stock
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {[
                      { icon: Tag, label: 'Category', value: product.category },
                      { icon: Package, label: 'Unit', value: product.unit },
                      { icon: WarehouseIcon, label: 'Warehouse', value: product.warehouse },
                      { icon: Hash, label: 'SKU', value: product.sku, mono: true },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                          <span className="text-xs text-text-muted uppercase tracking-wider">{item.label}</span>
                        </div>
                        <p className={cn('text-sm text-text-primary font-medium', item.mono && 'font-mono')}>{item.value}</p>
                      </div>
                    ))}
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Unit Price</p>
                      <p className="text-sm font-mono tabular-nums text-text-primary font-semibold">{formatCurrency(product.unitPrice)}</p>
                    </div>
                  </div>
                  {product.description && (
                    <div className="mt-6 pt-4 border-t border-border-subtle">
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Description</p>
                      <p className="text-sm text-text-secondary">{product.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader><CardTitle>Stock Level</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-3xl font-mono font-bold tabular-nums text-text-primary">{product.currentStock}</p>
                    <p className="text-sm text-text-muted">{product.unit}</p>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-bg-elevated rounded-full overflow-hidden mb-3">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        product.status === 'healthy' ? 'bg-success' : product.status === 'low' ? 'bg-warning' : 'bg-danger'
                      )}
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Min: {product.minStock}</span>
                    <span>Current: {product.currentStock}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border-subtle space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Created</span>
                      <span className="font-mono text-text-primary">{formatDate(product.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Updated</span>
                      <span className="font-mono text-text-primary">{formatDate(product.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Stock Movements</CardTitle>
              <Button size="sm" onClick={() => setShowAdjust(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add Stock
              </Button>
            </CardHeader>
            <CardContent>
              {loadingMovements ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : !movements?.length ? (
                <EmptyState title="No stock movements" description="Stock adjustments will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Type</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Qty</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Reason</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((m: StockMovement) => (
                        <tr key={m.id} className="border-b border-border-subtle last:border-0">
                          <td className="px-3 py-2.5">
                            <span className="text-sm font-mono text-text-primary tabular-nums">{formatDate(m.createdAt)}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={cn('inline-flex items-center gap-1 text-sm font-medium', m.type === 'IN' ? 'text-success' : 'text-warning')}>
                              {m.type === 'IN' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                              {m.type === 'IN' ? 'IN' : 'OUT'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="text-sm font-mono tabular-nums font-medium text-text-primary">{m.quantity}</span>
                          </td>
                          <td className="px-3 py-2.5 hidden sm:table-cell">
                            <span className="text-sm text-text-secondary">{m.notes || '—'}</span>
                          </td>
                          <td className="px-3 py-2.5 hidden md:table-cell">
                            <span className="text-sm text-text-muted">{m.createdByName}</span>
                          </td>
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

      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjust} onOpenChange={setShowAdjust}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {product.name} — Current stock: <span className="font-mono font-semibold">{product.currentStock} {product.unit}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleAdjust)} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <div className="flex gap-2">
                {(['IN', 'OUT'] as const).map((t) => (
                  <label key={t} className={cn(
                    'flex-1 flex items-center justify-center gap-2 p-3 rounded-[var(--radius-md)] border cursor-pointer transition-colors',
                    selectedType === t
                      ? t === 'IN' ? 'border-success bg-success-bg text-success' : 'border-warning bg-warning-bg text-amber-700'
                      : 'border-border-default hover:bg-bg-elevated text-text-secondary'
                  )}>
                    <input type="radio" value={t} {...form.register('type')} className="sr-only" />
                    {t === 'IN' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    <span className="text-sm font-medium">Stock {t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sa-qty">Quantity *</Label>
              <Input id="sa-qty" type="number" {...form.register('quantity', { valueAsNumber: true })} className="font-mono" placeholder="0" />
              {form.formState.errors.quantity && <p className="text-xs text-danger">{form.formState.errors.quantity.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sa-reason">Reason *</Label>
              <Textarea id="sa-reason" {...form.register('reason')} placeholder="e.g., Purchase order received" />
              {form.formState.errors.reason && <p className="text-xs text-danger">{form.formState.errors.reason.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdjust(false)}>Cancel</Button>
              <Button type="submit" disabled={stockAdjust.isPending}>{stockAdjust.isPending ? 'Adjusting...' : 'Adjust Stock'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

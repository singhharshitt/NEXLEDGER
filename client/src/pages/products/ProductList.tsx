import { motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, Eye, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { EmptyState } from '@/components/data-display/EmptyState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProducts, useCreateProduct, useProductCategories } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Product, StockStatus } from '@/types';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  unitPrice: z.number().positive('Price must be positive'),
  minStock: z.number().int().nonnegative('Min stock must be 0 or more'),
  unit: z.string().min(1, 'Unit is required'),
  warehouse: z.string().min(1, 'Warehouse is required'),
});

type ProductFormData = z.infer<typeof productSchema>;

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function ProductList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockStatus | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { data, isLoading, isError, refetch } = useProducts({
    search: debouncedSearch,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    stockStatus: stockFilter,
  });
  const { data: categories } = useProductCategories();
  const createProduct = useCreateProduct();

  const products = data?.data || [];

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { unit: 'Piece', warehouse: 'Warehouse A' },
  });

  const handleCreate = async (formData: ProductFormData) => {
    try {
      await createProduct.mutateAsync(formData);
      setShowCreateDialog(false);
      form.reset();
      toast({ title: 'Product created', description: `${formData.name} has been added.`, type: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create product.', type: 'error' });
    }
  };

  if (isError) return <ErrorState title="Unable to load products" onRetry={() => refetch()} />;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <PageHeader
        title="Products"
        description="Manage your product catalog and inventory."
        action={<Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4" aria-hidden="true" /> Add Product</Button>}
      />

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
            <Input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X className="h-4 w-4" /></button>}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 border border-border-default rounded-[var(--radius-md)] bg-bg-white text-sm text-text-primary"
          >
            <option value="all">All Categories</option>
            {categories?.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockStatus | 'all')}
            className="h-10 px-3 border border-border-default rounded-[var(--radius-md)] bg-bg-white text-sm text-text-primary"
          >
            <option value="all">All Stock</option>
            <option value="healthy">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card className="p-4"><div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div></Card>
      ) : !products.length ? (
        <EmptyState
          title="No products found"
          description={search || categoryFilter !== 'all' || stockFilter !== 'all'
            ? 'Try adjusting your search or filters.'
            : 'Add your first product to start managing inventory.'}
          action={!search && categoryFilter === 'all' && stockFilter === 'all' ? { label: 'Add Product', onClick: () => setShowCreateDialog(true) } : undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">SKU</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: Product) => (
                  <tr key={p.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary">{p.name}</p>
                      <p className="text-xs font-mono text-text-muted md:hidden">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm font-mono text-text-secondary">{p.sku}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-text-secondary">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono tabular-nums text-text-primary">{formatCurrency(p.unitPrice)}</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="text-sm font-mono tabular-nums text-text-primary">{p.currentStock}</span>
                      <span className="text-xs text-text-muted ml-1">{p.unit}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/products/${p.id}`)} aria-label="View product"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/products/${p.id}`)} aria-label="Edit product"><Pencil className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Product Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Add a new product to the catalog.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Product Name *</Label>
                <Input id="p-name" {...form.register('name')} placeholder="Product name" />
                {form.formState.errors.name && <p className="text-xs text-danger">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-sku">SKU *</Label>
                <Input id="p-sku" {...form.register('sku')} placeholder="CHEM-SOL-001" className="font-mono" />
                {form.formState.errors.sku && <p className="text-xs text-danger">{form.formState.errors.sku.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-category">Category *</Label>
                <Input id="p-category" {...form.register('category')} placeholder="e.g., Chemicals" />
                {form.formState.errors.category && <p className="text-xs text-danger">{form.formState.errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-price">Unit Price (₹) *</Label>
                <Input id="p-price" type="number" step="0.01" {...form.register('unitPrice', { valueAsNumber: true })} className="font-mono" />
                {form.formState.errors.unitPrice && <p className="text-xs text-danger">{form.formState.errors.unitPrice.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-minstock">Minimum Stock *</Label>
                <Input id="p-minstock" type="number" {...form.register('minStock', { valueAsNumber: true })} className="font-mono" />
                {form.formState.errors.minStock && <p className="text-xs text-danger">{form.formState.errors.minStock.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-unit">Unit *</Label>
                <select id="p-unit" {...form.register('unit')} className="h-10 w-full px-3 border border-border-default rounded-[var(--radius-md)] bg-bg-white text-sm">
                  <option value="Piece">Piece</option>
                  <option value="Kg">Kg</option>
                  <option value="Litre">Litre</option>
                  <option value="Box">Box</option>
                  <option value="Metre">Metre</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="p-warehouse">Warehouse *</Label>
                <select id="p-warehouse" {...form.register('warehouse')} className="h-10 w-full px-3 border border-border-default rounded-[var(--radius-md)] bg-bg-white text-sm">
                  <option value="Warehouse A">Warehouse A</option>
                  <option value="Warehouse B">Warehouse B</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea id="p-desc" {...form.register('description')} placeholder="Optional description..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={createProduct.isPending}>{createProduct.isPending ? 'Creating...' : 'Create Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

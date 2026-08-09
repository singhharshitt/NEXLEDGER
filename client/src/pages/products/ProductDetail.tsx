import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Pencil } from 'lucide-react';

import { useProduct, useProductStockMovements, useUpdateProduct } from '@/hooks/useProducts';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/hooks/useToast';
import { formatCurrency, cn } from '@/lib/utils';
import { getStockStatus } from '@/utils/product.utils';

import { ErrorState } from '@/components/data-display/ErrorState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { OverviewTab } from '@/components/products/OverviewTab';
import { MovementsTab } from '@/components/products/MovementsTab';
import { AdjustStockCard } from '@/components/products/AdjustStockCard';
import { StockSummaryCard } from '@/components/products/StockSummaryCard';
import { ProductDrawer, type ProductFormValues } from '@/components/products/ProductDrawer';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

function MetadataField({ label, value, mono = false, highlight = false }: { label: string, value: string, mono?: boolean, highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block">
        {label}
      </span>
      <span className={cn(
        "text-sm",
        mono ? "font-mono" : "",
        highlight ? "text-[#F43F5E] font-medium" : "text-[#0A1F0A]"
      )}>
        {value}
      </span>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  
  const { data: product, isLoading, isError, refetch } = useProduct(id!);
  const { data: movements, isLoading: loadingMovements } = useProductStockMovements(id!);
  const updateProduct = useUpdateProduct();
  
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const canManageProducts = user?.role === 'ADMIN';
  const canAdjustStock = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const handleEditSubmit = async (formData: ProductFormValues) => {
    try {
      await updateProduct.mutateAsync({ id: id!, input: formData });
      toast({ title: 'Product updated', description: `${formData.name} has been updated.`, type: 'success' });
      setEditDrawerOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to update product details.', type: 'error' });
    }
  };

  if (isError) {
    return (
      <div className="p-6 lg:p-8 bg-[#F0F4F0] min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          <ErrorState title="Unable to load product" message="Something went wrong while loading product information." onRetry={() => refetch()} />
        </div>
      </div>
    );
  }

  if (!product && !isLoading) {
    return (
      <div className="p-6 lg:p-8 bg-[#F0F4F0] min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-12 text-center">
            <h2 className="text-xl font-semibold text-[#0A1F0A] mb-2">Product not found</h2>
            <p className="text-[#5A6B5A] mb-6">The product you're looking for doesn't exist or is no longer available.</p>
            <Link to="/products">
              <Button className="bg-[#142814] text-white hover:bg-[#1a2e1a]">Back to Products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-6 lg:p-8 bg-[#F0F4F0] min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link to="/products" className="text-[#8A9A8A] hover:text-[#0A1F0A] transition-colors font-medium">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#D4E4D4]" />
          <span className="text-[#0A1F0A] font-medium truncate max-w-[300px]">
            {isLoading ? <Skeleton className="h-4 w-32 inline-block bg-[#D4E4D4]" /> : product?.name}
          </span>
        </nav>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-[#E2EFE2] p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <div className="h-7 bg-[#E8F0E8] rounded w-48" />
                      <div className="h-3 bg-[#E8F0E8] rounded w-24" />
                    </div>
                    <div className="h-9 bg-[#E8F0E8] rounded w-20" />
                  </div>
                  <div className="h-px bg-[#E2EFE2]" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array(6).fill(null).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 bg-[#E8F0E8] rounded w-16" />
                        <div className="h-4 bg-[#E8F0E8] rounded w-full" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-10 bg-[#E8F0E8] rounded-lg w-48" />
                <div className="bg-white rounded-xl border border-[#E2EFE2] p-6 space-y-3">
                  {Array(5).fill(null).map((_, i) => <div key={i} className="h-12 bg-[#E8F0E8] rounded w-full" />)}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-[#E2EFE2] p-5 space-y-3">
                  <div className="h-5 bg-[#E8F0E8] rounded w-24" />
                  <div className="h-10 bg-[#E8F0E8] rounded w-full" />
                  <div className="h-10 bg-[#E8F0E8] rounded w-full" />
                  <div className="h-20 bg-[#E8F0E8] rounded w-full" />
                  <div className="h-10 bg-[#E8F0E8] rounded w-full" />
                </div>
                <div className="bg-white rounded-xl border border-[#E2EFE2] p-5 space-y-3">
                  <div className="h-5 bg-[#E8F0E8] rounded w-20" />
                  <div className="h-4 bg-[#E8F0E8] rounded w-full" />
                  <div className="h-4 bg-[#E8F0E8] rounded w-full" />
                  <div className="h-4 bg-[#E8F0E8] rounded w-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          product && (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
              
              {/* Left Column */}
              <div className="space-y-6">
                
                {/* Product Snapshot Card */}
                <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h1 className="text-2xl font-semibold text-[#0A1F0A] tracking-tight truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          {product.name}
                        </h1>
                        <p className="font-mono text-xs text-[#8A9A8A] mt-1">{product.sku}</p>
                      </div>
                      {canManageProducts && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditDrawerOpen(true)}
                          className="h-9 px-3 border-[#E2EFE2] rounded-lg text-sm hover:bg-[#E8F0E8] flex-shrink-0"
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-px bg-[#E2EFE2]" />
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                      <MetadataField label="SKU" value={product.sku} mono />
                      <MetadataField label="Category" value={product.category || '—'} />
                      <MetadataField label="Unit Price" value={formatCurrency(product.unitPrice)} mono />
                      <MetadataField 
                        label="Current Stock" 
                        value={`${product.currentStock} ${product.unit}`} 
                        mono 
                        highlight={getStockStatus(product.currentStock, product.minStock).status !== 'HEALTHY'}
                      />
                      <MetadataField label="Min Stock" value={product.minStock.toString()} mono />
                      <MetadataField label="Warehouse" value={product.warehouse || '—'} />
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview">
                  <TabsList className="bg-[#E8F0E8] rounded-lg p-1 h-10">
                    <TabsTrigger 
                      value="overview" 
                      className="rounded-md px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#0A1F0A] text-[#5A6B5A]"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="movements" 
                      className="rounded-md px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#0A1F0A] text-[#5A6B5A]"
                    >
                      Stock Movements
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4 outline-none">
                    <OverviewTab product={product} />
                  </TabsContent>
                  
                  <TabsContent value="movements" className="mt-4 outline-none">
                    {loadingMovements ? (
                      <div className="bg-white rounded-xl border border-[#E2EFE2] p-6 space-y-3 animate-pulse">
                        {Array(5).fill(null).map((_, i) => <div key={i} className="h-12 bg-[#E8F0E8] rounded w-full" />)}
                      </div>
                    ) : (
                      <MovementsTab movements={movements || []} />
                    )}
                  </TabsContent>
                </Tabs>

              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <AdjustStockCard product={product} canAdjustStock={canAdjustStock} />
                <StockSummaryCard movements={movements} isLoading={loadingMovements} />
              </div>

            </div>
          )
        )}
      </div>

      {/* Edit Drawer */}
      {canManageProducts && product && (
        <ProductDrawer
          isOpen={editDrawerOpen}
          onClose={() => setEditDrawerOpen(false)}
          product={product}
          onSubmit={handleEditSubmit}
          isSubmitting={updateProduct.isPending}
        />
      )}
    </motion.div>
  );
}

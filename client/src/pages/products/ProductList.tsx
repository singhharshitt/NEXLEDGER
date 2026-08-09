import { useState, useCallback } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Package, SearchX } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/data-display/EmptyState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Button } from '@/components/ui/button';

import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductDrawer, type ProductFormValues } from '@/components/products/ProductDrawer';
import { StockHistoryModal } from '@/components/products/StockHistoryModal';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';

import { 
  useProducts, 
  useProductCategories, 
  useCreateProduct, 
  useUpdateProduct 
} from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/auth.store';

import type { Product, StockStatus } from '@/types';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function ProductList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL Params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const stockStatus = searchParams.get('stockStatus') || '';

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync debounced search to URL
  useCallback(() => {
    setSearchParams(prev => {
      if (debouncedSearch) prev.set('search', debouncedSearch);
      else prev.delete('search');
      if (debouncedSearch !== search) {
        prev.set('page', '1');
      }
      return prev;
    });
  }, [debouncedSearch, search, setSearchParams])();

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<{ id: string, name: string } | null>(null);

  // Queries & Mutations
  const { data, isLoading, isError, refetch } = useProducts({
    search: debouncedSearch,
    category: category || undefined,
    stockStatus: (stockStatus.toLowerCase() as StockStatus) || undefined,
    page,
    limit: 10,
  });
  
  const { data: categoriesData } = useProductCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  // Derived state
  const products = data?.data || [];
  const categories = categoriesData || [];
  const totalItems = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  
  const canManageProducts = user?.role === 'ADMIN';

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      prev.set('page', '1');
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(prev => {
      prev.delete('search');
      prev.delete('category');
      prev.delete('stockStatus');
      prev.set('page', '1');
      return prev;
    });
  };

  const setPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    });
  };

  const handleCreateOrUpdate = async (formData: ProductFormValues) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, input: formData });
        toast({ title: 'Product updated', description: `${formData.name} has been updated successfully.`, type: 'success' });
      } else {
        await createProduct.mutateAsync(formData);
        toast({ title: 'Product created', description: `${formData.name} has been added successfully.`, type: 'success' });
      }
      setIsDrawerOpen(false);
    } catch {
      toast({ title: 'Error', description: `Failed to ${editingProduct ? 'update' : 'create'} product.`, type: 'error' });
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const openHistory = (id: string, name: string) => {
    setHistoryProduct({ id, name });
    setIsHistoryOpen(true);
  };

  // Add Product Button
  const ActionButton = canManageProducts ? (
    <Button 
      onClick={openCreate}
      className="bg-[#142814] text-white h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#1a2e1a] transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Product
    </Button>
  ) : undefined;

  return (
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="animate"
      className="p-6 lg:p-8 bg-[#F0F4F0] min-h-screen"
    >
      <div className="max-w-[1400px] mx-auto">
        <PageHeader
          title="Products"
          description="Manage your inventory catalog."
          action={ActionButton}
        />

        <div className="mt-6 space-y-4">
          <ProductFilters 
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            category={category}
            stockStatus={stockStatus}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            categories={categories}
          />

          {isLoading ? (
            <ProductSkeleton />
          ) : isError ? (
            <ErrorState title="Unable to load products" onRetry={() => refetch()} />
          ) : products.length === 0 ? (
            (debouncedSearch || category || stockStatus) ? (
              <EmptyState 
                icon={<SearchX className="w-12 h-12 text-[#8A9A8A]" />}
                title="No matching products"
                description="Try adjusting your search or filters."
                action={{ label: 'Clear filters', onClick: clearFilters }}
              />
            ) : (
              <EmptyState 
                icon={<Package className="w-12 h-12 text-[#8A9A8A]" />}
                title="No products yet"
                description="Add your first product to start tracking inventory."
                action={canManageProducts ? { label: 'Add Product', onClick: openCreate } : undefined}
              />
            )
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block">
                <ProductTable 
                  products={products}
                  canManageProducts={canManageProducts}
                  onView={(id) => navigate(`/products/${id}`)}
                  onEdit={openEdit}
                  onHistory={openHistory}
                />
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-3">
                {products.map(p => (
                  <ProductCard 
                    key={p.id}
                    product={p}
                    canManageProducts={canManageProducts}
                    onView={(id) => navigate(`/products/${id}`)}
                    onEdit={openEdit}
                    onHistory={openHistory}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E2EFE2]">
                  <p className="text-sm text-[#5A6B5A]">
                    Showing <span className="font-medium text-[#0A1F0A]">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-[#0A1F0A]">{Math.min(page * 10, totalItems)}</span> of <span className="font-medium text-[#0A1F0A]">{totalItems}</span> products
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="border-[#E2EFE2] text-[#0A1F0A] hover:bg-[#E8F0E8]"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="border-[#E2EFE2] text-[#0A1F0A] hover:bg-[#E8F0E8]"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ProductDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        product={editingProduct}
        onSubmit={handleCreateOrUpdate}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
      />
      
      {isHistoryOpen && historyProduct && (
        <StockHistoryModal 
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          productId={historyProduct.id}
          productName={historyProduct.name}
        />
      )}
    </motion.div>
  );
}

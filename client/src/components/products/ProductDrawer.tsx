import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  unitPrice: z.number().nonnegative('Price cannot be negative'),
  minStock: z.number().int().nonnegative('Min stock cannot be negative'),
  unit: z.string().min(1, 'Unit is required'),
  warehouse: z.string().min(1, 'Warehouse is required'),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSubmit: (data: ProductFormValues) => void;
  isSubmitting: boolean;
}

export function ProductDrawer({
  isOpen,
  onClose,
  product,
  onSubmit,
  isSubmitting,
}: ProductDrawerProps) {
  const isEdit = !!product;
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      description: '',
      unitPrice: 0,
      minStock: 0,
      unit: 'Piece',
      warehouse: 'Warehouse A',
    },
  });

  useEffect(() => {
    if (isOpen && product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        category: product.category || '',
        description: product.description || '',
        unitPrice: product.unitPrice,
        minStock: product.minStock,
        unit: product.unit || 'Piece',
        warehouse: product.warehouse || 'Warehouse A',
      });
    } else if (isOpen && !product) {
      form.reset({
        name: '',
        sku: '',
        category: '',
        description: '',
        unitPrice: 0,
        minStock: 0,
        unit: 'Piece',
        warehouse: 'Warehouse A',
      });
    }
  }, [isOpen, product, form]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl p-0 overflow-hidden border-0 shadow-xl [&>button]:right-6 [&>button]:top-6">
        <DialogHeader className="p-6 pb-4 border-b border-[#E2EFE2]">
          <DialogTitle className="text-lg font-semibold text-[#0A1F0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {isEdit ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
          <p className="text-sm text-[#5A6B5A]">
            {isEdit ? 'Update existing product details.' : 'Add a new product to the catalog.'}
          </p>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[80vh]">
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name" className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block">
                  Product Name *
                </Label>
                <Input 
                  id="name" 
                  {...form.register('name')} 
                  placeholder="e.g. Wireless Keyboard"
                  className="h-10 border-[#E2EFE2] rounded-lg focus-visible:ring-2 focus-visible:ring-[#A3E635]/40"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-[#F43F5E]">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block">
                  SKU *
                </Label>
                <Input 
                  id="sku" 
                  {...form.register('sku')} 
                  placeholder="KEY-001"
                  className="h-10 border-[#E2EFE2] rounded-lg focus-visible:ring-2 focus-visible:ring-[#A3E635]/40 font-mono"
                />
                {form.formState.errors.sku && (
                  <p className="text-xs text-[#F43F5E]">{form.formState.errors.sku.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block">
                  Category *
                </Label>
                <Input 
                  id="category" 
                  {...form.register('category')} 
                  placeholder="e.g. Electronics"
                  className="h-10 border-[#E2EFE2] rounded-lg focus-visible:ring-2 focus-visible:ring-[#A3E635]/40"
                />
                {form.formState.errors.category && (
                  <p className="text-xs text-[#F43F5E]">{form.formState.errors.category.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="unitPrice" className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block">
                  Unit Price (₹) *
                </Label>
                <Input 
                  id="unitPrice" 
                  type="number" 
                  step="0.01"
                  {...form.register('unitPrice', { valueAsNumber: true })} 
                  className="h-10 border-[#E2EFE2] rounded-lg focus-visible:ring-2 focus-visible:ring-[#A3E635]/40 font-mono text-right"
                />
                {form.formState.errors.unitPrice && (
                  <p className="text-xs text-[#F43F5E]">{form.formState.errors.unitPrice.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="minStock" className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block">
                  Minimum Stock *
                </Label>
                <Input 
                  id="minStock" 
                  type="number"
                  {...form.register('minStock', { valueAsNumber: true })} 
                  className="h-10 border-[#E2EFE2] rounded-lg focus-visible:ring-2 focus-visible:ring-[#A3E635]/40 font-mono"
                />
                {form.formState.errors.minStock && (
                  <p className="text-xs text-[#F43F5E]">{form.formState.errors.minStock.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block">
                  Unit *
                </Label>
                <select 
                  id="unit" 
                  {...form.register('unit')} 
                  className="w-full h-10 px-3 border border-[#E2EFE2] rounded-lg bg-white text-sm text-[#0A1F0A] focus:outline-none focus:ring-2 focus:ring-[#A3E635]/40"
                >
                  <option value="Piece">Piece</option>
                  <option value="Kg">Kg</option>
                  <option value="Litre">Litre</option>
                  <option value="Box">Box</option>
                  <option value="Metre">Metre</option>
                </select>
                {form.formState.errors.unit && (
                  <p className="text-xs text-[#F43F5E]">{form.formState.errors.unit.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="warehouse" className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block">
                  Warehouse *
                </Label>
                <select 
                  id="warehouse" 
                  {...form.register('warehouse')} 
                  className="w-full h-10 px-3 border border-[#E2EFE2] rounded-lg bg-white text-sm text-[#0A1F0A] focus:outline-none focus:ring-2 focus:ring-[#A3E635]/40"
                >
                  <option value="Warehouse A">Warehouse A</option>
                  <option value="Warehouse B">Warehouse B</option>
                  <option value="Warehouse C">Warehouse C</option>
                </select>
                {form.formState.errors.warehouse && (
                  <p className="text-xs text-[#F43F5E]">{form.formState.errors.warehouse.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block">
                Description
              </Label>
              <Textarea 
                id="description" 
                {...form.register('description')} 
                placeholder="Optional product description..."
                className="border-[#E2EFE2] rounded-lg focus-visible:ring-2 focus-visible:ring-[#A3E635]/40 min-h-[80px]"
              />
            </div>
          </div>
          
          <DialogFooter className="p-6 border-t border-[#E2EFE2] flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-10 px-4 border-[#E2EFE2] rounded-lg text-sm hover:bg-[#E8F0E8]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-10 px-4 bg-[#142814] text-white rounded-lg text-sm hover:bg-[#1a2e1a] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

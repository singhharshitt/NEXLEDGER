import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/data-display/EmptyState';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useCreateChallan } from '@/hooks/useChallans';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/hooks/useToast';
import { formatCurrency, cn } from '@/lib/utils';
import type { Customer, Product } from '@/types';

interface ChallanLineItem {
  productId: string;
  product: Product;
  quantity: number;
}

export default function CreateChallan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customer');

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [lineItems, setLineItems] = useState<ChallanLineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const debouncedCustomerSearch = useDebounce(customerSearch);
  const debouncedProductSearch = useDebounce(productSearch);

  const { data: customersData } = useCustomers({ search: debouncedCustomerSearch });
  const { data: productsData } = useProducts({ search: debouncedProductSearch });
  const createChallan = useCreateChallan();

  // Preselect customer if provided via URL
  const { data: preCustomersData } = useCustomers(preselectedCustomerId ? { search: '' } : undefined);
  if (preselectedCustomerId && !selectedCustomer && preCustomersData?.data) {
    const found = preCustomersData.data.find((c: Customer) => c.id === preselectedCustomerId);
    if (found) setSelectedCustomer(found);
  }

  const customers = customersData?.data || [];
  const products = productsData?.data || [];

  const addedProductIds = useMemo(() => new Set(lineItems.map((li) => li.productId)), [lineItems]);

  const availableProducts = products.filter((p: Product) => !addedProductIds.has(p.id));

  const totals = useMemo(() => ({
    quantity: lineItems.reduce((s, li) => s + li.quantity, 0),
    amount: lineItems.reduce((s, li) => s + li.product.unitPrice * li.quantity, 0),
  }), [lineItems]);

  const addProduct = (product: Product) => {
    if (addedProductIds.has(product.id)) return;
    setLineItems([...lineItems, { productId: product.id, product, quantity: 1 }]);
    setProductSearch('');
    setShowProductList(false);
    setValidationErrors((prev) => { const next = { ...prev }; delete next[product.id]; return next; });
  };

  const removeProduct = (productId: string) => {
    setLineItems(lineItems.filter((li) => li.productId !== productId));
    setValidationErrors((prev) => { const next = { ...prev }; delete next[productId]; return next; });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setLineItems(lineItems.map((li) => li.productId === productId ? { ...li, quantity } : li));
    // Validate stock
    const item = lineItems.find((li) => li.productId === productId);
    if (item && quantity > item.product.currentStock) {
      setValidationErrors((prev) => ({
        ...prev,
        [productId]: `Available: ${item.product.currentStock}, Requested: ${quantity}`,
      }));
    } else {
      setValidationErrors((prev) => { const next = { ...prev }; delete next[productId]; return next; });
    }
  };

  const validate = (): boolean => {
    if (!selectedCustomer) {
      toast({ title: 'Select a customer', type: 'error' });
      return false;
    }
    if (lineItems.length === 0) {
      toast({ title: 'Add at least one product', type: 'error' });
      return false;
    }
    const errors: Record<string, string> = {};
    for (const li of lineItems) {
      if (li.quantity <= 0) errors[li.productId] = 'Quantity must be positive';
      if (li.quantity > li.product.currentStock) errors[li.productId] = `Available: ${li.product.currentStock}`;
    }
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({ title: 'Fix validation errors', description: 'Check quantities against available stock.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (status: 'draft' | 'confirmed') => {
    if (!validate()) return;
    try {
      const result = await createChallan.mutateAsync({
        customerId: selectedCustomer!.id,
        items: lineItems.map((li) => ({ productId: li.productId, quantity: li.quantity })),
        notes: notes || undefined,
        status,
      });
      toast({
        title: status === 'confirmed' ? 'Challan confirmed' : 'Draft saved',
        description: `Challan ${result.challanNumber} created successfully.`,
        type: 'success',
      });
      navigate(`/challans/${result.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast({ title: 'Error', description: axiosErr?.response?.data?.message || 'Failed to create challan.', type: 'error' });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/challans')} aria-label="Back to challans">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-h2 text-text-primary">New Challan</h1>
          <p className="text-body-sm text-text-muted mt-0.5">Create a new sales delivery challan.</p>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Step 1: Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-accent-primary text-text-inverse text-xs font-bold flex items-center justify-center">1</span>
              Select Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 bg-bg-elevated rounded-[var(--radius-md)]">
                <div>
                  <p className="text-sm font-medium text-text-primary">{selectedCustomer.name}</p>
                  <p className="text-xs text-text-muted">{selectedCustomer.businessName} · <span className="capitalize">{selectedCustomer.type}</span></p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedCustomer(null); setShowCustomerList(false); }}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
                <Input
                  placeholder="Search customers by name or business..."
                  value={customerSearch}
                  onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerList(true); }}
                  onFocus={() => setShowCustomerList(true)}
                  className="pl-9"
                />
                {showCustomerList && customers.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-bg-white border border-border-default rounded-[var(--radius-md)] shadow-lg max-h-60 overflow-y-auto">
                    {customers.map((c: Customer) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCustomer(c); setShowCustomerList(false); setCustomerSearch(''); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-bg-elevated transition-colors border-b border-border-subtle last:border-0"
                      >
                        <p className="text-sm font-medium text-text-primary">{c.name}</p>
                        <p className="text-xs text-text-muted">{c.businessName} · <span className="capitalize">{c.type}</span></p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-accent-primary text-text-inverse text-xs font-bold flex items-center justify-center">2</span>
              Add Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Product search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
              <Input
                placeholder="Search products by name or SKU..."
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductList(true); }}
                onFocus={() => setShowProductList(true)}
                className="pl-9"
              />
              {showProductList && productSearch && availableProducts.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-bg-white border border-border-default rounded-[var(--radius-md)] shadow-lg max-h-60 overflow-y-auto">
                  {availableProducts.map((p: Product) => (
                    <button
                      key={p.id}
                      onClick={() => addProduct(p)}
                      className="w-full text-left px-4 py-2.5 hover:bg-bg-elevated transition-colors border-b border-border-subtle last:border-0 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">{p.name}</p>
                        <p className="text-xs font-mono text-text-muted">{p.sku} · {formatCurrency(p.unitPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-xs font-mono', p.currentStock === 0 ? 'text-danger' : p.currentStock <= p.minStock ? 'text-warning' : 'text-text-muted')}>
                          Stock: {p.currentStock} {p.unit}
                        </p>
                        <Plus className="h-4 w-4 text-text-muted ml-auto" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Line items */}
            {lineItems.length === 0 ? (
              <EmptyState title="No products added" description="Search and add products to this challan." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">SKU</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Price</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Avail.</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider w-24">Qty</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Total</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((li) => {
                      const error = validationErrors[li.productId];
                      return (
                        <tr key={li.productId} className={cn('border-b border-border-subtle last:border-0', error && 'bg-danger-bg/30')}>
                          <td className="px-3 py-2.5">
                            <p className="text-sm text-text-primary">{li.product.name}</p>
                            {error && (
                              <p className="text-xs text-danger flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="h-3 w-3" /> {error}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2.5 hidden sm:table-cell"><span className="text-sm font-mono text-text-muted">{li.product.sku}</span></td>
                          <td className="px-3 py-2.5 text-right"><span className="text-sm font-mono tabular-nums">{formatCurrency(li.product.unitPrice)}</span></td>
                          <td className="px-3 py-2.5 text-right hidden sm:table-cell"><span className="text-sm font-mono tabular-nums text-text-muted">{li.product.currentStock}</span></td>
                          <td className="px-3 py-2.5 text-right">
                            <Input
                              type="number"
                              min={1}
                              max={li.product.currentStock}
                              value={li.quantity}
                              onChange={(e) => updateQuantity(li.productId, parseInt(e.target.value) || 0)}
                              className={cn('w-20 h-8 text-right font-mono ml-auto', error && 'border-danger focus-visible:ring-danger')}
                            />
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="text-sm font-mono tabular-nums font-semibold">{formatCurrency(li.product.unitPrice * li.quantity)}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <Button variant="ghost" size="icon-sm" onClick={() => removeProduct(li.productId)} aria-label="Remove product">
                              <Trash2 className="h-4 w-4 text-text-muted hover:text-danger" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="challan-notes" className="mb-2 block">Notes (Optional)</Label>
            <Textarea id="challan-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes for this challan..." />
          </CardContent>
        </Card>

        {/* Summary + Actions — sticky on mobile */}
        <div className="sticky bottom-0 bg-bg-primary pt-4 pb-4 -mx-4 px-4 lg:-mx-6 lg:px-6 border-t border-border-subtle">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Total Qty</p>
                <p className="text-lg font-mono font-bold tabular-nums text-text-primary">{totals.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Total Amount</p>
                <p className="text-lg font-mono font-bold tabular-nums text-text-primary">{formatCurrency(totals.amount)}</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-initial"
                onClick={() => handleSubmit('draft')}
                disabled={createChallan.isPending}
              >
                Save as Draft
              </Button>
              <Button
                className="flex-1 sm:flex-initial"
                onClick={() => handleSubmit('confirmed')}
                disabled={createChallan.isPending}
              >
                {createChallan.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                ) : 'Confirm Challan'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

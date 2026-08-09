import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Search, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useCreateChallan } from '@/hooks/useChallans';
import { formatCurrency, cn } from '@/lib/utils';
import type { Customer, Product } from '@/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface DraftItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: string | number; // To match logic
  quantity: number;
  total: number;
  availableStock: number;
}

export default function CreateChallan() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get('customerId');

  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: customersData, isLoading: customersLoading } = useCustomers({ limit: 100 });
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 500 });
  
  const createMutation = useCreateChallan();

  const customers = customersData?.data || [];
  const products = productsData?.data || [];

  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (urlCustomerId && customers.length > 0 && !selectedCustomer) {
      const c = customers.find(c => c.id === urlCustomerId);
      if (c) {
        setSelectedCustomer(c);
        setStep(2);
      }
    }
  }, [urlCustomerId, customers, selectedCustomer]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.businessName?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => 
          i.productId === product.id 
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * Number(i.unitPrice) }
            : i
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: 1,
        total: product.unitPrice,
        availableStock: product.currentStock,
      }];
    });
    setProductSearch('');
  };

  const updateQuantity = (productId: string, qtyStr: string) => {
    const qty = parseInt(qtyStr) || 0;
    setItems(prev => prev.map(i => 
      i.productId === productId 
        ? { ...i, quantity: qty, total: qty * Number(i.unitPrice) }
        : i
    ));
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const hasStockErrors = items.some(i => i.quantity > i.availableStock || i.quantity <= 0);

  const handleSaveDraft = () => {
    if (!selectedCustomer || items.length === 0) return;
    createMutation.mutate({
      customerId: selectedCustomer.id,
      status: 'DRAFT',
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
    }, {
      onSuccess: (data) => {
        toast({ title: 'Draft saved successfully' });
        navigate(`/challans/${data.id}`);
      },
      onError: (err: any) => {
        toast({ title: 'Error saving draft', description: err.message, type: 'error' });
      }
    });
  };

  const handleConfirm = () => {
    if (!selectedCustomer || items.length === 0 || hasStockErrors) return;
    createMutation.mutate({
      customerId: selectedCustomer.id,
      status: 'CONFIRMED',
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
    }, {
      onSuccess: (data) => {
        toast({ title: 'Challan confirmed successfully' });
        navigate(`/challans/${data.id}`);
      },
      onError: (err: any) => {
        toast({ title: 'Confirmation failed', description: err.message, type: 'error' });
      }
    });
  };

  const steps = [
    { num: 1, label: 'Customer' },
    { num: 2, label: 'Products' },
    { num: 3, label: 'Review' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F0] pb-32">
      <div className="bg-white border-b border-[#E2EFE2] sticky top-0 z-40">
        <div className="p-4 lg:px-8 max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-[#5A6B5A]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-[#0A1F0A] font-space">New Challan</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 lg:p-8">
        <div className="flex items-center justify-center gap-0 mb-8 max-w-md mx-auto">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step >= s.num ? "bg-[#142814] text-white" : "bg-[#E2EFE2] text-[#8A9A8A]"
                )}>
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={cn(
                  "text-[11px] mt-1.5 font-medium uppercase tracking-wider",
                  step >= s.num ? "text-[#0A1F0A]" : "text-[#8A9A8A]"
                )}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-16 h-px mb-5 transition-colors",
                  step > s.num ? "bg-[#142814]" : "bg-[#E2EFE2]"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#E2EFE2] shadow-sm">
              <h2 className="text-lg font-semibold text-[#0A1F0A] mb-4">Select Customer</h2>
              
              {selectedCustomer ? (
                <div className="border border-[#142814] bg-[#F4FDF4] p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#0A1F0A]">{selectedCustomer.name}</p>
                    <p className="text-sm text-[#5A6B5A]">{selectedCustomer.businessName || 'No business name'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)} className="text-[#8A9A8A] hover:text-[#F43F5E]">
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A9A8A]" />
                    <Input 
                      placeholder="Search customers..." 
                      className="pl-9"
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                    />
                  </div>
                  <div className="border border-[#E2EFE2] rounded-lg max-h-[300px] overflow-y-auto">
                    {customersLoading ? (
                      <p className="p-4 text-sm text-[#8A9A8A] text-center">Loading customers...</p>
                    ) : filteredCustomers.length === 0 ? (
                      <p className="p-4 text-sm text-[#8A9A8A] text-center">No customers found.</p>
                    ) : (
                      filteredCustomers.map(c => (
                        <button
                          key={c.id}
                          className="w-full text-left p-3 border-b border-[#E2EFE2] last:border-0 hover:bg-[#E8F0E8] focus:bg-[#E8F0E8] transition-colors"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          <p className="font-medium text-[#0A1F0A]">{c.name}</p>
                          <p className="text-xs text-[#5A6B5A]">{c.businessName || 'No business name'}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                className="bg-[#142814] text-white hover:bg-[#1a2e1a] px-8"
                disabled={!selectedCustomer}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-[#E2EFE2] shadow-sm">
                  <h2 className="text-lg font-semibold text-[#0A1F0A] mb-4">Add Products</h2>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A9A8A]" />
                    <Input 
                      placeholder="Search products..." 
                      className="pl-9"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                    />
                  </div>
                  {productSearch && (
                    <div className="border border-[#E2EFE2] rounded-lg max-h-[200px] overflow-y-auto mb-4 shadow-lg absolute z-10 bg-white w-full max-w-[calc(100%-3rem)] lg:max-w-[calc(100%-360px)]">
                      {productsLoading ? (
                        <p className="p-4 text-sm text-[#8A9A8A] text-center">Loading products...</p>
                      ) : filteredProducts.length === 0 ? (
                        <p className="p-4 text-sm text-[#8A9A8A] text-center">No products found.</p>
                      ) : (
                        filteredProducts.map(p => (
                          <button
                            key={p.id}
                            className="w-full text-left p-3 border-b border-[#E2EFE2] last:border-0 hover:bg-[#E8F0E8] transition-colors flex justify-between items-center"
                            onClick={() => handleAddProduct(p)}
                          >
                            <div>
                              <p className="font-medium text-[#0A1F0A]">{p.name}</p>
                              <p className="text-xs text-[#5A6B5A]">{p.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">₹{p.unitPrice}</p>
                              <p className="text-xs text-[#8A9A8A]">Stock: {p.currentStock}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  <div className="overflow-x-auto mt-6">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-[#E8F0E8]">
                        <tr className="h-10 text-left text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium">
                          <th className="px-4">Product</th>
                          <th className="px-4">Unit Price</th>
                          <th className="px-4 w-32 text-center">Qty</th>
                          <th className="px-4 text-right">Total</th>
                          <th className="px-4 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-sm text-[#8A9A8A]">
                              No products added yet.
                            </td>
                          </tr>
                        )}
                        {items.map(item => {
                          const stockError = item.quantity > item.availableStock || item.quantity <= 0;
                          return (
                            <tr key={item.productId} className={cn(
                              "h-16 border-b border-[#E2EFE2] transition-colors",
                              stockError ? "bg-[#FFF1F2]" : ""
                            )}>
                              <td className="px-4">
                                <p className="text-sm font-medium text-[#0A1F0A]">{item.productName}</p>
                                <p className="text-xs text-[#5A6B5A] font-mono">{item.sku}</p>
                              </td>
                              <td className="px-4 text-sm font-mono text-[#5A6B5A]">
                                ₹{item.unitPrice}
                              </td>
                              <td className="px-4 text-center">
                                <Input 
                                  type="number" 
                                  min="1"
                                  value={item.quantity || ''}
                                  onChange={e => updateQuantity(item.productId, e.target.value)}
                                  className={cn("w-20 mx-auto text-center font-mono", stockError ? "border-[#F43F5E] focus-visible:ring-[#F43F5E]" : "")}
                                />
                                {stockError && (
                                  <p className="text-[10px] text-[#F43F5E] mt-1 absolute -ml-2 font-medium">
                                    Avail: {item.availableStock}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 text-sm font-mono text-right font-medium text-[#0A1F0A]">
                                ₹{item.total}
                              </td>
                              <td className="px-4 text-center">
                                <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)} className="text-[#8A9A8A] hover:text-[#F43F5E] hover:bg-transparent">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl border border-[#E2EFE2] shadow-sm">
                  <h3 className="text-sm font-semibold text-[#0A1F0A] mb-4 uppercase tracking-widest">Summary</h3>
                  <div className="flex justify-between items-center py-3 border-b border-[#E2EFE2]">
                    <span className="text-sm text-[#5A6B5A]">Customer</span>
                    <span className="text-sm font-medium text-[#0A1F0A]">{selectedCustomer?.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#E2EFE2]">
                    <span className="text-sm text-[#5A6B5A]">Items</span>
                    <span className="text-sm font-medium text-[#0A1F0A]">{items.length}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-base font-semibold text-[#0A1F0A]">Grand Total</span>
                    <span className="text-lg font-bold text-[#142814] font-mono">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-[#142814] text-white hover:bg-[#1a2e1a]"
                    disabled={items.length === 0 || hasStockErrors}
                    onClick={() => setStep(3)}
                  >
                    Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-3xl mx-auto space-y-6 relative">
            <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm overflow-hidden p-8">
              <h2 className="text-2xl font-bold text-[#0A1F0A] font-space mb-6">Review Challan</h2>
              
              <div className="grid grid-cols-2 gap-8 mb-8 border-b border-[#E2EFE2] pb-8">
                <div>
                  <p className="text-xs text-[#8A9A8A] uppercase tracking-wider font-semibold mb-2">Bill To</p>
                  <p className="font-semibold text-[#0A1F0A]">{selectedCustomer?.name}</p>
                  <p className="text-sm text-[#5A6B5A]">{selectedCustomer?.businessName}</p>
                  <p className="text-sm text-[#5A6B5A]">{selectedCustomer?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#8A9A8A] uppercase tracking-wider font-semibold mb-2">Summary</p>
                  <p className="text-sm text-[#5A6B5A]">Total Items: <span className="font-medium text-[#0A1F0A]">{items.length}</span></p>
                  <p className="text-sm text-[#5A6B5A]">Total Amount: <span className="font-medium text-[#0A1F0A]">{formatCurrency(totalAmount)}</span></p>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs text-[#8A9A8A] uppercase tracking-wider font-semibold mb-4">Line Items</p>
                <div className="space-y-4">
                  {items.map(i => (
                    <div key={i.productId} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-[#0A1F0A]">{i.productName}</p>
                        <p className="text-[#8A9A8A] text-xs font-mono">{i.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#0A1F0A]">{i.quantity} x {formatCurrency(Number(i.unitPrice))}</p>
                        <p className="font-bold text-[#142814]">{formatCurrency(i.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-[#FFF1F2] p-4 rounded-lg flex gap-3 text-sm text-[#BE123C]">
                <div className="font-semibold">Important:</div>
                <div>Confirming this challan will deduct stock from inventory permanently. Save as draft if you are not ready.</div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
               <Button variant="outline" onClick={() => setStep(2)}>
                  Back
               </Button>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-[#E2EFE2] px-6 py-4 shadow-[0_-4px_12px_rgba(10,31,10,0.04)] z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-sm text-[#5A6B5A]">
            {items.length} items • Total: 
            <span className="font-mono font-medium text-[#0A1F0A] ml-1">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={handleSaveDraft}
              disabled={items.length === 0 || createMutation.isPending}
              className="h-11 px-5 border-[#E2EFE2] rounded-lg text-sm"
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={items.length === 0 || hasStockErrors || createMutation.isPending}
              className="h-11 px-5 bg-[#142814] text-white rounded-lg hover:bg-[#1a2e1a] disabled:opacity-50 text-sm"
            >
              Confirm Challan
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Challan"
        description="Are you sure you want to confirm this challan? This will deduct stock from inventory immediately."
        confirmText="Confirm"
        confirmVariant="default"
        onConfirm={() => { setConfirmOpen(false); handleConfirm(); }}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}

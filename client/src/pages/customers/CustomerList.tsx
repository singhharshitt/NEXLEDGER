import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Plus, Search, X, Eye, Pencil, MessageSquarePlus, AlertCircle, Users, SearchX, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { EmptyState } from '@/components/data-display/EmptyState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useAddFollowUp } from '@/hooks/useCustomers';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/hooks/useToast';
import { formatDate, cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { CustomerDrawer, type CustomerFormValues } from '@/components/customers/CustomerDrawer';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Customer, CustomerStatus, CustomerType } from '@/types';

const followUpSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  notes: z.string().min(1, 'Notes are required'),
});
type FollowUpFormData = z.infer<typeof followUpSchema>;

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function CustomerList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canModify = user?.role === 'ADMIN' || user?.role === 'SALES';

  // URL State
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const statusFilter = searchParams.get('status') || 'all';
  const typeFilter = searchParams.get('type') || 'all';
  const followUpOverdue = searchParams.get('followUpOverdue') === 'true';
  const hasFilters = searchParams.size > 0;

  // Local state for Drawer
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();

  // Local state for Follow-up Dialog
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [followUpCustomerId, setFollowUpCustomerId] = useState<string | null>(null);

  // Search Debounce logic
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch) {
      setSearchParams((prev) => {
        const current = new URLSearchParams(prev);
        if (current.get('search') !== debouncedSearch) {
          current.set('search', debouncedSearch);
          current.set('page', '1');
        }
        return current;
      });
    } else {
      setSearchParams((prev) => {
        const current = new URLSearchParams(prev);
        if (current.has('search')) {
          current.delete('search');
        }
        return current;
      });
    }
  }, [debouncedSearch, setSearchParams]);

  // Data Fetching
  const { data, isLoading, isError, refetch } = useCustomers({
    search: debouncedSearch,
    status: statusFilter === 'all' ? undefined : (statusFilter as CustomerStatus),
    type: typeFilter === 'all' ? undefined : (typeFilter as CustomerType),
    followUpOverdue: followUpOverdue ? true : undefined,
    page,
    limit,
  });

  const customers = data?.data || [];
  const total = data?.total || 0;

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const addFollowUp = useAddFollowUp();

  const followUpForm = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
  });

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    setSearchParams((prev) => {
      const current = new URLSearchParams(prev);
      if (value === 'all' || !value) {
        current.delete(key);
      } else {
        current.set(key, value);
      }
      current.set('page', '1');
      return current;
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const current = new URLSearchParams(prev);
      current.set('page', newPage.toString());
      return current;
    });
  };

  const handleDrawerSubmit = async (formData: CustomerFormValues) => {
    try {
      const payload = {
        ...formData,
        email: formData.email || '',
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
      };
      
      if (editingCustomer) {
        await updateCustomer.mutateAsync({ id: editingCustomer.id, input: payload });
        toast({ title: 'Customer updated', type: 'success' });
      } else {
        await createCustomer.mutateAsync(payload);
        toast({ title: 'Customer created', type: 'success' });
      }
      setShowDrawer(false);
      setEditingCustomer(undefined);
    } catch (err: unknown) {
      toast({ title: 'Error', description: 'Failed to save customer data.', type: 'error' });
      throw err;
    }
  };

  const handleFollowUp = async (formData: FollowUpFormData) => {
    if (!followUpCustomerId) return;
    try {
      await addFollowUp.mutateAsync({ customerId: followUpCustomerId, input: formData });
      setShowFollowUpDialog(false);
      setFollowUpCustomerId(null);
      followUpForm.reset();
      toast({ title: 'Follow-up added', type: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to add follow-up.', type: 'error' });
    }
  };

  const isOverdue = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (isError) return <ErrorState title="Unable to load customers" onRetry={() => refetch()} />;

  // Render Table Skeleton
  const renderSkeleton = () => (
    <Card className="overflow-hidden mb-6 hidden md:block">
      <div className="animate-pulse">
        {/* Header */}
        <div className="h-10 bg-[#E8F0E8] px-4 grid grid-cols-[2fr_1.5fr_1fr_1fr_1.2fr_1fr_80px] items-center gap-4 border-b border-[#E2EFE2]">
          {Array(7).fill(null).map((_, i) => (
            <div key={i} className="h-3 bg-[#D4E4D4] rounded w-16" />
          ))}
        </div>
        {/* Rows */}
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="h-14 px-4 grid grid-cols-[2fr_1.5fr_1fr_1fr_1.2fr_1fr_80px] items-center gap-4 border-b border-[#E2EFE2] last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8F0E8] shrink-0" />
              <div className="space-y-1">
                <div className="h-3 bg-[#E8F0E8] rounded w-32" />
                <div className="h-3 bg-[#E8F0E8] rounded w-24" />
              </div>
            </div>
            <div className="h-3 bg-[#E8F0E8] rounded w-24" />
            <div className="h-5 bg-[#E8F0E8] rounded-full w-16" />
            <div className="h-3 bg-[#E8F0E8] rounded w-20" />
            <div className="h-3 bg-[#E8F0E8] rounded w-24" />
            <div className="h-3 bg-[#E8F0E8] rounded w-8" />
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <PageHeader
        title="Customers"
        description="Manage customers, relationships, and follow-ups."
        action={
          canModify ? (
            <Button 
              className="bg-[#142814] text-white h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#1a2e1a] transition-colors"
              onClick={() => {
                setEditingCustomer(undefined);
                setShowDrawer(true);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Customer
            </Button>
          ) : undefined
        }
      />

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-6 mt-6 flex-wrap">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
          <Input
            placeholder="Search customers..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-10 border-[#E2EFE2] rounded-lg bg-white"
            aria-label="Search customers"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="h-10 w-[144px] px-3 border border-border-default rounded-lg bg-white text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        
        <select
          value={typeFilter}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="h-10 w-[160px] px-3 border border-border-default rounded-lg bg-white text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          aria-label="Filter by type"
        >
          <option value="all">All Types</option>
          <option value="RETAIL">Retail</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="DISTRIBUTOR">Distributor</option>
        </select>

        <button 
          onClick={() => handleFilterChange('followUpOverdue', followUpOverdue ? 'all' : 'true')}
          className={cn(
            "h-10 px-4 rounded-full text-sm font-medium transition-all flex items-center shrink-0",
            followUpOverdue 
              ? "bg-[#FDF2F8] text-[#F43F5E] border border-[#F472B6]" 
              : "bg-white text-[#5A6B5A] border border-[#E2EFE2] hover:bg-[#F8FAF8]"
          )}
        >
          <AlertCircle className="w-4 h-4 mr-2 inline" />
          Overdue only
        </button>

        {hasFilters && (
          <button 
            onClick={handleClearFilters}
            className="text-sm text-[#5A6B5A] hover:text-[#0A1F0A] underline-offset-4 hover:underline ml-auto shrink-0"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <>
          {renderSkeleton()}
          {/* Mobile Skeleton */}
          <div className="space-y-4 md:hidden mb-6">
            {Array(3).fill(null).map((_, i) => (
              <Card key={i} className="p-4 space-y-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8F0E8] shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-[#E8F0E8] rounded w-3/4" />
                    <div className="h-3 bg-[#E8F0E8] rounded w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : customers.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={<SearchX className="h-12 w-12 text-[#8A9A8A]" />}
            title="No matching customers"
            description="Try adjusting your search or filters."
            action={{ label: 'Clear filters', onClick: handleClearFilters }}
          />
        ) : (
          <EmptyState
            icon={<Users className="h-12 w-12 text-[#8A9A8A]" />}
            title="No customers yet"
            description="Get started by adding your first customer."
            action={canModify ? { label: 'Add Customer', onClick: () => { setEditingCustomer(undefined); setShowDrawer(true); } } : undefined}
          />
        )
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="overflow-hidden mb-4 hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left" role="table">
                <thead className="bg-[#E8F0E8]">
                  <tr role="rowheader" className="border-b border-[#E2EFE2]">
                    <th className="px-4 py-3 text-[11px] font-medium text-[#8A9A8A] uppercase tracking-widest w-[2fr]">Customer</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-[#8A9A8A] uppercase tracking-widest w-[1.5fr]">Business</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-[#8A9A8A] uppercase tracking-widest w-[1fr]">Type</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-[#8A9A8A] uppercase tracking-widest w-[1fr]">Status</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-[#8A9A8A] uppercase tracking-widest w-[1.2fr]">Follow-up</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-[#8A9A8A] uppercase tracking-widest w-[1fr]">Mobile</th>
                    <th className="px-4 py-3 text-[11px] font-medium text-[#8A9A8A] uppercase tracking-widest text-right w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c: Customer) => (
                    <tr key={c.id} className="border-b border-[#E2EFE2] h-[56px] hover:bg-[#E8F0E8]/50 transition-colors last:border-0">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#142814] text-white text-xs font-medium flex items-center justify-center shrink-0">
                            {getInitials(c.name)}
                          </div>
                          <span className="text-sm font-medium text-[#0A1F0A] truncate">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-[#5A6B5A] truncate">{c.businessName || '—'}</td>
                      <td className="px-4 py-2 text-sm text-[#5A6B5A] capitalize">{c.type.toLowerCase()}</td>
                      <td className="px-4 py-2"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-2">
                        {c.followUpDate ? (
                          <div className="flex items-center gap-2">
                            <span className={cn('text-xs font-mono', isOverdue(c.followUpDate) ? 'text-[#F43F5E]' : 'text-[#5A6B5A]')}>
                              {formatDate(c.followUpDate)}
                            </span>
                            {isOverdue(c.followUpDate) && <div className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-pulse" title="Overdue" />}
                          </div>
                        ) : (
                          <span className="text-sm text-[#8A9A8A]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm font-mono text-[#0A1F0A]">{c.mobile || '—'}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/customers/${c.id}`)} aria-label={`View ${c.name}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canModify && (
                            <>
                              <Button variant="ghost" size="icon-sm" onClick={() => { setEditingCustomer(c); setShowDrawer(true); }} aria-label={`Edit ${c.name}`}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => { setFollowUpCustomerId(c.id); setShowFollowUpDialog(true); }} aria-label={`Add follow-up for ${c.name}`}>
                                <MessageSquarePlus className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 mb-4 md:hidden">
            {customers.map((c: Customer) => (
              <div key={c.id} className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#142814] text-white text-sm font-medium flex items-center justify-center shrink-0">
                      {getInitials(c.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0A1F0A]">{c.name}</p>
                      <p className="text-xs text-[#8A9A8A]">{c.businessName || '—'}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#8A9A8A] block mb-0.5">Type</span>
                    <p className="text-[#0A1F0A] font-medium capitalize">{c.type.toLowerCase()}</p>
                  </div>
                  <div>
                    <span className="text-[#8A9A8A] block mb-0.5">Follow-up</span>
                    <div className="flex items-center gap-1.5">
                      <p className={cn("font-mono", isOverdue(c.followUpDate) ? "text-[#F43F5E]" : "text-[#0A1F0A]")}>
                        {c.followUpDate ? formatDate(c.followUpDate) : '—'}
                      </p>
                      {isOverdue(c.followUpDate) && <div className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-pulse" />}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#8A9A8A] block mb-0.5">Mobile</span>
                    <p className="font-mono text-[#0A1F0A]">{c.mobile || '—'}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-[#E2EFE2]">
                  <Button variant="outline" size="sm" className="flex-1 h-10" onClick={() => navigate(`/customers/${c.id}`)}>
                    View
                  </Button>
                  {canModify && (
                    <>
                      <Button variant="outline" size="sm" className="flex-1 h-10" onClick={() => { setEditingCustomer(c); setShowDrawer(true); }}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 h-10" onClick={() => { setFollowUpCustomerId(c.id); setShowFollowUpDialog(true); }}>
                        Note
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          {total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border border-[#E2EFE2] rounded-xl bg-white mb-6">
              <span className="text-sm text-[#8A9A8A]">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} customers
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="h-8 px-3"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page * limit >= total}
                  onClick={() => handlePageChange(page + 1)}
                  className="h-8 px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Drawer */}
      {canModify && (
        <CustomerDrawer
          isOpen={showDrawer}
          onClose={() => {
            setShowDrawer(false);
            setEditingCustomer(undefined);
          }}
          onSubmit={handleDrawerSubmit}
          isSubmitting={createCustomer.isPending || updateCustomer.isPending}
          customer={editingCustomer}
        />
      )}

      {/* Follow-up Dialog */}
      {canModify && (
        <Dialog open={showFollowUpDialog} onOpenChange={setShowFollowUpDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Follow-up</DialogTitle>
              <DialogDescription>Record a follow-up note for this customer.</DialogDescription>
            </DialogHeader>
            <form onSubmit={followUpForm.handleSubmit(handleFollowUp)} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="fu-date">Date *</Label>
                <Input id="fu-date" type="date" {...followUpForm.register('date')} className={followUpForm.formState.errors.date ? 'border-[#F43F5E] bg-[#FFF1F2]' : ''} />
                {followUpForm.formState.errors.date && <p className="text-xs text-[#F43F5E]">{followUpForm.formState.errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fu-notes">Notes *</Label>
                <Textarea id="fu-notes" {...followUpForm.register('notes')} placeholder="What was discussed?" rows={4} className={followUpForm.formState.errors.notes ? 'border-[#F43F5E] bg-[#FFF1F2]' : ''} />
                {followUpForm.formState.errors.notes && <p className="text-xs text-[#F43F5E]">{followUpForm.formState.errors.notes.message}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={addFollowUp.isPending}>
                  {addFollowUp.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Follow-up'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}

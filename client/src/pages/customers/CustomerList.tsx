import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, Eye, Pencil, MessageSquarePlus } from 'lucide-react';
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
import { useCustomers, useCreateCustomer, useAddFollowUp } from '@/hooks/useCustomers';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/hooks/useToast';
import { formatDate, cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Customer, CustomerStatus, CustomerType } from '@/types';

const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  businessName: z.string().min(2, 'Business name is required'),
  type: z.enum(['retailer', 'wholesaler', 'distributor']),
  status: z.enum(['lead', 'active', 'inactive']),
  email: z.email('Valid email required'),
  mobile: z.string().min(10, 'Valid mobile number required'),
  gst: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const followUpSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  notes: z.string().min(1, 'Notes are required'),
});

type FollowUpFormData = z.infer<typeof followUpSchema>;

export default function CustomerList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CustomerType | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [followUpCustomerId, setFollowUpCustomerId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);
  const { data, isLoading, isError, refetch } = useCustomers({
    search: debouncedSearch,
    status: statusFilter,
    type: typeFilter,
  });
  const createCustomer = useCreateCustomer();
  const addFollowUp = useAddFollowUp();

  const customers = data?.data || [];

  const createForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { type: 'retailer', status: 'lead' },
  });

  const followUpForm = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
  });

  const handleCreate = async (formData: CustomerFormData) => {
    try {
      await createCustomer.mutateAsync(formData);
      setShowCreateDialog(false);
      createForm.reset();
      toast({ title: 'Customer created', description: `${formData.name} has been added.`, type: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create customer.', type: 'error' });
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

  const statusOptions: { value: CustomerStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'lead', label: 'Lead' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const typeOptions: { value: CustomerType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'retailer', label: 'Retailer' },
    { value: 'wholesaler', label: 'Wholesaler' },
    { value: 'distributor', label: 'Distributor' },
  ];

  if (isError) return <ErrorState title="Unable to load customers" onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage customer relationships and follow-up activity."
        action={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Customer
          </Button>
        }
      />

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
            <Input
              placeholder="Search by name, business, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'all')}
            className="h-10 px-3 border border-border-default rounded-[var(--radius-md)] bg-bg-white text-sm text-text-primary"
          >
            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as CustomerType | 'all')}
            className="h-10 px-3 border border-border-default rounded-[var(--radius-md)] bg-bg-white text-sm text-text-primary"
          >
            {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card className="p-4"><div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div></Card>
      ) : !customers.length ? (
        <EmptyState
          title="No customers found"
          description={search || statusFilter !== 'all' || typeFilter !== 'all'
            ? 'Try adjusting your search or filters.'
            : 'Add your first customer to start managing CRM activity.'}
          action={!search && statusFilter === 'all' && typeFilter === 'all' ? { label: 'Add Customer', onClick: () => setShowCreateDialog(true) } : undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Name / Business</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Follow-up</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Mobile</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c: Customer) => (
                  <tr key={c.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary">{c.name}</p>
                      <p className="text-xs text-text-muted truncate max-w-[200px]">{c.businessName}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-text-secondary capitalize">{c.type}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {c.followUpDate ? (
                        <span className={cn('text-sm font-mono tabular-nums', isOverdue(c.followUpDate) ? 'text-danger font-medium' : 'text-text-secondary')}>
                          {formatDate(c.followUpDate)}
                          {isOverdue(c.followUpDate) && <span className="ml-1.5 text-xs text-danger">Overdue</span>}
                        </span>
                      ) : (
                        <span className="text-sm text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm font-mono text-text-secondary">{c.mobile}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/customers/${c.id}`)} aria-label="View customer">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/customers/${c.id}`)} aria-label="Edit customer">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => { setFollowUpCustomerId(c.id); setShowFollowUpDialog(true); }}
                          aria-label="Add follow-up"
                        >
                          <MessageSquarePlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Customer Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>Create a new customer record in NexLedger.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Name *</Label>
                <Input id="c-name" {...createForm.register('name')} placeholder="Contact person name" />
                {createForm.formState.errors.name && <p className="text-xs text-danger">{createForm.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-business">Business Name *</Label>
                <Input id="c-business" {...createForm.register('businessName')} placeholder="Company / firm name" />
                {createForm.formState.errors.businessName && <p className="text-xs text-danger">{createForm.formState.errors.businessName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email">Email *</Label>
                <Input id="c-email" type="email" {...createForm.register('email')} placeholder="email@example.com" />
                {createForm.formState.errors.email && <p className="text-xs text-danger">{createForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-mobile">Mobile *</Label>
                <Input id="c-mobile" {...createForm.register('mobile')} placeholder="+91 98765 43210" />
                {createForm.formState.errors.mobile && <p className="text-xs text-danger">{createForm.formState.errors.mobile.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-type">Type</Label>
                <select id="c-type" {...createForm.register('type')} className="h-10 w-full px-3 border border-border-default rounded-[var(--radius-md)] bg-bg-white text-sm">
                  <option value="retailer">Retailer</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="distributor">Distributor</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-status">Status</Label>
                <select id="c-status" {...createForm.register('status')} className="h-10 w-full px-3 border border-border-default rounded-[var(--radius-md)] bg-bg-white text-sm">
                  <option value="lead">Lead</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-gst">GST Number</Label>
                <Input id="c-gst" {...createForm.register('gst')} placeholder="27AABCV1234A1ZN" className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-pincode">Pincode *</Label>
                <Input id="c-pincode" {...createForm.register('pincode')} placeholder="411018" className="font-mono" />
                {createForm.formState.errors.pincode && <p className="text-xs text-danger">{createForm.formState.errors.pincode.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-address">Address *</Label>
              <Input id="c-address" {...createForm.register('address')} placeholder="Street address" />
              {createForm.formState.errors.address && <p className="text-xs text-danger">{createForm.formState.errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-city">City *</Label>
                <Input id="c-city" {...createForm.register('city')} placeholder="City" />
                {createForm.formState.errors.city && <p className="text-xs text-danger">{createForm.formState.errors.city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-state">State *</Label>
                <Input id="c-state" {...createForm.register('state')} placeholder="State" />
                {createForm.formState.errors.state && <p className="text-xs text-danger">{createForm.formState.errors.state.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-notes">Notes</Label>
              <Textarea id="c-notes" {...createForm.register('notes')} placeholder="Optional notes..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={createCustomer.isPending}>
                {createCustomer.isPending ? 'Creating...' : 'Create Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog open={showFollowUpDialog} onOpenChange={setShowFollowUpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Follow-up</DialogTitle>
            <DialogDescription>Record a follow-up note for this customer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={followUpForm.handleSubmit(handleFollowUp)} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="fu-date">Date *</Label>
              <Input id="fu-date" type="date" {...followUpForm.register('date')} />
              {followUpForm.formState.errors.date && <p className="text-xs text-danger">{followUpForm.formState.errors.date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fu-notes">Notes *</Label>
              <Textarea id="fu-notes" {...followUpForm.register('notes')} placeholder="What was discussed?" rows={4} />
              {followUpForm.formState.errors.notes && <p className="text-xs text-danger">{followUpForm.formState.errors.notes.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowFollowUpDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={addFollowUp.isPending}>
                {addFollowUp.isPending ? 'Saving...' : 'Save Follow-up'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

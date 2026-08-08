import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, FileText as FileTextIcon, Building2, Hash, Pencil, Plus, Calendar } from 'lucide-react';
import { useCustomer, useCustomerFollowUps, useAddFollowUp } from '@/hooks/useCustomers';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { ErrorState } from '@/components/data-display/ErrorState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, timeAgo, cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { CustomerFollowUp } from '@/types';

const followUpSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  notes: z.string().min(1, 'Notes are required'),
});

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, isError, refetch } = useCustomer(id!);
  const { data: followUps, isLoading: loadingFollowUps } = useCustomerFollowUps(id!);
  const addFollowUp = useAddFollowUp();
  const [showFollowUp, setShowFollowUp] = useState(false);

  const form = useForm<z.infer<typeof followUpSchema>>({ resolver: zodResolver(followUpSchema) });

  const handleFollowUp = async (data: z.infer<typeof followUpSchema>) => {
    try {
      await addFollowUp.mutateAsync({ customerId: id!, input: data });
      setShowFollowUp(false);
      form.reset();
      toast({ title: 'Follow-up added', type: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to add follow-up.', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4"><Skeleton className="h-48" /><Skeleton className="h-64" /></div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError || !customer) return <ErrorState title="Unable to load customer" onRetry={() => refetch()} />;

  const infoItems = [
    { icon: Mail, label: 'Email', value: customer.email },
    { icon: Phone, label: 'Mobile', value: customer.mobile, mono: true },
    { icon: MapPin, label: 'Address', value: `${customer.address}, ${customer.city}, ${customer.state} ${customer.pincode}` },
    { icon: Hash, label: 'GST', value: customer.gst || '—', mono: true },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/customers')} aria-label="Back to customers">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h2 text-text-primary">{customer.name}</h1>
            <StatusBadge status={customer.status} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Building2 className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
            <p className="text-body-sm text-text-secondary">{customer.businessName}</p>
            <span className="text-text-muted">·</span>
            <span className="text-body-sm text-text-muted capitalize">{customer.type}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowFollowUp(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Follow-up
          </Button>
          <Button size="sm" onClick={() => navigate(`/challans/new?customer=${customer.id}`)}>
            <FileTextIcon className="h-4 w-4" aria-hidden="true" /> Create Challan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Customer Information</CardTitle>
              <Button variant="ghost" size="icon-sm" aria-label="Edit customer">
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="h-8 w-8 rounded-[var(--radius-sm)] bg-bg-elevated flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-text-muted" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-text-muted uppercase tracking-wider">{item.label}</p>
                      <p className={cn('text-sm text-text-primary mt-0.5', item.mono && 'font-mono')}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {customer.notes && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-text-secondary">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follow-up Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Follow-up Timeline</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowFollowUp(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              {loadingFollowUps ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : !followUps?.length ? (
                <EmptyState title="No follow-ups yet" description="Add a follow-up note to track customer interactions." />
              ) : (
                <div className="space-y-0">
                  {followUps.map((f: CustomerFollowUp, idx: number) => (
                    <div key={f.id} className="relative pl-6 pb-6 last:pb-0">
                      {/* Timeline line */}
                      {idx < followUps.length - 1 && (
                        <div className="absolute left-[7px] top-6 bottom-0 w-px bg-border-subtle" />
                      )}
                      {/* Dot */}
                      <div className="absolute left-0 top-1.5 h-[14px] w-[14px] rounded-full border-2 border-accent-primary bg-bg-white" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-3 w-3 text-text-muted" aria-hidden="true" />
                          <span className="text-xs font-mono text-text-muted">{formatDate(f.date)}</span>
                          <span className="text-xs text-text-muted">· {f.createdByName}</span>
                        </div>
                        <p className="text-sm text-text-primary">{f.notes}</p>
                        <p className="text-xs text-text-muted mt-1">{timeAgo(f.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Quick Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Created</p>
                <p className="text-sm font-mono text-text-primary">{formatDate(customer.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Last Updated</p>
                <p className="text-sm font-mono text-text-primary">{formatDate(customer.updatedAt)}</p>
              </div>
              {customer.followUpDate && (
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Next Follow-up</p>
                  <p className={cn('text-sm font-mono', new Date(customer.followUpDate) < new Date() ? 'text-danger font-semibold' : 'text-text-primary')}>
                    {formatDate(customer.followUpDate)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Follow-up Dialog */}
      <Dialog open={showFollowUp} onOpenChange={setShowFollowUp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Follow-up</DialogTitle>
            <DialogDescription>Record a follow-up note for {customer.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleFollowUp)} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="fu-date">Date *</Label>
              <Input id="fu-date" type="date" {...form.register('date')} />
              {form.formState.errors.date && <p className="text-xs text-danger">{form.formState.errors.date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fu-notes">Notes *</Label>
              <Textarea id="fu-notes" {...form.register('notes')} placeholder="What was discussed?" rows={4} />
              {form.formState.errors.notes && <p className="text-xs text-danger">{form.formState.errors.notes.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowFollowUp(false)}>Cancel</Button>
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

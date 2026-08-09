import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronRight, Users, MessageCircle, FileText, Pencil 
} from 'lucide-react';
import { useCustomer, useCustomerFollowUps, useAddFollowUp, useUpdateCustomer } from '@/hooks/useCustomers';
import { useChallans } from '@/hooks/useChallans';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/useToast';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { EmptyState } from '@/components/data-display/EmptyState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomerDrawer, type CustomerFormValues } from '@/components/customers/CustomerDrawer';
import { formatDate, cn } from '@/lib/utils';
import type { CustomerFollowUp, Challan } from '@/types';

// Helper for overdue styling
const isOverdue = (dateStr?: string) => {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  return date < today;
};

// Sub-component for Metadata
const MetadataField = ({ label, value, mono, fullWidth, highlightOverdue }: { label: string; value?: string; mono?: boolean; fullWidth?: boolean; highlightOverdue?: boolean }) => (
  <div className={cn(fullWidth && "sm:col-span-2")}>
    <p className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium">
      {label}
    </p>
    <p className={cn(
      "text-sm text-[#0A1F0A] mt-1 break-words",
      mono && "font-mono",
      highlightOverdue && isOverdue(value) && "text-[#F43F5E] font-medium"
    )}>
      {value || <span className="text-[#8A9A8A] italic">Not provided</span>}
    </p>
  </div>
);

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Parallel Fetching
  const { data: customer, isLoading: customerLoading, isError: customerError, refetch: refetchCustomer } = useCustomer(id!);
  const { data: followups, isLoading: followupsLoading } = useCustomerFollowUps(id!);
  const { data: challansData, isLoading: challansLoading } = useChallans({ 
    customerId: id, 
    limit: 3,
    sort: 'createdAt:desc' 
  });

  const addFollowUpMutation = useAddFollowUp();
  const updateCustomerMutation = useUpdateCustomer();

  // State
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Derived
  const recentChallans = challansData?.data ?? [];
  const canModify = user?.role === 'ADMIN' || user?.role === 'SALES';

  // Handlers
  const handleAddFollowUp = () => {
    addFollowUpMutation.mutate({
      customerId: id!,
      input: {
        date: followUpDate,
        notes: followUpNotes,
      }
    }, {
      onSuccess: () => {
        setFollowUpOpen(false);
        setFollowUpNotes('');
        setFollowUpDate('');
        queryClient.invalidateQueries({ queryKey: ['customers', id, 'followups'] });
        queryClient.invalidateQueries({ queryKey: ['customers', id] });
        toast({ title: 'Follow-up added', type: 'success' });
      },
    });
  };

  const handleEditSubmit = async (formData: CustomerFormValues) => {
    if (!customer) return;
    const payload = {
      ...formData,
      email: formData.email || '',
      address: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
    };
    await updateCustomerMutation.mutateAsync({ id: customer.id, input: payload });
    setEditDrawerOpen(false);
    toast({ title: 'Customer updated', type: 'success' });
  };

  // Error States
  if (customerError) {
    // We treat 404s via string check if the error is standard Axios error.
    // The useQuery will throw or set error based on status.
    const is404 = String(customerError).includes('404');
    if (is404) {
      return (
        <div className="p-6 lg:p-8 min-h-screen bg-[#F0F4F0] flex items-center justify-center">
          <EmptyState 
            icon={<Users className="w-12 h-12 text-[#8A9A8A]" />}
            title="Customer not found"
            description="The customer you're looking for doesn't exist or is no longer available."
            action={{ label: 'Back to Customers', onClick: () => window.history.back() }}
          />
        </div>
      );
    }
    return (
      <div className="p-6 lg:p-8 min-h-screen bg-[#F0F4F0] flex items-center justify-center">
        <ErrorState title="Unable to load customer" onRetry={() => refetchCustomer()} />
      </div>
    );
  }

  // Loading Skeleton
  if (customerLoading) {
    return (
      <div className="p-6 lg:p-8 bg-[#F0F4F0] min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-[#E8F0E8] rounded w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#E2EFE2] p-6 space-y-4">
                <div className="h-7 bg-[#E8F0E8] rounded w-64" />
                <div className="h-4 bg-[#E8F0E8] rounded w-40" />
                <div className="h-px bg-[#E2EFE2]" />
                <div className="grid grid-cols-2 gap-4">
                  {Array(6).fill(null).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-[#E8F0E8] rounded w-20" />
                      <div className="h-4 bg-[#E8F0E8] rounded w-full" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#E2EFE2] p-6">
                <div className="h-6 bg-[#E8F0E8] rounded w-32 mb-6" />
                <div className="space-y-4 pl-3">
                  {Array(3).fill(null).map((_, i) => (
                    <div key={i} className="ml-6 space-y-2">
                      <div className="h-4 bg-[#E8F0E8] rounded w-full" />
                      <div className="h-3 bg-[#E8F0E8] rounded w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#E2EFE2] p-5 space-y-3">
                <div className="h-5 bg-[#E8F0E8] rounded w-28" />
                <div className="h-10 bg-[#E8F0E8] rounded w-full" />
                <div className="h-10 bg-[#E8F0E8] rounded w-full" />
              </div>
              <div className="bg-white rounded-xl border border-[#E2EFE2] p-5 space-y-3">
                <div className="h-5 bg-[#E8F0E8] rounded w-32" />
                <div className="h-12 bg-[#E8F0E8] rounded w-full" />
                <div className="h-12 bg-[#E8F0E8] rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="p-6 lg:p-8 bg-[#F0F4F0] min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link 
          to="/customers" 
          className="text-[#8A9A8A] hover:text-[#0A1F0A] transition-colors"
        >
          Customers
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#D4E4D4]" />
        <span className="text-[#0A1F0A] font-medium truncate max-w-[300px]">
          {customer.businessName || customer.name}
        </span>
      </nav>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 mt-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Customer Header Card */}
          <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-[#0A1F0A] tracking-tight" 
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {customer.name}
                  </h1>
                  <p className="text-[#5A6B5A] mt-1">{customer.businessName}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={customer.status} />
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                    customer.type === 'WHOLESALE' && "bg-[#FDF2F8] text-[#F472B6] border-[#FBCFE8]",
                    customer.type === 'RETAIL' && "bg-blue-50 text-blue-600 border-blue-200",
                    customer.type === 'DISTRIBUTOR' && "bg-purple-50 text-purple-600 border-purple-200"
                  )}>
                    {customer.type.charAt(0) + customer.type.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="h-px bg-[#E2EFE2]" />
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <MetadataField label="GST Number" value={customer.gst} mono />
                <MetadataField label="Email" value={customer.email} />
                <MetadataField label="Mobile" value={customer.mobile} mono />
                <MetadataField label="Customer Type" value={customer.type.charAt(0) + customer.type.slice(1).toLowerCase()} />
                <MetadataField label="Follow-up Date" value={customer.followUpDate ? formatDate(customer.followUpDate) : ''} mono highlightOverdue />
                <MetadataField label="Address" value={[customer.address, customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')} fullWidth />
              </div>
            </div>
          </div>

          {/* Follow-up Timeline */}
          <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#0A1F0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Follow-ups
              </h2>
              {canModify && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFollowUpOpen(true)}
                  className="h-9 px-3 rounded-lg border-[#E2EFE2] text-sm hover:bg-[#E8F0E8]"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  Add Follow-up
                </Button>
              )}
            </div>
            
            {followupsLoading ? (
               <div className="space-y-4 pl-3">
                 {Array(3).fill(null).map((_, i) => (
                   <div key={i} className="ml-6 space-y-2 animate-pulse">
                     <div className="h-4 bg-[#E8F0E8] rounded w-full" />
                     <div className="h-3 bg-[#E8F0E8] rounded w-32" />
                   </div>
                 ))}
               </div>
            ) : (!followups || followups.length === 0) ? (
              <EmptyState 
                icon={<MessageCircle className="w-10 h-10 text-[#8A9A8A]" />}
                title="No follow-ups yet"
                description="Record your first follow-up to track customer interactions."
              />
            ) : (
              <div className="relative pl-3">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#E2EFE2]" />
                <div className="space-y-6">
                  {followups.map((followup: CustomerFollowUp, index: number) => (
                    <motion.div
                      key={followup.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                      className="relative"
                    >
                      <span className="absolute -left-[7px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#A3E635] ring-4 ring-[#A3E635]/20" />
                      
                      <div className="ml-6 bg-[#F9FBF9] border border-[#E2EFE2] rounded-lg p-4">
                        <p className="text-sm text-[#0A1F0A] leading-relaxed">
                          {followup.notes}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="font-mono text-[11px] text-[#8A9A8A] tabular-nums">
                            {formatDate(followup.date)}
                          </span>
                          <span className="text-[#D4E4D4]">•</span>
                          <span className="text-[11px] text-[#8A9A8A]">
                            by {followup.createdByName || 'System'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-5">
            <h3 className="text-sm font-medium text-[#0A1F0A] mb-4">Quick Actions</h3>
            
            <div className="space-y-2.5">
              {canModify && (
                <>
                  <Link to={`/challans/new?customerId=${id}`} className="block">
                    <Button className="w-full h-11 bg-[#142814] text-white rounded-lg text-sm font-medium hover:bg-[#1a2e1a] transition-colors">
                      <FileText className="w-4 h-4 mr-2" />
                      Create Challan
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setEditDrawerOpen(true)}
                    className="w-full h-10 border-[#E2EFE2] rounded-lg text-sm hover:bg-[#E8F0E8] transition-colors"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Customer
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setFollowUpOpen(true)}
                    className="w-full h-10 border-[#E2EFE2] rounded-lg text-sm hover:bg-[#E8F0E8] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Add Follow-up
                  </Button>
                </>
              )}
              
              {!canModify && (
                <div className="text-center py-4">
                  <p className="text-xs text-[#8A9A8A]">
                    View-only access for {user?.role.toLowerCase()} role
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Challans Card */}
          <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[#0A1F0A]">Recent Challans</h3>
              <Link 
                to={`/challans?customerId=${id}`} 
                className="text-xs text-[#5A6B5A] hover:text-[#0A1F0A] transition-colors"
              >
                View all
              </Link>
            </div>
            
            {challansLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-12 bg-[#E8F0E8] rounded w-full" />
                <div className="h-12 bg-[#E8F0E8] rounded w-full" />
              </div>
            ) : recentChallans.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="w-8 h-8 text-[#D4E4D4] mx-auto mb-2" />
                <p className="text-xs text-[#8A9A8A]">No challans yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentChallans.map((challan: Challan) => (
                  <Link
                    key={challan.id}
                    to={`/challans/${challan.id}`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between py-3 border-b border-[#E2EFE2] last:border-0 group-hover:bg-[#E8F0E8]/30 -mx-2 px-2 rounded-lg transition-colors">
                      <div>
                        <p className="font-mono text-sm text-[#0A1F0A] tracking-tight">
                          {challan.challanNumber}
                        </p>
                        <p className="font-mono text-[11px] text-[#8A9A8A] mt-0.5">
                          {formatDate(challan.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-medium text-[#0A1F0A]">
                          ₹{challan.totalAmount.toLocaleString('en-IN')}
                        </p>
                        <div className="mt-1 flex justify-end">
                          <StatusBadge status={challan.status} className="scale-90 origin-right" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Follow-up Modal */}
      <Dialog open={followUpOpen} onOpenChange={setFollowUpOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl p-0 overflow-hidden border-0 shadow-xl [&>button]:right-6 [&>button]:top-6">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-lg font-semibold text-[#0A1F0A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Add Follow-up
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block mb-1.5">
                Follow-up Date
              </label>
              <Input 
                type="date" 
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="h-10 border-[#E2EFE2] rounded-lg focus-visible:ring-2 focus-visible:ring-[#A3E635]/40"
              />
            </div>
            
            <div>
              <label className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium block mb-1.5">
                Notes
              </label>
              <Textarea
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                rows={4}
                placeholder="Enter follow-up details..."
                className="border-[#E2EFE2] rounded-lg focus-visible:ring-2 focus-visible:ring-[#A3E635]/40 resize-none"
              />
            </div>
          </div>
          
          <DialogFooter className="p-6 pt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setFollowUpOpen(false)}
              className="h-10 px-4 border-[#E2EFE2] rounded-lg text-sm hover:bg-[#E8F0E8]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFollowUp}
              disabled={!followUpNotes.trim() || !followUpDate.trim() || addFollowUpMutation.isPending}
              className="h-10 px-4 bg-[#142814] text-white rounded-lg text-sm hover:bg-[#1a2e1a] disabled:opacity-50"
            >
              {addFollowUpMutation.isPending ? 'Saving...' : 'Save Follow-up'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Drawer */}
      {editDrawerOpen && (
        <CustomerDrawer
          isOpen={editDrawerOpen}
          onClose={() => setEditDrawerOpen(false)}
          customer={customer}
          onSubmit={handleEditSubmit}
          isSubmitting={updateCustomerMutation.isPending}
        />
      )}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Customer } from '@/types';

// Matching server-side schema roughly
const customerCreateSchema = z.object({
  name: z.string().min(1, 'Full Name is required').max(255),
  businessName: z.string().min(1, 'Business Name is required').max(255),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits').max(20),
  gst: z.string().optional(),
  type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerCreateSchema>;

interface CustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isSubmitting: boolean;
  customer?: Customer; // If provided, we are in Edit mode
}

export function CustomerDrawer({ isOpen, onClose, onSubmit, isSubmitting, customer }: CustomerDrawerProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerCreateSchema),
    defaultValues: {
      name: '',
      businessName: '',
      email: '',
      mobile: '',
      gst: '',
      type: 'RETAIL',
      status: 'LEAD',
      address: '',
      city: '',
      state: '',
      pincode: '',
      followUpDate: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        reset({
          name: customer.name,
          businessName: customer.businessName,
          email: customer.email,
          mobile: customer.mobile,
          gst: customer.gst || '',
          type: customer.type,
          status: customer.status,
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          pincode: customer.pincode || '',
          followUpDate: customer.followUpDate || '',
          notes: customer.notes || '',
        });
      } else {
        reset({
          name: '',
          businessName: '',
          email: '',
          mobile: '',
          gst: '',
          type: 'RETAIL',
          status: 'LEAD',
          address: '',
          city: '',
          state: '',
          pincode: '',
          followUpDate: '',
          notes: '',
        });
      }
    }
  }, [isOpen, customer, reset]);

  // Focus trap / Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleFormSubmit = async (data: CustomerFormValues) => {
    await onSubmit(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end"
          aria-modal="true"
          role="dialog"
          aria-label={customer ? 'Edit Customer' : 'Add Customer'}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0F1F0F]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col h-[100dvh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2EFE2] shrink-0 bg-white">
              <h2 className="text-lg font-semibold text-[#0A1F0A]">
                {customer ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-[#8A9A8A] hover:text-[#0A1F0A] rounded-full hover:bg-[#F8FAF8] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto bg-[#F8FAF8]">
              <form id="customer-form" ref={formRef} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-6">
                
                {/* Section 1: Basic Info */}
                <div className="bg-white p-5 rounded-xl border border-[#E2EFE2] shadow-sm">
                  <h3 className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" {...register('name')} className={errors.name ? 'border-[#F43F5E] bg-[#FFF1F2]' : ''} />
                      {errors.name && <p className="text-[#F43F5E] text-xs">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input id="businessName" {...register('businessName')} className={errors.businessName ? 'border-[#F43F5E] bg-[#FFF1F2]' : ''} />
                      {errors.businessName && <p className="text-[#F43F5E] text-xs">{errors.businessName.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-[#F43F5E] bg-[#FFF1F2]' : ''} />
                      {errors.email && <p className="text-[#F43F5E] text-xs">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mobile">Mobile *</Label>
                      <Input id="mobile" type="tel" {...register('mobile')} className={errors.mobile ? 'border-[#F43F5E] bg-[#FFF1F2]' : ''} />
                      {errors.mobile && <p className="text-[#F43F5E] text-xs">{errors.mobile.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Section 2: Business Details */}
                <div className="bg-white p-5 rounded-xl border border-[#E2EFE2] shadow-sm">
                  <h3 className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium mb-4">
                    Business Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="gst">GST Number</Label>
                      <Input id="gst" {...register('gst')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="type">Customer Type *</Label>
                      <select id="type" {...register('type')} className="flex h-10 w-full rounded-[var(--radius-md)] border border-border-default bg-bg-white px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
                        <option value="RETAIL">Retail</option>
                        <option value="WHOLESALE">Wholesale</option>
                        <option value="DISTRIBUTOR">Distributor</option>
                      </select>
                    </div>
                    
                    {/* Location Info (Requested implicitly by the schema, making address smaller) */}
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" {...register('address')} rows={2} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...register('city')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" {...register('state')} />
                    </div>
                  </div>
                </div>

                {/* Section 3: CRM */}
                <div className="bg-white p-5 rounded-xl border border-[#E2EFE2] shadow-sm">
                  <h3 className="text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium mb-4">
                    Follow-up & Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="status">Status *</Label>
                      <select id="status" {...register('status')} className="flex h-10 w-full rounded-[var(--radius-md)] border border-border-default bg-bg-white px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
                        <option value="LEAD">Lead</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="followUpDate">Follow-up Date</Label>
                      <Input id="followUpDate" type="date" {...register('followUpDate')} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" {...register('notes')} rows={3} />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E2EFE2] bg-white shrink-0 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" form="customer-form" disabled={isSubmitting} className="min-w-[100px]">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(255),          // mapped to contact_name
  businessName: z.string().min(1).max(255),
  type: z.string().transform(v => v.toUpperCase()).pipe(
    z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'])
  ),
  status: z.string().transform(v => v.toUpperCase()).pipe(
    z.enum(['LEAD', 'ACTIVE', 'INACTIVE'])
  ).optional().default('LEAD'),
  email: z.string().email().optional().or(z.literal('')),
  mobile: z.string().min(10).max(20),
  gst: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowUpSchema = z.object({
  date: z.string().min(1),
  notes: z.string().min(1),
});

export const customerListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  followUpOverdue: z.coerce.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;

import { z } from 'zod';

export const stockAdjustSchema = z.object({
  type: z.string().transform(v => v.toUpperCase()).pipe(
    z.enum(['IN', 'OUT'])
  ),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
});

export type StockAdjustInput = z.infer<typeof stockAdjustSchema>;

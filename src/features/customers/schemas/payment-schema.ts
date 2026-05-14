import * as z from 'zod';

export const paymentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'cheque', 'other']),
  bankName: z.string().optional().nullable(),
  referenceNo: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

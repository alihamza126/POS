import * as z from 'zod';

export const supplierSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  phone: z.string().min(7, 'Phone number must be at least 7 digits'),
  email: z.string().email('Invalid email address').or(z.literal('')).nullable().optional(),
  address: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  ntn: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

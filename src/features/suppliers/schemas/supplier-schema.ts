import * as z from 'zod';

export const supplierSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  phone: z.string().min(7, 'Phone number must be at least 7 digits'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  contactPerson: z.string().optional().or(z.literal('')),
  ntn: z.string().optional().or(z.literal('')),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

import * as z from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { products } from './inventory';
import { customers } from './customers';
import { invoices } from './sales';

// -----------------------------------------------------------------------------
// Product Batches — enables multi-batch tracking with FEFO (First Expired First Out)
// A product can have multiple batches with different expiry dates
// -----------------------------------------------------------------------------
export const productBatches = sqliteTable('product_batches', {
  id: text('id').primaryKey(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  batchNumber: text('batch_number').notNull(),
  expiryDate: text('expiry_date'),            // ISO date YYYY-MM-DD
  manufacturingDate: text('manufacturing_date'), // ISO date YYYY-MM-DD (optional)
  purchasePrice: real('purchase_price').notNull().default(0),
  sellingPrice: real('selling_price'),        // Override selling price per batch (optional)
  quantity: integer('quantity').notNull().default(0), // Remaining quantity in this batch
  supplierId: text('supplier_id'),
  purchaseInvoiceId: text('purchase_invoice_id'), // Links to purchase_invoices
  branchId: text('branch_id').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// -----------------------------------------------------------------------------
// Expiry Alerts — tracks products/batches nearing or past expiry
// Background checker creates these; cashier/manager can dismiss them
// -----------------------------------------------------------------------------
export const expiryAlerts = sqliteTable('expiry_alerts', {
  id: text('id').primaryKey(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  batchId: text('batch_id'),                   // References product_batches (nullable = product-level)
  expiryDate: text('expiry_date').notNull(),   // ISO date YYYY-MM-DD
  daysUntilExpiry: integer('days_until_expiry').notNull(),
  severity: text('severity', {
    enum: ['critical', 'warning', 'info'],
  }).notNull().default('warning'),
  // critical = expired or expiring in < 7 days
  // warning  = expiring in 7-30 days
  // info     = expiring in 30-90 days
  status: text('status', {
    enum: ['active', 'dismissed', 'expired'],
  }).notNull().default('active'),
  dismissedBy: text('dismissed_by'),           // user_id who dismissed
  dismissedAt: text('dismissed_at'),
  branchId: text('branch_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// -----------------------------------------------------------------------------
// Patient Records — extends the customers table with medical information
// One-to-one with customers (customerId = primary key)
// -----------------------------------------------------------------------------
export const patientRecords = sqliteTable('patient_records', {
  id: text('id').primaryKey(),
  customerId: text('customer_id')
    .notNull()
    .unique()
    .references(() => customers.id),
  dateOfBirth: text('date_of_birth'),         // ISO date YYYY-MM-DD
  gender: text('gender', {
    enum: ['male', 'female', 'other'],
  }),
  bloodGroup: text('blood_group'),            // e.g. A+, B-, O+
  allergies: text('allergies'),               // Free text or JSON array
  chronicConditions: text('chronic_conditions'), // Free text or JSON array
  currentMedications: text('current_medications'), // Free text
  doctorName: text('doctor_name'),            // Referred doctor / physician
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  notes: text('notes'),                       // General medical notes
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// -----------------------------------------------------------------------------
// Prescriptions — doctor prescriptions linked to patients and optionally to sales
// Supports prescription writing before or after sale
// -----------------------------------------------------------------------------
export const prescriptions = sqliteTable('prescriptions', {
  id: text('id').primaryKey(),
  customerId: text('customer_id')
    .notNull()
    .references(() => customers.id),
  invoiceId: text('invoice_id')
    .references(() => invoices.id), // Linked after sale (nullable if written before sale)
  doctorName: text('doctor_name').notNull(),
  doctorLicense: text('doctor_license'),
  clinicName: text('clinic_name'),
  prescriptionDate: text('prescription_date').notNull(),
  diagnosis: text('diagnosis'),
  notes: text('notes'),
  // Medicines in the prescription (stored as JSON array of {name, dosage, frequency, duration})
  medicines: text('medicines').notNull().default('[]'),
  status: text('status', {
    enum: ['draft', 'dispensed', 'partial'],
  }).notNull().default('draft'),
  branchId: text('branch_id').notNull(),
  userId: text('user_id').notNull(),  // Created by user
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// -----------------------------------------------------------------------------
// Clinic Settings — persists clinic-specific configuration
// Used for receipt printing, branding, and alert thresholds
// -----------------------------------------------------------------------------
export const clinicSettings = sqliteTable('clinic_settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

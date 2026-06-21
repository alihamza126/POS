-- Migration: 0002_add-medical-features
-- Adds medical clinic support: product batches, expiry alerts, patient records, prescriptions, clinic settings

-- Add medical fields to existing products table
ALTER TABLE `products` ADD COLUMN `composition` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `manufacturer` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `batch_number` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `expiry_date` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `rack_location` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `requires_prescription` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint

-- Add batch_id to stock_movements for FEFO tracking
ALTER TABLE `stock_movements` ADD COLUMN `batch_id` text;
--> statement-breakpoint

-- Product Batches table — multi-batch tracking with FEFO (First Expired First Out)
CREATE TABLE IF NOT EXISTS `product_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`batch_number` text NOT NULL,
	`expiry_date` text,
	`manufacturing_date` text,
	`purchase_price` real DEFAULT 0 NOT NULL,
	`selling_price` real,
	`quantity` integer DEFAULT 0 NOT NULL,
	`supplier_id` text,
	`purchase_invoice_id` text,
	`branch_id` text NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

-- Expiry Alerts table — dashboard warning system for expiring/expired medicines
CREATE TABLE IF NOT EXISTS `expiry_alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`batch_id` text,
	`expiry_date` text NOT NULL,
	`days_until_expiry` integer NOT NULL,
	`severity` text DEFAULT 'warning' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`dismissed_by` text,
	`dismissed_at` text,
	`branch_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

-- Patient Records table — extends customers with medical information
CREATE TABLE IF NOT EXISTS `patient_records` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL UNIQUE,
	`date_of_birth` text,
	`gender` text,
	`blood_group` text,
	`allergies` text,
	`chronic_conditions` text,
	`current_medications` text,
	`doctor_name` text,
	`emergency_contact` text,
	`emergency_phone` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

-- Prescriptions table — doctor prescriptions linked to patients and optionally to sales
CREATE TABLE IF NOT EXISTS `prescriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`invoice_id` text,
	`doctor_name` text NOT NULL,
	`doctor_license` text,
	`clinic_name` text,
	`prescription_date` text NOT NULL,
	`diagnosis` text,
	`notes` text,
	`medicines` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`branch_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

-- Clinic Settings table — key-value store for clinic configuration
CREATE TABLE IF NOT EXISTS `clinic_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL UNIQUE,
	`value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

-- Indexes for performance
CREATE INDEX IF NOT EXISTS `idx_product_batches_product_id` ON `product_batches` (`product_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_product_batches_expiry_date` ON `product_batches` (`expiry_date`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_expiry_alerts_status` ON `expiry_alerts` (`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_expiry_alerts_product_id` ON `expiry_alerts` (`product_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_prescriptions_customer_id` ON `prescriptions` (`customer_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_prescriptions_invoice_id` ON `prescriptions` (`invoice_id`);

CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`address` text,
	`company_name` text,
	`notes` text,
	`branch_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `customer_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text NOT NULL,
	`bank_name` text,
	`reference_no` text,
	`note` text,
	`branch_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_customers_branch_id` ON `customers` (`branch_id`);
--> statement-breakpoint
CREATE INDEX `idx_customers_phone` ON `customers` (`phone`);
--> statement-breakpoint
CREATE INDEX `idx_customers_deleted_at` ON `customers` (`deleted_at`);
--> statement-breakpoint
CREATE INDEX `idx_customer_payments_customer_id` ON `customer_payments` (`customer_id`);
--> statement-breakpoint
CREATE INDEX `idx_customer_payments_branch_id` ON `customer_payments` (`branch_id`);
--> statement-breakpoint
CREATE INDEX `idx_customer_payments_created_at` ON `customer_payments` (`created_at`);

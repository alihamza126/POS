-- Migration: 0003_add-disease-formulas
-- Adds the Disease → Remedy Formula library used when writing prescriptions.
--
-- NOTE: this file is hand-written, not `drizzle-kit generate` output — this
-- repo's drizzle-kit snapshot history (meta/*.json) is stale (migrations
-- 0001 and 0002 were also hand-written without matching snapshots), so a
-- blind `drizzle-kit generate` here re-diffs against the original 0000
-- snapshot and re-emits CREATE TABLE statements for tables that already
-- exist on any real install (suppliers, product_batches, prescriptions,
-- etc). Do not run `drizzle-kit generate` unattended in this repo — always
-- inspect the output and hand-trim it to just the real delta, as done here.

CREATE TABLE IF NOT EXISTS `disease_formulas` (
	`id` text PRIMARY KEY NOT NULL,
	`disease_name` text NOT NULL,
	`category` text,
	`remedies` text DEFAULT '[]' NOT NULL,
	`notes` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`branch_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `idx_disease_formulas_disease_name` ON `disease_formulas` (`disease_name`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_disease_formulas_branch_id` ON `disease_formulas` (`branch_id`);

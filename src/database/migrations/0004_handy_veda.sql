CREATE TABLE `sync_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`status` text NOT NULL,
	`total_items` integer DEFAULT 0 NOT NULL,
	`synced_items` integer DEFAULT 0 NOT NULL,
	`failed_items` integer DEFAULT 0 NOT NULL,
	`message` text
);
--> statement-breakpoint
ALTER TABLE `sync_queue` ADD `sync_message` text;

CREATE TABLE `checkout_session` (
	`id` text PRIMARY KEY NOT NULL,
	`stripe_checkout_session_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`fulfillment_type` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text,
	`delivery_address` text,
	`notes` text,
	`scheduled_for` integer,
	`currency` text DEFAULT 'usd' NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`cart_snapshot` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkout_session_stripe_checkout_session_id_unique` ON `checkout_session` (`stripe_checkout_session_id`);--> statement-breakpoint
CREATE INDEX `checkout_session_user_id_idx` ON `checkout_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `checkout_session_status_idx` ON `checkout_session` (`status`);--> statement-breakpoint
CREATE INDEX `checkout_session_scheduled_for_idx` ON `checkout_session` (`scheduled_for`);
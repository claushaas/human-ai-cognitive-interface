CREATE TABLE `rate_limits` (
	`action` text NOT NULL,
	`count` text NOT NULL,
	`created_at` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`limit` text NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` text NOT NULL,
	`window_key` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `rate_limits_user_id_idx` ON `rate_limits` (`user_id`);--> statement-breakpoint
CREATE INDEX `rate_limits_window_key_idx` ON `rate_limits` (`window_key`);
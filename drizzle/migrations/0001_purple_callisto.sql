PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`created_at` text NOT NULL,
	`email` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`provider` text NOT NULL,
	`provider_subject` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("created_at", "email", "id", "name", "provider", "provider_subject", "updated_at") SELECT "created_at", "email", "id", "name", "provider", "provider_subject", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_provider_subject_unique` ON `users` (`provider_subject`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `sessions` ADD `raw_intent_json` text;
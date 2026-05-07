CREATE TABLE `collection_answers` (
	`answer_json` text NOT NULL,
	`answered_at` text NOT NULL,
	`created_at` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`session_id` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `collection_answers_session_id_idx` ON `collection_answers` (`session_id`);--> statement-breakpoint
CREATE INDEX `collection_answers_question_id_idx` ON `collection_answers` (`question_id`);--> statement-breakpoint
CREATE TABLE `feedback` (
	`created_at` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`updated_at` text,
	`user_id` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `feedback_session_id_idx` ON `feedback` (`session_id`);--> statement-breakpoint
CREATE INDEX `feedback_user_id_idx` ON `feedback` (`user_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`collection_protocol_json` text,
	`completed_at` text,
	`contract_json` text,
	`created_at` text NOT NULL,
	`deleted_at` text,
	`desired_outcome` text,
	`error` text,
	`id` text PRIMARY KEY NOT NULL,
	`initial_role` text,
	`input_text` text NOT NULL,
	`level_match_json` text,
	`locale` text NOT NULL,
	`model` text,
	`prompt` text,
	`prompt_result_json` text,
	`rulers_json` text,
	`status` text NOT NULL,
	`title` text,
	`updated_at` text NOT NULL,
	`usage_json` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_deleted_at_idx` ON `sessions` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `sessions_updated_at_idx` ON `sessions` (`updated_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`created_at` text NOT NULL,
	`email` text,
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`provider` text NOT NULL,
	`provider_subject` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_provider_subject_unique` ON `users` (`provider_subject`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);
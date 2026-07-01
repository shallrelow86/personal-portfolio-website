CREATE TABLE `bookmark` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`favicon` text DEFAULT '' NOT NULL,
	`reason` text DEFAULT '' NOT NULL,
	`category_id` integer,
	`tags` text DEFAULT '[]' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`parent_id` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_slug_unique` ON `category` (`slug`);--> statement-breakpoint
ALTER TABLE `post` ADD `category_id` integer;--> statement-breakpoint
ALTER TABLE `post` ADD `status` text DEFAULT 'published' NOT NULL;
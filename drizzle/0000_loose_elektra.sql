CREATE TABLE `post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`cover_image` text DEFAULT '' NOT NULL,
	`published_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_slug_unique` ON `post` (`slug`);--> statement-breakpoint
CREATE TABLE `profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`avatar` text DEFAULT '' NOT NULL,
	`skills` text DEFAULT '[]' NOT NULL,
	`social_links` text DEFAULT '[]' NOT NULL,
	`resume_file` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`cover_image` text DEFAULT '' NOT NULL,
	`screenshots` text DEFAULT '[]' NOT NULL,
	`tech_stack` text DEFAULT '[]' NOT NULL,
	`github_url` text DEFAULT '' NOT NULL,
	`live_url` text DEFAULT '' NOT NULL,
	`featured` integer DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_slug_unique` ON `project` (`slug`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`site_title` text DEFAULT '' NOT NULL,
	`site_description` text DEFAULT '' NOT NULL,
	`og_image` text DEFAULT '' NOT NULL,
	`primary_nav` text DEFAULT '[]' NOT NULL,
	`footer_text` text DEFAULT '' NOT NULL
);

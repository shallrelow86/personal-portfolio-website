CREATE TABLE `embedding` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_type` text NOT NULL,
	`source_id` integer NOT NULL,
	`content` text NOT NULL,
	`embedding` blob NOT NULL
);

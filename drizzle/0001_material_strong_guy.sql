CREATE TABLE `adminLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`entityType` varchar(100),
	`entityId` int,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`chapterId` int NOT NULL,
	`pageNumber` int NOT NULL,
	`bookmarkedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookmark_user_chapter_idx` UNIQUE(`userId`,`chapterId`)
);
--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seriesId` int NOT NULL,
	`chapterNumber` decimal(6,2) NOT NULL,
	`title` varchar(255),
	`description` text,
	`imageUrls` json NOT NULL,
	`pageCount` int NOT NULL,
	`isPremium` boolean NOT NULL DEFAULT false,
	`status` enum('draft','scheduled','published') NOT NULL DEFAULT 'draft',
	`scheduledPublishDate` timestamp,
	`viewCount` int DEFAULT 0,
	`downloadCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`publishedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commentLikes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`commentId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commentLikes_id` PRIMARY KEY(`id`),
	CONSTRAINT `like_user_comment_idx` UNIQUE(`userId`,`commentId`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`chapterId` int NOT NULL,
	`content` text NOT NULL,
	`hasSpoiler` boolean NOT NULL DEFAULT false,
	`isApproved` boolean NOT NULL DEFAULT true,
	`likeCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`chapterId` int NOT NULL,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	`isAvailableOffline` boolean NOT NULL DEFAULT true,
	CONSTRAINT `downloads_id` PRIMARY KEY(`id`),
	CONSTRAINT `download_user_chapter_idx` UNIQUE(`userId`,`chapterId`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`seriesId` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `fav_user_series_idx` UNIQUE(`userId`,`seriesId`)
);
--> statement-breakpoint
CREATE TABLE `genres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `genres_id` PRIMARY KEY(`id`),
	CONSTRAINT `genres_name_unique` UNIQUE(`name`),
	CONSTRAINT `genres_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('newChapter','premiumOffer','announcement','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedSeriesId` int,
	`relatedChapterId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotionalOffers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountPercentage` int NOT NULL,
	`discountAmount` decimal(10,2),
	`maxUses` int,
	`currentUses` int DEFAULT 0,
	`validFrom` timestamp NOT NULL,
	`validUntil` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotionalOffers_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotionalOffers_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`seriesId` int NOT NULL,
	`rating` int NOT NULL,
	`review` text,
	`isApproved` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`),
	CONSTRAINT `rating_user_series_idx` UNIQUE(`userId`,`seriesId`)
);
--> statement-breakpoint
CREATE TABLE `readingHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`seriesId` int NOT NULL,
	`chapterId` int NOT NULL,
	`currentPage` int DEFAULT 0,
	`totalPages` int NOT NULL,
	`readPercentage` decimal(5,2) DEFAULT '0',
	`isCompleted` boolean NOT NULL DEFAULT false,
	`lastReadAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `readingHistory_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_series_idx` UNIQUE(`userId`,`seriesId`)
);
--> statement-breakpoint
CREATE TABLE `series` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` longtext,
	`author` varchar(255),
	`artist` varchar(255),
	`coverImageUrl` text,
	`status` enum('ongoing','completed','hiatus','cancelled') NOT NULL DEFAULT 'ongoing',
	`releaseYear` int,
	`rating` decimal(3,2) DEFAULT '0.00',
	`ratingCount` int DEFAULT 0,
	`viewCount` int DEFAULT 0,
	`isPremium` boolean NOT NULL DEFAULT false,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`featuredOrder` int,
	`genres` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `series_id` PRIMARY KEY(`id`),
	CONSTRAINT `series_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `seriesSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`seriesId` int NOT NULL,
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seriesSubscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `seriesSub_user_series_idx` UNIQUE(`userId`,`seriesId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` enum('weekly','monthly','quarterly') NOT NULL,
	`durationDays` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptionPlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptionPlans_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`transactionId` varchar(255),
	`amount` decimal(10,2) NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`autoRenew` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `userSuspensions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reason` text,
	`suspendedAt` timestamp NOT NULL DEFAULT (now()),
	`suspendedUntil` timestamp,
	`isPermanent` boolean NOT NULL DEFAULT false,
	`suspendedBy` int NOT NULL,
	CONSTRAINT `userSuspensions_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSuspensions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `isSuperAdmin` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('free','active','expired','cancelled') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('weekly','monthly','quarterly');--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStartDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionEndDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredReadingMode` enum('vertical','ltr','rtl','horizontal') DEFAULT 'vertical' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `darkModeEnabled` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `autoAdvanceChapters` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `log_adminId_idx` ON `adminLogs` (`adminId`);--> statement-breakpoint
CREATE INDEX `log_action_idx` ON `adminLogs` (`action`);--> statement-breakpoint
CREATE INDEX `bookmark_userId_idx` ON `bookmarks` (`userId`);--> statement-breakpoint
CREATE INDEX `bookmark_chapterId_idx` ON `bookmarks` (`chapterId`);--> statement-breakpoint
CREATE INDEX `seriesId_idx` ON `chapters` (`seriesId`);--> statement-breakpoint
CREATE INDEX `chapter_status_idx` ON `chapters` (`status`);--> statement-breakpoint
CREATE INDEX `chapter_premium_idx` ON `chapters` (`isPremium`);--> statement-breakpoint
CREATE INDEX `like_userId_idx` ON `commentLikes` (`userId`);--> statement-breakpoint
CREATE INDEX `like_commentId_idx` ON `commentLikes` (`commentId`);--> statement-breakpoint
CREATE INDEX `comment_userId_idx` ON `comments` (`userId`);--> statement-breakpoint
CREATE INDEX `comment_chapterId_idx` ON `comments` (`chapterId`);--> statement-breakpoint
CREATE INDEX `download_userId_idx` ON `downloads` (`userId`);--> statement-breakpoint
CREATE INDEX `download_chapterId_idx` ON `downloads` (`chapterId`);--> statement-breakpoint
CREATE INDEX `fav_userId_idx` ON `favorites` (`userId`);--> statement-breakpoint
CREATE INDEX `fav_seriesId_idx` ON `favorites` (`seriesId`);--> statement-breakpoint
CREATE INDEX `notif_userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notif_type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `rating_userId_idx` ON `ratings` (`userId`);--> statement-breakpoint
CREATE INDEX `rating_seriesId_idx` ON `ratings` (`seriesId`);--> statement-breakpoint
CREATE INDEX `history_userId_idx` ON `readingHistory` (`userId`);--> statement-breakpoint
CREATE INDEX `history_seriesId_idx` ON `readingHistory` (`seriesId`);--> statement-breakpoint
CREATE INDEX `history_chapterId_idx` ON `readingHistory` (`chapterId`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `series` (`slug`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `series` (`status`);--> statement-breakpoint
CREATE INDEX `featured_idx` ON `series` (`isFeatured`);--> statement-breakpoint
CREATE INDEX `premium_idx` ON `series` (`isPremium`);--> statement-breakpoint
CREATE INDEX `seriesSub_userId_idx` ON `seriesSubscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `seriesSub_seriesId_idx` ON `seriesSubscriptions` (`seriesId`);--> statement-breakpoint
CREATE INDEX `sub_userId_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `sub_planId_idx` ON `subscriptions` (`planId`);--> statement-breakpoint
CREATE INDEX `sub_status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `suspend_userId_idx` ON `userSuspensions` (`userId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `superAdmin_idx` ON `users` (`isSuperAdmin`);
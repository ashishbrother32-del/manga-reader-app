import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  boolean,
  decimal,
  longtext,
  json,
  unique,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with manga reader specific fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Super Admin email (hardcoded restriction)
  isSuperAdmin: boolean("isSuperAdmin").default(false).notNull(),
  // User profile fields
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  // Subscription info
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["free", "active", "expired", "cancelled"]).default("free").notNull(),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["weekly", "monthly", "quarterly"]),
  subscriptionStartDate: timestamp("subscriptionStartDate"),
  subscriptionEndDate: timestamp("subscriptionEndDate"),
  // Reading preferences
  preferredReadingMode: mysqlEnum("preferredReadingMode", ["vertical", "ltr", "rtl", "horizontal"]).default("vertical").notNull(),
  darkModeEnabled: boolean("darkModeEnabled").default(true).notNull(),
  autoAdvanceChapters: boolean("autoAdvanceChapters").default(true).notNull(),
  // Admin action logging
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  superAdminIdx: index("superAdmin_idx").on(table.isSuperAdmin),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Manga/Manhwa series table
 */
export const series = mysqlTable("series", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: longtext("description"),
  author: varchar("author", { length: 255 }),
  artist: varchar("artist", { length: 255 }),
  coverImageUrl: text("coverImageUrl"),
  status: mysqlEnum("status", ["ongoing", "completed", "hiatus", "cancelled"]).default("ongoing").notNull(),
  releaseYear: int("releaseYear"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  ratingCount: int("ratingCount").default(0),
  viewCount: int("viewCount").default(0),
  // Premium content
  isPremium: boolean("isPremium").default(false).notNull(),
  // Featured on home page
  isFeatured: boolean("isFeatured").default(false).notNull(),
  featuredOrder: int("featuredOrder"),
  // Genres stored as JSON array
  genres: json("genres").$type<string[]>().default([]),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  statusIdx: index("status_idx").on(table.status),
  featuredIdx: index("featured_idx").on(table.isFeatured),
  premiumIdx: index("premium_idx").on(table.isPremium),
}));

export type Series = typeof series.$inferSelect;
export type InsertSeries = typeof series.$inferInsert;

/**
 * Chapters table
 */
export const chapters = mysqlTable("chapters", {
  id: int("id").autoincrement().primaryKey(),
  seriesId: int("seriesId").notNull(),
  chapterNumber: decimal("chapterNumber", { precision: 6, scale: 2 }).notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  // Chapter images stored as JSON array of URLs
  imageUrls: json("imageUrls").$type<string[]>().notNull(),
  pageCount: int("pageCount").notNull(),
  // Premium chapter
  isPremium: boolean("isPremium").default(false).notNull(),
  // Publishing status
  status: mysqlEnum("status", ["draft", "scheduled", "published"]).default("draft").notNull(),
  scheduledPublishDate: timestamp("scheduledPublishDate"),
  // Statistics
  viewCount: int("viewCount").default(0),
  downloadCount: int("downloadCount").default(0),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  publishedAt: timestamp("publishedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  seriesIdIdx: index("seriesId_idx").on(table.seriesId),
  statusIdx: index("chapter_status_idx").on(table.status),
  premiumIdx: index("chapter_premium_idx").on(table.isPremium),
}));

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;

/**
 * User reading history
 */
export const readingHistory = mysqlTable("readingHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  seriesId: int("seriesId").notNull(),
  chapterId: int("chapterId").notNull(),
  currentPage: int("currentPage").default(0),
  totalPages: int("totalPages").notNull(),
  readPercentage: decimal("readPercentage", { precision: 5, scale: 2 }).default("0"),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  lastReadAt: timestamp("lastReadAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("history_userId_idx").on(table.userId),
  seriesIdIdx: index("history_seriesId_idx").on(table.seriesId),
  chapterIdIdx: index("history_chapterId_idx").on(table.chapterId),
  userSeriesIdx: unique("user_series_idx").on(table.userId, table.seriesId),
}));

export type ReadingHistory = typeof readingHistory.$inferSelect;
export type InsertReadingHistory = typeof readingHistory.$inferInsert;

/**
 * User favorites
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  seriesId: int("seriesId").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("fav_userId_idx").on(table.userId),
  seriesIdIdx: index("fav_seriesId_idx").on(table.seriesId),
  userSeriesIdx: unique("fav_user_series_idx").on(table.userId, table.seriesId),
}));

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Chapter bookmarks
 */
export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  chapterId: int("chapterId").notNull(),
  pageNumber: int("pageNumber").notNull(),
  bookmarkedAt: timestamp("bookmarkedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("bookmark_userId_idx").on(table.userId),
  chapterIdIdx: index("bookmark_chapterId_idx").on(table.chapterId),
  userChapterIdx: unique("bookmark_user_chapter_idx").on(table.userId, table.chapterId),
}));

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = typeof bookmarks.$inferInsert;

/**
 * Ratings and reviews
 */
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  seriesId: int("seriesId").notNull(),
  rating: int("rating").notNull(), // 1-5 stars
  review: text("review"),
  isApproved: boolean("isApproved").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("rating_userId_idx").on(table.userId),
  seriesIdIdx: index("rating_seriesId_idx").on(table.seriesId),
  userSeriesIdx: unique("rating_user_series_idx").on(table.userId, table.seriesId),
}));

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * Comments on chapters
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  chapterId: int("chapterId").notNull(),
  content: text("content").notNull(),
  hasSpoiler: boolean("hasSpoiler").default(false).notNull(),
  isApproved: boolean("isApproved").default(true).notNull(),
  likeCount: int("likeCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("comment_userId_idx").on(table.userId),
  chapterIdIdx: index("comment_chapterId_idx").on(table.chapterId),
}));

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Comment likes
 */
export const commentLikes = mysqlTable("commentLikes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  commentId: int("commentId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("like_userId_idx").on(table.userId),
  commentIdIdx: index("like_commentId_idx").on(table.commentId),
  userCommentIdx: unique("like_user_comment_idx").on(table.userId, table.commentId),
}));

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

/**
 * Subscription plans (configurable by Super Admin)
 */
export const subscriptionPlans = mysqlTable("subscriptionPlans", {
  id: int("id").autoincrement().primaryKey(),
  name: mysqlEnum("name", ["weekly", "monthly", "quarterly"]).notNull().unique(),
  durationDays: int("durationDays").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * Subscription transactions
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  transactionId: varchar("transactionId", { length: 255 }).unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  autoRenew: boolean("autoRenew").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("sub_userId_idx").on(table.userId),
  planIdIdx: index("sub_planId_idx").on(table.planId),
  statusIdx: index("sub_status_idx").on(table.status),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Promotional offers (configurable by Super Admin)
 */
export const promotionalOffers = mysqlTable("promotionalOffers", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountPercentage: int("discountPercentage").notNull(),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }),
  maxUses: int("maxUses"),
  currentUses: int("currentUses").default(0),
  validFrom: timestamp("validFrom").notNull(),
  validUntil: timestamp("validUntil").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PromotionalOffer = typeof promotionalOffers.$inferSelect;
export type InsertPromotionalOffer = typeof promotionalOffers.$inferInsert;

/**
 * Admin action logs for audit trail
 */
export const adminLogs = mysqlTable("adminLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: int("entityId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  adminIdIdx: index("log_adminId_idx").on(table.adminId),
  actionIdx: index("log_action_idx").on(table.action),
}));

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

/**
 * User suspensions/bans
 */
export const userSuspensions = mysqlTable("userSuspensions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  reason: text("reason"),
  suspendedAt: timestamp("suspendedAt").defaultNow().notNull(),
  suspendedUntil: timestamp("suspendedUntil"),
  isPermanent: boolean("isPermanent").default(false).notNull(),
  suspendedBy: int("suspendedBy").notNull(),
}, (table) => ({
  userIdIdx: index("suspend_userId_idx").on(table.userId),
}));

export type UserSuspension = typeof userSuspensions.$inferSelect;
export type InsertUserSuspension = typeof userSuspensions.$inferInsert;

/**
 * Notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["newChapter", "premiumOffer", "announcement", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedSeriesId: int("relatedSeriesId"),
  relatedChapterId: int("relatedChapterId"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notif_userId_idx").on(table.userId),
  typeIdx: index("notif_type_idx").on(table.type),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Series subscriptions (users subscribing to series for notifications)
 */
export const seriesSubscriptions = mysqlTable("seriesSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  seriesId: int("seriesId").notNull(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("seriesSub_userId_idx").on(table.userId),
  seriesIdIdx: index("seriesSub_seriesId_idx").on(table.seriesId),
  userSeriesIdx: unique("seriesSub_user_series_idx").on(table.userId, table.seriesId),
}));

export type SeriesSubscription = typeof seriesSubscriptions.$inferSelect;
export type InsertSeriesSubscription = typeof seriesSubscriptions.$inferInsert;

/**
 * Chapter downloads (for offline reading)
 */
export const downloads = mysqlTable("downloads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  chapterId: int("chapterId").notNull(),
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
  isAvailableOffline: boolean("isAvailableOffline").default(true).notNull(),
}, (table) => ({
  userIdIdx: index("download_userId_idx").on(table.userId),
  chapterIdIdx: index("download_chapterId_idx").on(table.chapterId),
  userChapterIdx: unique("download_user_chapter_idx").on(table.userId, table.chapterId),
}));

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = typeof downloads.$inferInsert;

/**
 * Genre reference table
 */
export const genres = mysqlTable("genres", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Genre = typeof genres.$inferSelect;
export type InsertGenre = typeof genres.$inferInsert;

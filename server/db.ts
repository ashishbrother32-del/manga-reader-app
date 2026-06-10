import { eq, and, or, like, desc, asc, between, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";
import { ENV } from "./_core/env";

let cachedDb: any = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  
  if (!ENV.databaseUrl) {
    console.error("DATABASE_URL is not configured");
    return null;
  }
  
  try {
    const connection = await mysql.createConnection(ENV.databaseUrl);
    cachedDb = drizzle(connection, { schema, mode: "default" });
    return cachedDb;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return null;
  }
}

// ============================================================================
// USER FUNCTIONS
// ============================================================================

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.openId, openId));
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching user by openId:", error);
    return null;
  }
}

export async function upsertUser(data: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const existing = await getUserByOpenId(data.openId);
    
    if (existing) {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.loginMethod !== undefined) updateData.loginMethod = data.loginMethod;
      if (data.lastSignedIn !== undefined) updateData.lastSignedIn = data.lastSignedIn;
      
      if (Object.keys(updateData).length > 0) {
        await db
          .update(schema.users)
          .set(updateData)
          .where(eq(schema.users.openId, data.openId));
      }
    } else {
      await db.insert(schema.users).values({
        openId: data.openId,
        name: data.name || null,
        email: data.email || null,
        loginMethod: data.loginMethod || null,
        lastSignedIn: data.lastSignedIn || new Date(),
      });
    }
    
    return getUserByOpenId(data.openId);
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
}

export async function checkSuperAdminAccess(userId: number): Promise<boolean> {
  const user = await getUserById(userId);
  return user?.isSuperAdmin === true && user?.email === "ashishbrother32@gmail.com";
}

export async function updateUserProfile(
  userId: number,
  data: {
    name?: string;
    avatarUrl?: string;
    bio?: string;
    preferredReadingMode?: "vertical" | "ltr" | "rtl" | "horizontal";
    darkModeEnabled?: boolean;
    autoAdvanceChapters?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, userId));
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function updateUserSubscription(
  userId: number,
  data: {
    subscriptionStatus: "free" | "active" | "expired" | "cancelled";
    subscriptionPlan?: "weekly" | "monthly" | "quarterly" | null;
    subscriptionStartDate?: Date | null;
    subscriptionEndDate?: Date | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, userId));
  } catch (error) {
    console.error("Error updating user subscription:", error);
    throw error;
  }
}

// ============================================================================
// SERIES FUNCTIONS
// ============================================================================

export async function getAllSeries(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db
      .select()
      .from(schema.series)
      .orderBy(desc(schema.series.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("Error fetching all series:", error);
    return [];
  }
}

export async function getSeriesById(seriesId: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(schema.series)
      .where(eq(schema.series.id, seriesId));
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching series by ID:", error);
    return null;
  }
}

export async function getSeriesBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(schema.series)
      .where(eq(schema.series.slug, slug));
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching series by slug:", error);
    return null;
  }
}

export async function searchSeries(
  query: string,
  filters?: {
    status?: "ongoing" | "completed" | "hiatus" | "cancelled";
    author?: string;
    minYear?: number;
    maxYear?: number;
    isPremium?: boolean;
  },
  limit = 20,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    let conditions = or(
      like(schema.series.title, `%${query}%`),
      like(schema.series.author, `%${query}%`),
      like(schema.series.artist, `%${query}%`)
    );
    
    if (filters?.status) {
      conditions = and(conditions, eq(schema.series.status, filters.status));
    }
    
    if (filters?.author) {
      conditions = and(conditions, like(schema.series.author, `%${filters.author}%`));
    }
    
    if (filters?.minYear && filters?.maxYear) {
      conditions = and(
        conditions,
        between(schema.series.releaseYear, filters.minYear, filters.maxYear)
      );
    }
    
    if (filters?.isPremium !== undefined) {
      conditions = and(conditions, eq(schema.series.isPremium, filters.isPremium));
    }
    
    return await db
      .select()
      .from(schema.series)
      .where(conditions)
      .orderBy(desc(schema.series.viewCount))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("Error searching series:", error);
    return [];
  }
}

export async function getFeaturedSeries(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db
      .select()
      .from(schema.series)
      .where(eq(schema.series.isFeatured, true))
      .orderBy(asc(schema.series.featuredOrder))
      .limit(limit);
  } catch (error) {
    console.error("Error fetching featured series:", error);
    return [];
  }
}

export async function getTrendingSeries(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db
      .select()
      .from(schema.series)
      .orderBy(desc(schema.series.viewCount))
      .limit(limit);
  } catch (error) {
    console.error("Error fetching trending series:", error);
    return [];
  }
}

export async function createSeries(data: schema.InsertSeries) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(schema.series).values(data);
    return (result as any).insertId;
  } catch (error) {
    console.error("Error creating series:", error);
    throw error;
  }
}

export async function updateSeries(seriesId: number, data: Partial<schema.InsertSeries>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db
      .update(schema.series)
      .set(data)
      .where(eq(schema.series.id, seriesId));
  } catch (error) {
    console.error("Error updating series:", error);
    throw error;
  }
}

export async function deleteSeries(seriesId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db
      .delete(schema.series)
      .where(eq(schema.series.id, seriesId));
  } catch (error) {
    console.error("Error deleting series:", error);
    throw error;
  }
}

// ============================================================================
// CHAPTER FUNCTIONS
// ============================================================================

export async function getChaptersBySeriesId(seriesId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db
      .select()
      .from(schema.chapters)
      .where(eq(schema.chapters.seriesId, seriesId))
      .orderBy(desc(schema.chapters.chapterNumber))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
}

export async function getChapterById(chapterId: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(schema.chapters)
      .where(eq(schema.chapters.id, chapterId));
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching chapter by ID:", error);
    return null;
  }
}

export async function createChapter(data: schema.InsertChapter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(schema.chapters).values(data);
    return (result as any).insertId;
  } catch (error) {
    console.error("Error creating chapter:", error);
    throw error;
  }
}

export async function updateChapter(chapterId: number, data: Partial<schema.InsertChapter>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db
      .update(schema.chapters)
      .set(data)
      .where(eq(schema.chapters.id, chapterId));
  } catch (error) {
    console.error("Error updating chapter:", error);
    throw error;
  }
}

export async function deleteChapter(chapterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db
      .delete(schema.chapters)
      .where(eq(schema.chapters.id, chapterId));
  } catch (error) {
    console.error("Error deleting chapter:", error);
    throw error;
  }
}

export async function publishChapter(chapterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db
      .update(schema.chapters)
      .set({
        status: "published",
        publishedAt: new Date(),
      })
      .where(eq(schema.chapters.id, chapterId));
  } catch (error) {
    console.error("Error publishing chapter:", error);
    throw error;
  }
}

// ============================================================================
// READING HISTORY FUNCTIONS
// ============================================================================

export async function getReadingHistory(userId: number, seriesId: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(schema.readingHistory)
      .where(
        and(
          eq(schema.readingHistory.userId, userId),
          eq(schema.readingHistory.seriesId, seriesId)
        )
      );
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching reading history:", error);
    return null;
  }
}

export async function getUserReadingHistory(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db
      .select()
      .from(schema.readingHistory)
      .where(eq(schema.readingHistory.userId, userId))
      .orderBy(desc(schema.readingHistory.lastReadAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("Error fetching user reading history:", error);
    return [];
  }
}

export async function getContinueReading(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db
      .select()
      .from(schema.readingHistory)
      .where(
        and(
          eq(schema.readingHistory.userId, userId),
          eq(schema.readingHistory.isCompleted, false)
        )
      )
      .orderBy(desc(schema.readingHistory.lastReadAt))
      .limit(limit);
  } catch (error) {
    console.error("Error fetching continue reading:", error);
    return [];
  }
}

export async function updateReadingProgress(
  userId: number,
  seriesId: number,
  chapterId: number,
  currentPage: number,
  totalPages: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const readPercentage = (currentPage / totalPages) * 100;
    const isCompleted = currentPage >= totalPages;
    
    const existing = await getReadingHistory(userId, seriesId);
    
    if (existing) {
      await db
        .update(schema.readingHistory)
        .set({
          chapterId,
          currentPage,
          totalPages,
          readPercentage,
          isCompleted,
          lastReadAt: new Date(),
        })
        .where(
          and(
            eq(schema.readingHistory.userId, userId),
            eq(schema.readingHistory.seriesId, seriesId)
          )
        );
    } else {
      await db.insert(schema.readingHistory).values({
        userId: userId,
        seriesId: seriesId,
        chapterId: chapterId,
        currentPage: currentPage,
        totalPages: totalPages,
        isCompleted: isCompleted,
      } as any);
    }
  } catch (error) {
    console.error("Error updating reading progress:", error);
    throw error;
  }
}

// ============================================================================
// FAVORITES FUNCTIONS
// ============================================================================

export async function getUserFavorites(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db
      .select()
      .from(schema.favorites)
      .where(eq(schema.favorites.userId, userId))
      .orderBy(desc(schema.favorites.addedAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return [];
  }
}

export async function isFavorite(userId: number, seriesId: number) {
  const db = await getDb();
  if (!db) return false;
  
  try {
    const result = await db
      .select()
      .from(schema.favorites)
      .where(
        and(
          eq(schema.favorites.userId, userId),
          eq(schema.favorites.seriesId, seriesId)
        )
      );
    
    return result.length > 0;
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
}

export async function addFavorite(userId: number, seriesId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const existing = await isFavorite(userId, seriesId);
    if (!existing) {
      await db.insert(schema.favorites).values({ userId, seriesId });
    }
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
}

export async function removeFavorite(userId: number, seriesId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db
      .delete(schema.favorites)
      .where(
        and(
          eq(schema.favorites.userId, userId),
          eq(schema.favorites.seriesId, seriesId)
        )
      );
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
}

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

export async function getTotalUsers() {
  const db = await getDb();
  if (!db) return 0;
  
  try {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.users);
    return (result[0]?.count as number) || 0;
  } catch (error) {
    console.error("Error getting total users:", error);
    return 0;
  }
}

export async function getPremiumSubscriberCount() {
  const db = await getDb();
  if (!db) return 0;
  
  try {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.users)
      .where(eq(schema.users.subscriptionStatus, "active"));
    return (result[0]?.count as number) || 0;
  } catch (error) {
    console.error("Error getting premium subscriber count:", error);
    return 0;
  }
}

export async function getMostReadSeries(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db
      .select()
      .from(schema.series)
      .orderBy(desc(schema.series.viewCount))
      .limit(limit);
  } catch (error) {
    console.error("Error getting most read series:", error);
    return [];
  }
}

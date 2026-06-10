import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { telegramRouter } from "./telegram-routes";

export const appRouter = router({
  system: systemRouter,
  telegram: telegramRouter,

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // USER PROFILE
  // ============================================================================
  user: router({
    getProfile: protectedProcedure.query(({ ctx }) => {
      return db.getUserById(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          avatarUrl: z.string().url().optional(),
          bio: z.string().max(500).optional(),
          preferredReadingMode: z
            .enum(["vertical", "ltr", "rtl", "horizontal"])
            .optional(),
          darkModeEnabled: z.boolean().optional(),
          autoAdvanceChapters: z.boolean().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.updateUserProfile(ctx.user.id, input);
      }),

    getReadingStats: protectedProcedure.query(async ({ ctx }) => {
      const history = await db.getUserReadingHistory(ctx.user.id, 1000);
      const totalChaptersRead = history.length;
      const totalSeriesRead = new Set(history.map((h: any) => h.seriesId)).size;

      return {
        totalChaptersRead,
        totalSeriesRead,
        lastReadAt: history[0]?.lastReadAt || null,
      };
    }),
  }),

  // ============================================================================
  // SERIES & DISCOVERY
  // ============================================================================
  series: router({
    // Get all series with pagination
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(({ input }) => {
        return db.getAllSeries(input.limit, input.offset);
      }),

    // Get series by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getSeriesById(input.id);
      }),

    // Get series by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => {
        return db.getSeriesBySlug(input.slug);
      }),

    // Search series
    search: publicProcedure
      .input(
        z.object({
          query: z.string(),
          status: z
            .enum(["ongoing", "completed", "hiatus", "cancelled"])
            .optional(),
          author: z.string().optional(),
          minYear: z.number().optional(),
          maxYear: z.number().optional(),
          isPremium: z.boolean().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(({ input }) => {
        return db.searchSeries(
          input.query,
          {
            status: input.status,
            author: input.author,
            minYear: input.minYear,
            maxYear: input.maxYear,
            isPremium: input.isPremium,
          },
          input.limit,
          input.offset
        );
      }),

    // Get featured series
    getFeatured: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
      .query(({ input }) => {
        return db.getFeaturedSeries(input.limit);
      }),

    // Get trending series
    getTrending: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
      .query(({ input }) => {
        return db.getTrendingSeries(input.limit);
      }),

    // Super Admin: Create series
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          slug: z.string().min(1).max(255),
          description: z.string().optional(),
          author: z.string().optional(),
          artist: z.string().optional(),
          coverImageUrl: z.string().url().optional(),
          status: z
            .enum(["ongoing", "completed", "hiatus", "cancelled"])
            .default("ongoing"),
          releaseYear: z.number().optional(),
          genres: z.array(z.string()).default([]),
          isPremium: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const isSuperAdmin = await db.checkSuperAdminAccess(ctx.user.id);
        if (!isSuperAdmin) {
          throw new Error("Only Super Admin can create series");
        }

        return db.createSeries(input);
      }),

    // Super Admin: Update series
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          author: z.string().optional(),
          artist: z.string().optional(),
          coverImageUrl: z.string().url().optional(),
          status: z
            .enum(["ongoing", "completed", "hiatus", "cancelled"])
            .optional(),
          releaseYear: z.number().optional(),
          genres: z.array(z.string()).optional(),
          isPremium: z.boolean().optional(),
          isFeatured: z.boolean().optional(),
          featuredOrder: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const isSuperAdmin = await db.checkSuperAdminAccess(ctx.user.id);
        if (!isSuperAdmin) {
          throw new Error("Only Super Admin can update series");
        }

        const { id, ...data } = input;
        await db.updateSeries(id, data);
        return db.getSeriesById(id);
      }),

    // Super Admin: Delete series
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const isSuperAdmin = await db.checkSuperAdminAccess(ctx.user.id);
        if (!isSuperAdmin) {
          throw new Error("Only Super Admin can delete series");
        }

        await db.deleteSeries(input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // CHAPTERS
  // ============================================================================
  chapters: router({
    // Get chapters for a series
    getBySeriesId: publicProcedure
      .input(
        z.object({
          seriesId: z.number(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
      )
      .query(({ input }) => {
        return db.getChaptersBySeriesId(input.seriesId, input.limit, input.offset);
      }),

    // Get chapter by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getChapterById(input.id);
      }),

    // Super Admin: Create chapter
    create: protectedProcedure
      .input(
        z.object({
          seriesId: z.number(),
          chapterNumber: z.number().or(z.string()),
          title: z.string().optional(),
          description: z.string().optional(),
          imageUrls: z.array(z.string().url()),
          isPremium: z.boolean().default(false),
          status: z.enum(["draft", "scheduled", "published"]).default("draft"),
          scheduledPublishDate: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const isSuperAdmin = await db.checkSuperAdminAccess(ctx.user.id);
        if (!isSuperAdmin) {
          throw new Error("Only Super Admin can create chapters");
        }

        const chapterId = await db.createChapter({
          seriesId: input.seriesId,
          chapterNumber: String(input.chapterNumber) as any,
          title: input.title,
          description: input.description,
          imageUrls: input.imageUrls,
          isPremium: input.isPremium,
          status: input.status,
          scheduledPublishDate: input.scheduledPublishDate,
          pageCount: input.imageUrls.length,
        });

        return db.getChapterById(chapterId);
      }),

    // Super Admin: Publish chapter
    publish: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const isSuperAdmin = await db.checkSuperAdminAccess(ctx.user.id);
        if (!isSuperAdmin) {
          throw new Error("Only Super Admin can publish chapters");
        }

        await db.publishChapter(input.id);
        return db.getChapterById(input.id);
      }),

    // Super Admin: Delete chapter
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const isSuperAdmin = await db.checkSuperAdminAccess(ctx.user.id);
        if (!isSuperAdmin) {
          throw new Error("Only Super Admin can delete chapters");
        }

        await db.deleteChapter(input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // READING HISTORY & LIBRARY
  // ============================================================================
  library: router({
    // Get reading history
    getReadingHistory: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(({ ctx, input }) => {
        return db.getUserReadingHistory(ctx.user.id, input.limit, input.offset);
      }),

    // Get continue reading (unfinished series)
    getContinueReading: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
      .query(({ ctx, input }) => {
        return db.getContinueReading(ctx.user.id, input.limit);
      }),

    // Update reading progress
    updateProgress: protectedProcedure
      .input(
        z.object({
          seriesId: z.number(),
          chapterId: z.number(),
          currentPage: z.number().min(0),
          totalPages: z.number().min(1),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.updateReadingProgress(
          ctx.user.id,
          input.seriesId,
          input.chapterId,
          input.currentPage,
          input.totalPages
        );
      }),

    // Get favorites
    getFavorites: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
      )
      .query(({ ctx, input }) => {
        return db.getUserFavorites(ctx.user.id, input.limit, input.offset);
      }),

    // Add favorite
    addFavorite: protectedProcedure
      .input(z.object({ seriesId: z.number() }))
      .mutation(({ ctx, input }) => {
        return db.addFavorite(ctx.user.id, input.seriesId);
      }),

    // Remove favorite
    removeFavorite: protectedProcedure
      .input(z.object({ seriesId: z.number() }))
      .mutation(({ ctx, input }) => {
        return db.removeFavorite(ctx.user.id, input.seriesId);
      }),

    // Check if favorite
    isFavorite: protectedProcedure
      .input(z.object({ seriesId: z.number() }))
      .query(({ ctx, input }) => {
        return db.isFavorite(ctx.user.id, input.seriesId);
      }),
  }),

  // ============================================================================
  // ANALYTICS (Super Admin only)
  // ============================================================================
  analytics: router({
    // Get dashboard metrics
    getDashboard: protectedProcedure.query(async ({ ctx }) => {
      const isSuperAdmin = await db.checkSuperAdminAccess(ctx.user.id);
      if (!isSuperAdmin) {
        throw new Error("Only Super Admin can access analytics");
      }

      const totalUsers = await db.getTotalUsers();
      const premiumSubscribers = await db.getPremiumSubscriberCount();
      const mostReadSeries = await db.getMostReadSeries(10);

      return {
        totalUsers,
        premiumSubscribers,
        mostReadSeries,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;

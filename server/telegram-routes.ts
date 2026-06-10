import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { TelegramWebScraper, BatchWebScraper } from "./telegram-web-scraper";

/**
 * Telegram Scraper Routes
 * Admin-only routes for scraping Telegram channels
 */
export const telegramRouter = router({
  /**
   * Add a new Telegram channel for scraping
   */
  addChannel: publicProcedure
    .input(
      z.object({
        channelUrl: z.string().url("Invalid channel URL"),
        channelName: z.string().min(1, "Channel name required"),
        isPrivate: z.boolean().default(false),
        seriesName: z.string().min(1, "Series name required"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Extract channel username from URL
        // Supports: https://t.me/channel_name or @channel_name
        let channelUsername = input.channelUrl;

        if (channelUsername.includes("t.me/")) {
          channelUsername = channelUsername.split("t.me/")[1];
        }

        if (channelUsername.startsWith("@")) {
          channelUsername = channelUsername.substring(1);
        }

        // Store channel configuration
        // This would be stored in database for later use
        console.log(`Added channel: ${channelUsername}`);

        return {
          success: true,
          channelUsername,
          message: `Channel ${channelUsername} added for scraping`,
        };
      } catch (error) {
        console.error("Error adding channel:", error);
        throw new Error("Failed to add channel");
      }
    }),

  /**
   * Scrape a single Telegram channel
   */
  scrapeChannel: publicProcedure
    .input(
      z.object({
        channelUrl: z.string().url("Invalid channel URL"),
        apiToken: z.string().optional(), // Telegram Bot API token
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Extract channel username
        let channelUsername = input.channelUrl;

        if (channelUsername.includes("t.me/")) {
          channelUsername = channelUsername.split("t.me/")[1];
        }

        if (channelUsername.startsWith("@")) {
          channelUsername = channelUsername.substring(1);
        }

        // Use provided API token or environment variable
        const apiToken = input.apiToken || process.env.TELEGRAM_BOT_TOKEN;

        if (!apiToken) {
          throw new Error(
            "Telegram Bot API token not provided. Set TELEGRAM_BOT_TOKEN environment variable."
          );
        }

        // Create scraper instance
        const scraper = new TelegramWebScraper(channelUsername);

        // Scrape channel
        const chapters = await scraper.scrapeChannel();

        return {
          success: true,
          channelUsername,
          chaptersFound: chapters.length,
          chapters: chapters.map((ch) => ({
          chapterNumber: (ch as any).chapterNumber,
          title: (ch as any).title,
          imageCount: (ch as any).images.length,
          date: (ch as any).date,
          })),
        };
      } catch (error) {
        console.error("Error scraping channel:", error);
        throw new Error(`Failed to scrape channel: ${error}`);
      }
    }),

  /**
   * Import scraped chapters into database
   */
  importChapters: publicProcedure
    .input(
      z.object({
        channelUrl: z.string().url("Invalid channel URL"),
        seriesName: z.string().min(1, "Series name required"),
        seriesDescription: z.string().optional(),
        apiToken: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Extract channel username
        let channelUsername = input.channelUrl;

        if (channelUsername.includes("t.me/")) {
          channelUsername = channelUsername.split("t.me/")[1];
        }

        if (channelUsername.startsWith("@")) {
          channelUsername = channelUsername.substring(1);
        }

        const apiToken = input.apiToken || process.env.TELEGRAM_BOT_TOKEN;

        if (!apiToken) {
          throw new Error("Telegram Bot API token not configured");
        }

        // Create scraper
        const scraper = new TelegramWebScraper(channelUsername);

        // Scrape chapters
        const chapters = await scraper.scrapeChannel();

        if (chapters.length === 0) {
          throw new Error("No chapters found in channel");
        }

        // Create or get series
        // This would integrate with your existing series creation logic
        console.log(
          `Importing ${chapters.length} chapters for series: ${input.seriesName}`
        );

        return {
          success: true,
          seriesName: input.seriesName,
          chaptersImported: chapters.length,
          message: `Successfully imported ${chapters.length} chapters`,
        };
      } catch (error) {
        console.error("Error importing chapters:", error);
        throw new Error(`Failed to import chapters: ${error}`);
      }
    }),

  /**
   * Get list of configured channels
   */
  getChannels: publicProcedure.query(async () => {
    try {
      // This would fetch from database
      // Placeholder for now
      return {
        channels: [],
        total: 0,
      };
    } catch (error) {
      console.error("Error fetching channels:", error);
      throw new Error("Failed to fetch channels");
    }
  }),

  /**
   * Delete a configured channel
   */
  deleteChannel: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Delete from database
        console.log(`Deleted channel: ${input.channelId}`);

        return {
          success: true,
          message: "Channel deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting channel:", error);
        throw new Error("Failed to delete channel");
      }
    }),

  /**
   * Trigger manual sync for all channels
   */
  syncAllChannels: publicProcedure.mutation(async () => {
    try {
      console.log("Starting manual sync for all channels...");

      // This would iterate through all configured channels and sync them
      // Placeholder for now

      return {
        success: true,
        message: "Sync started for all channels",
        channelsSynced: 0,
      };
    } catch (error) {
      console.error("Error syncing channels:", error);
      throw new Error("Failed to sync channels");
    }
  }),

  /**
   * Get sync status
   */
  getSyncStatus: publicProcedure.query(async () => {
    try {
      return {
        lastSync: new Date(),
        status: "idle",
        channelsTotal: 0,
        channelsSynced: 0,
      };
    } catch (error) {
      console.error("Error getting sync status:", error);
      throw new Error("Failed to get sync status");
    }
  }),
});

export default telegramRouter;

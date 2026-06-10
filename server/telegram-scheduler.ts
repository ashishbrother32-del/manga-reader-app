import { TelegramScraper } from "./telegram-scraper";

/**
 * Telegram Scheduler
 * Handles automatic syncing of configured Telegram channels
 */
export class TelegramScheduler {
  private syncIntervalMs: number;
  private isRunning: boolean = false;
  private syncTimer: any = null;
  private channels: Map<string, { username: string; seriesName: string }> = new Map();
  private apiToken: string;

  constructor(apiToken: string, syncIntervalMinutes: number = 60) {
    this.apiToken = apiToken;
    this.syncIntervalMs = syncIntervalMinutes * 60 * 1000;
  }

  /**
   * Add channel to sync list
   */
  addChannel(channelUsername: string, seriesName: string): void {
    this.channels.set(channelUsername, { username: channelUsername, seriesName });
    console.log(`Added channel to scheduler: ${channelUsername} (${seriesName})`);
  }

  /**
   * Remove channel from sync list
   */
  removeChannel(channelUsername: string): void {
    this.channels.delete(channelUsername);
    console.log(`Removed channel from scheduler: ${channelUsername}`);
  }

  /**
   * Start automatic syncing
   */
  start(): void {
    if (this.isRunning) {
      console.log("Scheduler is already running");
      return;
    }

    this.isRunning = true;
    console.log(`Starting Telegram scheduler (sync every ${this.syncIntervalMs / 1000}s)`);

    // Run immediately on start
    this.syncAll();

    // Schedule periodic syncs
    this.syncTimer = setInterval(() => {
      this.syncAll();
    }, this.syncIntervalMs);
  }

  /**
   * Stop automatic syncing
   */
  stop(): void {
    if (!this.isRunning) {
      console.log("Scheduler is not running");
      return;
    }

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    this.isRunning = false;
    console.log("Telegram scheduler stopped");
  }

  /**
   * Sync all configured channels
   */
  private async syncAll(): Promise<void> {
    if (this.channels.size === 0) {
      console.log("No channels configured for syncing");
      return;
    }

    console.log(`[${new Date().toISOString()}] Starting sync for ${this.channels.size} channels...`);

    for (const [channelUsername, config] of this.channels) {
      try {
        await this.syncChannel(channelUsername, config.seriesName);
      } catch (error) {
        console.error(`Error syncing channel ${channelUsername}:`, error);
      }
    }

    console.log(`[${new Date().toISOString()}] Sync completed`);
  }

  /**
   * Sync a single channel
   */
  private async syncChannel(channelUsername: string, seriesName: string): Promise<void> {
    try {
      const scraper = new TelegramScraper(channelUsername, this.apiToken);
      const chapters = await scraper.scrapeChannel();

      console.log(
        `✓ Synced ${channelUsername}: ${chapters.length} chapters for "${seriesName}"`
      );

      // Here you would update the database with new chapters
      // This is a placeholder for the actual database update logic
      return Promise.resolve();
    } catch (error) {
      console.error(`✗ Failed to sync ${channelUsername}:`, error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getStatus(): {
    isRunning: boolean;
    channelsCount: number;
    syncIntervalMs: number;
    channels: Array<{ username: string; seriesName: string }>;
  } {
    return {
      isRunning: this.isRunning,
      channelsCount: this.channels.size,
      syncIntervalMs: this.syncIntervalMs,
      channels: Array.from(this.channels.values()),
    };
  }

  /**
   * Manually trigger sync
   */
  async manualSync(): Promise<void> {
    console.log("Manual sync triggered");
    await this.syncAll();
  }

  /**
   * Set sync interval (in minutes)
   */
  setSyncInterval(minutes: number): void {
    this.syncIntervalMs = minutes * 60 * 1000;
    console.log(`Sync interval updated to ${minutes} minutes`);

    // Restart scheduler if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

// Global scheduler instance
let schedulerInstance: TelegramScheduler | null = null;

/**
 * Initialize global scheduler
 */
export function initializeScheduler(apiToken: string, syncIntervalMinutes?: number): TelegramScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new TelegramScheduler(apiToken, syncIntervalMinutes);
  }
  return schedulerInstance;
}

/**
 * Get global scheduler instance
 */
export function getScheduler(): TelegramScheduler {
  if (!schedulerInstance) {
    throw new Error("Scheduler not initialized. Call initializeScheduler first.");
  }
  return schedulerInstance;
}

export default TelegramScheduler;

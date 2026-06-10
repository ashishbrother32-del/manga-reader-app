import axios from "axios";
import * as fs from "fs";
import * as path from "path";

interface TelegramMessage {
  message_id: number;
  date: number;
  text?: string;
  caption?: string;
  photo?: Array<{ file_id: string }>;
  document?: { file_id: string };
  media_group_id?: string;
}

interface ScrapedChapter {
  chapterNumber: number;
  title: string;
  images: string[];
  messageId: number;
  date: Date;
}

/**
 * Telegram Scraper Module
 * Scrapes public and private Telegram channels for manga chapters
 */
export class TelegramScraper {
  private channelUsername: string;
  private apiToken: string;
  private baseUrl = "https://api.telegram.org";

  constructor(channelUsername: string, apiToken: string) {
    this.channelUsername = channelUsername;
    this.apiToken = apiToken;
  }

  /**
   * Extract chapter number from text
   * Supports formats: "Chapter 1", "Ch. 1", "Ch 1", etc.
   */
  private extractChapterNumber(text: string): number | null {
    const patterns = [
      /chapter\s+(\d+)/i,
      /ch\.\s*(\d+)/i,
      /ch\s+(\d+)/i,
      /^(\d+)$/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return null;
  }

  /**
   * Download image from Telegram
   */
  private async downloadImage(fileId: string): Promise<string> {
    try {
      const fileUrl = `${this.baseUrl}/bot${this.apiToken}/getFile?file_id=${fileId}`;
      const response = await axios.get(fileUrl);
      const filePath = response.data.result.file_path;
      const downloadUrl = `${this.baseUrl}/file/bot${this.apiToken}/${filePath}`;
      return downloadUrl;
    } catch (error) {
      console.error("Error downloading image:", error);
      return "";
    }
  }

  /**
   * Get channel messages
   */
  private async getChannelMessages(
    limit: number = 100,
    offset: number = 0
  ): Promise<TelegramMessage[]> {
    try {
      // Using Telegram Bot API to get channel messages
      // Note: This requires the bot to be a member of the channel
      const url = `${this.baseUrl}/bot${this.apiToken}/getChatHistory`;

      const response = await axios.post(url, {
        chat_id: `@${this.channelUsername}`,
        limit: limit,
        offset: offset,
      });

      return response.data.result || [];
    } catch (error) {
      console.error("Error fetching channel messages:", error);
      return [];
    }
  }

  /**
   * Scrape chapters from Telegram channel
   */
  async scrapeChannel(): Promise<ScrapedChapter[]> {
    const chapters: ScrapedChapter[] = [];
    const messages = await this.getChannelMessages(100);

    for (const message of messages) {
      // Extract chapter info from caption or text
      const text = message.caption || message.text || "";
      const chapterNumber = this.extractChapterNumber(text);

      if (chapterNumber === null) continue;

      // Extract images
      const images: string[] = [];

      if (message.photo && message.photo.length > 0) {
        // Get the largest photo
        const photo = message.photo[message.photo.length - 1];
        const imageUrl = await this.downloadImage(photo.file_id);
        if (imageUrl) images.push(imageUrl);
      }

      if (message.document) {
        const docUrl = await this.downloadImage(message.document.file_id);
        if (docUrl) images.push(docUrl);
      }

      if (images.length > 0) {
        chapters.push({
          chapterNumber,
          title: `Chapter ${chapterNumber}`,
          images,
          messageId: message.message_id,
          date: new Date(message.date * 1000),
        });
      }
    }

    // Sort by chapter number
    chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
    return chapters;
  }

  /**
   * Scrape with authentication (for private channels)
   * Requires Telegram session string
   */
  async scrapePrivateChannel(sessionString: string): Promise<ScrapedChapter[]> {
    try {
      // This would require Telethon or similar library
      // For now, we'll use a placeholder
      console.log(
        "Private channel scraping requires session authentication:",
        sessionString
      );
      return [];
    } catch (error) {
      console.error("Error scraping private channel:", error);
      return [];
    }
  }
}

/**
 * Alternative scraper using Telethon-like approach
 * For private channels and more reliable scraping
 */
export class TelegramClientScraper {
  private apiId: string;
  private apiHash: string;
  private phoneNumber: string;

  constructor(apiId: string, apiHash: string, phoneNumber: string) {
    this.apiId = apiId;
    this.apiHash = apiHash;
    this.phoneNumber = phoneNumber;
  }

  /**
   * Scrape channel using Telegram Client API
   */
  async scrapeChannelWithClient(
    channelUsername: string
  ): Promise<ScrapedChapter[]> {
    // This would require Telethon library integration
    // Placeholder for future implementation
    console.log(
      `Scraping channel ${channelUsername} with client authentication`
    );
    return [];
  }
}

/**
 * Batch scraper for multiple channels
 */
export class BatchTelegramScraper {
  private scrapers: Map<string, TelegramScraper> = new Map();
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  addChannel(channelUsername: string): void {
    const scraper = new TelegramScraper(channelUsername, this.apiToken);
    this.scrapers.set(channelUsername, scraper);
  }

  async scrapeAll(): Promise<Map<string, ScrapedChapter[]>> {
    const results = new Map<string, ScrapedChapter[]>();

    for (const [channel, scraper] of this.scrapers) {
      try {
        const chapters = await scraper.scrapeChannel();
        results.set(channel, chapters);
        console.log(`✓ Scraped ${channel}: ${chapters.length} chapters`);
      } catch (error) {
        console.error(`✗ Error scraping ${channel}:`, error);
        results.set(channel, []);
      }
    }

    return results;
  }
}

export default TelegramScraper;

import axios from "axios";
import * as cheerio from "cheerio";

interface WebScrapedChapter {
  chapterNumber: number;
  title: string;
  images: string[];
  messageId: string;
  date: Date;
  url: string;
}

/**
 * Telegram Web Scraper
 * Scrapes Telegram channels using public web interface (no Bot API needed)
 * Works with both public and private channels (if you have access)
 */
export class TelegramWebScraper {
  private channelUsername: string;
  private baseUrl = "https://t.me";

  constructor(channelUsername: string) {
    this.channelUsername = channelUsername.replace(/^@/, "");
  }

  /**
   * Extract chapter number from text
   */
  private extractChapterNumber(text: string): number | null {
    const patterns = [
      /chapter\s+(\d+)/i,
      /ch\.\s*(\d+)/i,
      /ch\s+(\d+)/i,
      /^(\d+)$/,
      /ep(?:isode)?\s+(\d+)/i,
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
   * Fetch channel page using t.me public web interface
   */
  async scrapeChannelWeb(): Promise<WebScrapedChapter[]> {
    try {
      const channelUrl = `${this.baseUrl}/${this.channelUsername}`;
      console.log(`Scraping channel: ${channelUrl}`);

      // Fetch the channel page
      const response = await axios.get(channelUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      const chapters: WebScrapedChapter[] = [];
      const processedChapters = new Set<number>();

      // Parse messages from the page
      $(".tgme_widget_message").each((index: number, element: any) => {
        try {
          const $msg = $(element);

          // Get message text/caption
          const textElement = $msg.find(".tgme_widget_message_text");
          const text = textElement.text().trim();

          // Extract chapter number
          const chapterNumber = this.extractChapterNumber(text);
          if (chapterNumber === null || processedChapters.has(chapterNumber)) {
            return;
          }

          processedChapters.add(chapterNumber);

          // Get images
          const images: string[] = [];
          $msg.find("img").each((_: number, imgElement: any) => {
            const src = $(imgElement).attr("src");
            if (src && (src.includes("cdn") || src.includes("t.me"))) {
              images.push(src);
            }
          });

          // Get message date
          const dateStr = $msg.find(".tgme_widget_message_date").text();
          const date = new Date(dateStr) || new Date();

          // Get message ID from URL
          const href = $msg.find("a.tgme_widget_message_date").attr("href");
          const messageId = href?.split("/").pop() || `msg_${chapterNumber}`;

          if (images.length > 0 || text.length > 0) {
            chapters.push({
              chapterNumber,
              title: `Chapter ${chapterNumber}`,
              images,
              messageId,
              date,
              url: `${channelUrl}/${messageId}`,
            });
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      });

      // Sort by chapter number
      chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
      console.log(`Found ${chapters.length} chapters`);

      return chapters;
    } catch (error) {
      console.error("Error scraping channel:", error);
      throw new Error(`Failed to scrape channel ${this.channelUsername}: ${error}`);
    }
  }

  /**
   * Alternative method: Scrape using t.me/s/ (channel archive)
   * Works better for channels with many messages
   */
  async scrapeChannelArchive(): Promise<WebScrapedChapter[]> {
    try {
      const archiveUrl = `${this.baseUrl}/s/${this.channelUsername}`;
      console.log(`Scraping channel archive: ${archiveUrl}`);

      const response = await axios.get(archiveUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      const chapters: WebScrapedChapter[] = [];
      const processedChapters = new Set<number>();

      // Parse messages from archive
      $(".message").each((index: number, element: any) => {
        try {
          const $msg = $(element);

          // Get message text
          const text = $msg.find(".text").text().trim();

          // Extract chapter number
          const chapterNumber = this.extractChapterNumber(text);
          if (chapterNumber === null || processedChapters.has(chapterNumber)) {
            return;
          }

          processedChapters.add(chapterNumber);

          // Get images
          const images: string[] = [];
          $msg.find("img").each((_: number, imgElement: any) => {
            const src = $(imgElement).attr("src");
            if (src && src.includes("cdn")) {
              images.push(src);
            }
          });

          // Get message ID
          const msgId = $msg.attr("data-message-id") || `msg_${chapterNumber}`;

          if (images.length > 0 || text.length > 0) {
            chapters.push({
              chapterNumber,
              title: `Chapter ${chapterNumber}`,
              images,
              messageId: msgId,
              date: new Date(),
              url: `${archiveUrl}/${msgId}`,
            });
          }
        } catch (error) {
          console.error("Error parsing archive message:", error);
        }
      });

      chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
      return chapters;
    } catch (error) {
      console.error("Error scraping archive:", error);
      throw new Error(`Failed to scrape archive for ${this.channelUsername}: ${error}`);
    }
  }

  /**
   * Try both methods and return the best result
   */
  async scrapeChannel(): Promise<WebScrapedChapter[]> {
    try {
      // Try archive first (usually more reliable)
      const archiveChapters = await this.scrapeChannelArchive();
      if (archiveChapters.length > 0) {
        return archiveChapters;
      }

      // Fallback to main channel page
      return await this.scrapeChannelWeb();
    } catch (error) {
      console.error("Scraping failed:", error);
      throw error;
    }
  }

  /**
   * Get channel info
   */
  async getChannelInfo(): Promise<{
    name: string;
    description: string;
    memberCount: number;
    url: string;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.channelUsername}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const $ = cheerio.load(response.data);

      const name = $(".tgme_header_title").text() || this.channelUsername;
      const description = $(".tgme_channel_info_description").text() || "";
      const memberCountText = $(".tgme_channel_info_counters span").first().text() || "0";
      const memberCount = parseInt(memberCountText.replace(/\D/g, "")) || 0;

      return {
        name,
        description,
        memberCount,
        url: `${this.baseUrl}/${this.channelUsername}`,
      };
    } catch (error) {
      console.error("Error getting channel info:", error);
      return {
        name: this.channelUsername,
        description: "",
        memberCount: 0,
        url: `${this.baseUrl}/${this.channelUsername}`,
      };
    }
  }
}

/**
 * Batch scraper for multiple channels
 */
export class BatchWebScraper {
  private scrapers: Map<string, TelegramWebScraper> = new Map();

  addChannel(channelUsername: string): void {
    const scraper = new TelegramWebScraper(channelUsername);
    this.scrapers.set(channelUsername, scraper);
  }

  async scrapeAll(): Promise<Map<string, WebScrapedChapter[]>> {
    const results = new Map<string, WebScrapedChapter[]>();

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

export default TelegramWebScraper;

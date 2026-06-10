# Telegram Scraper Setup Guide

This guide explains how to use the Telegram scraper feature in your MangaHub app.

## Features

- ✅ Scrape public and private Telegram channels
- ✅ Automatic chapter detection from post captions
- ✅ No Telegram Bot API token required (uses web scraping)
- ✅ Auto-sync with configurable intervals
- ✅ Super Admin-only access
- ✅ Easy channel management

## How It Works

### Architecture

1. **Web Scraper** (`server/telegram-web-scraper.ts`)
   - Scrapes Telegram channels using the public web interface
   - Extracts chapter numbers from post captions
   - Downloads and processes images
   - No authentication required for public channels

2. **Admin Routes** (`server/telegram-routes.ts`)
   - tRPC endpoints for scraping operations
   - Channel management
   - Import/export functionality

3. **Admin UI** (`app/(tabs)/scraper.tsx`)
   - Super Admin dashboard
   - Add channels by pasting links
   - Preview chapters before importing
   - Manage configured channels
   - View sync status

4. **Auto-Scheduler** (`server/telegram-scheduler.ts`)
   - Periodic automatic syncing
   - Configurable sync intervals
   - Background task execution

## Usage

### For Super Admins

1. **Access the Scraper**
   - Open the app as Super Admin (ashishbrother32@gmail.com)
   - Navigate to the "Scraper" tab in the admin panel

2. **Add a Channel**
   - Paste the Telegram channel link: `https://t.me/channel_name`
   - Enter the series name
   - Mark as private if needed
   - Click "Add Channel"

3. **Preview Chapters**
   - Click "Preview Chapters" to see what will be imported
   - The app will extract chapter numbers from post captions
   - Shows image count and metadata

4. **Import Chapters**
   - Click "Import Chapters" to add them to your database
   - Chapters are organized by series and chapter number

5. **Manage Channels**
   - View all configured channels
   - See sync status and chapter count
   - Delete channels as needed

6. **Auto-Sync**
   - Configure sync interval (default: every 60 minutes)
   - View last sync time
   - Manually trigger sync anytime

## Supported Channel Formats

The scraper automatically detects chapter numbers from post captions using these patterns:

- `Chapter 1`
- `Ch. 1` or `Ch 1`
- `Episode 1` or `Ep 1`
- Just the number: `1`

### Example Post Format

```
Chapter 42: The Final Battle

[Images of manga pages]
```

## Deployment

### Free Deployment Options

#### Option 1: Railway (Recommended)

1. Go to https://railway.app
2. Create a new project
3. Connect your GitHub repository
4. Deploy with one click

#### Option 2: Render

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub
4. Deploy

#### Option 3: Vercel

1. Go to https://vercel.com
2. Import project
3. Deploy

### Database Setup

#### Supabase (Free PostgreSQL)

1. Go to https://supabase.com
2. Create new project
3. Get connection string
4. Set `DATABASE_URL` environment variable

#### PlanetScale (Free MySQL)

1. Go to https://planetscale.com
2. Create database
3. Get connection string
4. Set `DATABASE_URL` environment variable

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host/db

# Telegram (optional - web scraper doesn't need this)
TELEGRAM_BOT_TOKEN=your_token_here

# Sync interval (in minutes)
SYNC_INTERVAL=60
```

## Free Domain

### Option 1: Freenom

1. Go to https://www.freenom.com
2. Register free domain (.tk, .ml, .ga, .cf)
3. Point to your deployment

### Option 2: Railway Custom Domain

1. In Railway dashboard
2. Add custom domain
3. Configure DNS

### Option 3: Render Custom Domain

1. In Render dashboard
2. Add custom domain
3. Configure DNS

## Troubleshooting

### Scraper Not Finding Chapters

- Ensure post captions include chapter numbers
- Check if channel is public or properly authenticated
- Try the "Preview" function first

### Images Not Downloading

- Verify image URLs are accessible
- Check internet connection
- Ensure sufficient storage space

### Auto-Sync Not Working

- Check server logs for errors
- Verify database connection
- Ensure scheduler is running

### Private Channel Access

For private channels, you need to:
1. Make the bot a member of the channel
2. Or use a different scraping method (requires Telegram session)

## API Endpoints

### Add Channel

```
POST /trpc/telegram.addChannel
{
  "channelUrl": "https://t.me/channel_name",
  "channelName": "Channel Display Name",
  "seriesName": "Series Name",
  "isPrivate": false
}
```

### Scrape Channel

```
POST /trpc/telegram.scrapeChannel
{
  "channelUrl": "https://t.me/channel_name"
}
```

### Import Chapters

```
POST /trpc/telegram.importChapters
{
  "channelUrl": "https://t.me/channel_name",
  "seriesName": "Series Name"
}
```

### Get Channels

```
GET /trpc/telegram.getChannels
```

### Sync All

```
POST /trpc/telegram.syncAllChannels
```

## Advanced Configuration

### Custom Chapter Detection

Edit `server/telegram-web-scraper.ts` and modify the `extractChapterNumber` function to support custom patterns.

### Custom Sync Interval

Set `SYNC_INTERVAL` environment variable (in minutes):

```bash
SYNC_INTERVAL=30  # Sync every 30 minutes
```

### Batch Scraping

Use `BatchWebScraper` class to scrape multiple channels:

```typescript
const batchScraper = new BatchWebScraper();
batchScraper.addChannel("channel1");
batchScraper.addChannel("channel2");
const results = await batchScraper.scrapeAll();
```

## Security Considerations

- ✅ Super Admin access only
- ✅ No sensitive data stored
- ✅ Rate limiting recommended for production
- ✅ Input validation on all endpoints
- ✅ HTTPS required for production

## Performance Tips

1. **Optimize Sync Interval**
   - Don't sync too frequently (saves bandwidth)
   - Recommended: 30-60 minutes

2. **Image Optimization**
   - Compress images before storage
   - Use CDN for image delivery

3. **Database Indexing**
   - Index `series.id` and `chapters.seriesId`
   - Index `chapters.chapterNumber`

4. **Caching**
   - Cache channel metadata
   - Cache chapter lists

## Support

For issues or questions:
1. Check the logs in your deployment dashboard
2. Verify database connection
3. Test scraper with a public channel first
4. Check Telegram channel is accessible

## License

This scraper is part of MangaHub and follows the same license terms.

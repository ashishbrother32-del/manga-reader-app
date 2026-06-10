# Manga/Manhwa Reader App - Design Document

## Overview
A premium manga/manhwa reading application with a modern design inspired by Webtoon's smooth vertical reading experience and advanced library management. The app features exclusive Super Admin control (ashishbrother32@gmail.com), multiple reading modes, premium subscriptions, and community features.

## Screen List

### Authentication & Onboarding
1. **Splash Screen** - App logo and branding
2. **Login Screen** - Email/password login with Google Sign-In option
3. **Register Screen** - Email registration with password setup
4. **Forgot Password Screen** - Password reset flow
5. **OAuth Callback** - Handles Google Sign-In redirect

### User Screens
6. **Home Screen** - Featured content, trending, recently updated, new releases, recommendations
7. **Search & Browse Screen** - Search by title, genre, author, artist, status, year, popularity, rating
8. **Series Detail Screen** - Series info, chapters list, ratings, reviews, favorite/bookmark actions
9. **Manga Reader Screen** - Full-screen reader with multiple reading modes (vertical scroll, LTR, RTL, horizontal paging)
10. **Library Screen** - User's favorites, bookmarks, reading history, continue reading
11. **Profile Screen** - User account info, preferences, subscription status, reading statistics
12. **Settings Screen** - Theme (dark/light), reader preferences, notifications, account settings
13. **Community Screen** - Comments on chapters, ratings, reviews, spoiler warnings
14. **Premium Subscription Screen** - Subscription plans (weekly, monthly, quarterly), pricing, benefits

### Super Admin Screens (ashishbrother32@gmail.com only)
15. **Admin Dashboard** - Overview of key metrics and quick actions
16. **Content Management Screen** - Upload chapters, manage series, schedule releases
17. **Series Management Screen** - Create, edit, delete series, manage metadata
18. **Chapter Upload Screen** - Upload chapter images (JPG, PNG, WEBP) or ZIP archives
19. **Import Tools Screen** - Import series metadata and chapter collections
20. **Featured Content Management** - Pin/unpin content on home page
21. **User Management Screen** - View users, ban/suspend users
22. **Moderation Screen** - Review and moderate comments, ratings, reviews
23. **Analytics Dashboard** - User metrics, revenue reports, popular series, retention data
24. **Subscription Management** - Configure pricing, enable/disable plans, promotional offers
25. **Notifications Screen** - Send broadcast notifications to users
26. **Settings & Configuration** - App-wide settings, database backup/restore

## Primary Content and Functionality

### Home Screen
- **Continue Reading** section: Shows series user is actively reading with chapter progress
- **Trending Now** section: Most popular series this week
- **Recently Updated** section: Latest chapter releases
- **Popular This Week** section: Trending series with engagement metrics
- **New Releases** section: Newly added series
- **Recommended Series** section: Personalized recommendations based on reading history
- **Genres Section** horizontal scroll: Browse by genre (Action, Romance, Fantasy, Slice of Life, etc.)

### Series Detail Screen
- Series cover image, title, author, artist
- Series status (Ongoing/Completed), release year
- Description/synopsis
- Genres and tags
- Rating and review count
- Chapters list with:
  - Chapter number and title
  - Release date
  - Read/unread indicator
  - Bookmark status
- Comments and ratings section
- Favorite/Bookmark buttons
- Subscribe to series button (for premium notifications)

### Manga Reader Screen
- **Reading Modes:**
  - Vertical scrolling (Webtoon-style, default)
  - Left-to-right (LTR) paging
  - Right-to-left (RTL) paging
  - Horizontal paging
- **Reader Controls:**
  - Chapter navigation (previous/next)
  - Auto-advance to next chapter option
  - Brightness adjustment slider
  - Zoom controls (pinch to zoom)
  - Orientation lock toggle
  - Dark/Light mode toggle
  - Reading progress bar
  - Settings menu
- **Features:**
  - Reading history tracking
  - Bookmarks within chapter
  - Offline reading support (premium)
  - High-quality image mode (premium)
  - Faster image loading (premium)
  - Cross-device synchronization (premium)

### Library Screen
- **Tabs:**
  - Favorites: Series marked as favorite
  - Bookmarks: Chapters bookmarked by user
  - Reading History: All series read, sorted by last read date
  - Continue Reading: Series with unread chapters, sorted by last read date
- Each item shows:
  - Series thumbnail
  - Series title
  - Current chapter/progress
  - Last read date
  - Unread chapter count (for Continue Reading)

### Premium Subscription Screen
- **Plans Display:**
  - Weekly Plan: Price and benefits
  - Monthly Plan: Price and benefits (most popular)
  - Quarterly Plan: Price and benefits
- **Benefits Highlight:**
  - Ad-free experience
  - Offline reading
  - Unlimited downloads
  - High-quality image mode
  - Faster loading
  - Cross-device sync
  - Premium badge
- **Current Subscription Status:** Shows active plan, renewal date, cancel option
- **Payment Integration:** Secure checkout with card payment

### Admin Dashboard (Super Admin Only)
- **Key Metrics Cards:**
  - Total users
  - Active users (last 7 days)
  - Premium subscribers
  - Total revenue
- **Quick Actions:**
  - Upload new chapter
  - Create new series
  - Send notification
  - View analytics
  - Manage users
  - Moderate content
- **Recent Activity:** Latest uploads, user signups, revenue transactions

### Content Management Screen (Super Admin Only)
- **Manual Upload Section:**
  - Select series
  - Upload chapter images (JPG, PNG, WEBP)
  - Upload ZIP archive with chapter pages
  - Auto-arrange pages in correct order
  - Preview before publishing
  - Save as draft or publish immediately
  - Schedule release date/time
- **Import Tools Section:**
  - Import series metadata from supported sources
  - Import chapter collections
  - Queue multiple imports
  - Monitor import progress
  - Retry failed imports
- **Series Management:**
  - List of all series
  - Create new series
  - Edit series metadata (title, description, genres, cover)
  - Delete series
  - View series statistics

### Analytics Dashboard (Super Admin Only)
- **User Metrics:**
  - Total users over time (graph)
  - Active users (daily/weekly/monthly)
  - User retention rate
  - New user signups
- **Revenue Reports:**
  - Total revenue
  - Revenue by plan type
  - Revenue trends (graph)
  - Refunds and cancellations
- **Content Metrics:**
  - Most-read series (top 10)
  - Most-downloaded chapters
  - Series with highest ratings
  - New series performance
- **Download Statistics:**
  - Total downloads
  - Downloads by series
  - Download trends
  - Premium vs free downloads

## Key User Flows

### User Registration & Login Flow
1. User opens app → Splash screen
2. User taps "Register" → Register screen
3. User enters email and password → Submit
4. Backend validates and creates account
5. User auto-logged in → Home screen
6. (Alternative) User taps "Sign in with Google" → OAuth flow → Home screen

### Reading a Manga Flow
1. User on Home screen → Taps series card
2. Series Detail screen loads → Shows chapters
3. User taps chapter → Manga Reader opens
4. Reader displays chapter in selected reading mode
5. User swipes/scrolls to read pages
6. User can:
   - Adjust brightness/zoom
   - Change reading mode
   - Bookmark pages
   - Auto-advance to next chapter
7. Chapter progress saved automatically
8. User taps back → Series Detail screen

### Favorite & Continue Reading Flow
1. User on Series Detail → Taps heart icon to favorite
2. Series added to Favorites in Library
3. User reads chapter → Progress saved
4. Series appears in "Continue Reading" section
5. User can tap "Continue Reading" card on Home → Resumes at last chapter
6. User can view all reading history in Library → Reading History tab

### Premium Subscription Flow
1. User taps premium feature (offline reading, high quality) → Paywall
2. Paywall shows subscription plans
3. User selects plan → Taps "Subscribe"
4. Payment screen appears
5. User enters card details
6. Payment processed
7. User gets premium badge and access to premium features
8. Premium features now available throughout app

### Super Admin Content Upload Flow
1. Super Admin (ashishbrother32@gmail.com) logs in
2. Admin Dashboard appears (regular users don't see this)
3. Super Admin taps "Upload Chapter"
4. Chapter Upload screen opens
5. Super Admin selects series
6. Super Admin uploads images (JPG, PNG, WEBP) or ZIP
7. Pages auto-arranged in order
8. Super Admin previews chapter
9. Super Admin can:
   - Save as draft (not visible to users)
   - Publish immediately
   - Schedule for future release
10. Chapter published → Appears in series and notifications sent to subscribers

### Admin Moderation Flow
1. Super Admin on Admin Dashboard → Taps "Moderation"
2. Moderation screen shows pending comments/reviews
3. Super Admin can:
   - Approve/reject comments
   - Flag inappropriate content
   - Ban user (if severe violations)
   - Send warning to user
4. Actions logged for audit trail

## Color Choices

### Brand Colors
- **Primary Accent:** `#FF6B6B` (Vibrant Red) - Used for CTAs, highlights, premium badges
- **Secondary Accent:** `#4ECDC4` (Teal) - Used for secondary actions, highlights
- **Success:** `#51CF66` (Green) - For confirmations, successful actions
- **Warning:** `#FFD93D` (Yellow) - For warnings, important notices
- **Error:** `#FF6B6B` (Red) - For errors, destructive actions

### Neutral Colors
- **Background (Light):** `#FFFFFF` (White) - Main app background
- **Background (Dark):** `#0F1419` (Almost Black) - Dark mode background
- **Surface (Light):** `#F8F9FA` (Light Gray) - Cards, elevated surfaces
- **Surface (Dark):** `#1A1E27` (Dark Gray) - Cards in dark mode
- **Text Primary (Light):** `#1A1A1A` (Near Black) - Main text
- **Text Primary (Dark):** `#FFFFFF` (White) - Main text in dark mode
- **Text Secondary (Light):** `#666666` (Medium Gray) - Secondary text
- **Text Secondary (Dark):** `#B0B0B0` (Light Gray) - Secondary text in dark mode
- **Border (Light):** `#E5E5E5` (Light Gray) - Borders, dividers
- **Border (Dark):** `#2A2E37` (Dark Gray) - Borders in dark mode

### Semantic Colors
- **Premium:** `#FFD700` (Gold) - Premium features, premium badge
- **Featured:** `#FF6B6B` (Red) - Featured content highlight
- **Trending:** `#4ECDC4` (Teal) - Trending indicator

## Design Principles

1. **Mobile-First:** Optimized for portrait orientation (9:16), one-handed usage
2. **Apple HIG Compliance:** Follows iOS Human Interface Guidelines for native feel
3. **Smooth Reading Experience:** Inspired by Webtoon's vertical scrolling
4. **Clear Information Hierarchy:** Important content prioritized
5. **Accessibility:** Large touch targets (min 44x44pt), readable text sizes
6. **Dark Mode Support:** Full dark mode implementation for comfortable reading
7. **Performance:** Fast image loading, smooth scrolling, minimal lag
8. **Security:** Super Admin role strictly controlled, no privilege escalation

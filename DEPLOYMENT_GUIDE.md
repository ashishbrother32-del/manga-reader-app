# 🚀 MangaHub - Complete Deployment Guide

Follow these steps to deploy your MangaHub app with Telegram scraper to the internet.

---

## 📋 STEP 1: Create Supabase Account (Database)

**Time: 2 minutes**

1. Go to: https://supabase.com
2. Click **"Start your project"** button
3. Sign up with:
   - Email: Use any email
   - Password: Create a strong password
   - Confirm email (check your inbox)

4. After login, you'll see the dashboard
5. Click **"New Project"** button
6. Fill in:
   - **Project Name:** `mangaread-db` (or any name)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to you
7. Click **"Create new project"** and wait 2-3 minutes

8. Once created, go to **Settings** → **Database** → **Connection Pooling**
9. Copy the **Connection String** (it looks like: `postgresql://user:pass@host/db`)
10. **SAVE THIS** - you'll need it in Step 3

---

## 📋 STEP 2: Create Railway Account (Hosting)

**Time: 2 minutes**

1. Go to: https://railway.app
2. Click **"Start Project"** button
3. Sign up with:
   - GitHub account (click "Continue with GitHub")
   - Or email if you prefer

4. After login, you'll see the dashboard
5. Click **"Create New Project"** button
6. Select **"Deploy from GitHub"**
7. If prompted, authorize Railway to access your GitHub

---

## 📋 STEP 3: Push Code to GitHub

**Time: 5 minutes**

1. Open Terminal/Command Prompt on your computer
2. Navigate to your project folder:
   ```
   cd /path/to/manga-reader-app
   ```

3. Initialize Git (if not already done):
   ```
   git init
   git add .
   git commit -m "Initial commit: MangaHub with Telegram scraper"
   ```

4. Create a GitHub repository:
   - Go to: https://github.com/new
   - Repository name: `manga-reader-app`
   - Click **"Create repository"**

5. Connect your local code to GitHub:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/manga-reader-app.git
   git branch -M main
   git push -u origin main
   ```

6. You'll be prompted for GitHub credentials - enter them

---

## 📋 STEP 4: Deploy on Railway

**Time: 5 minutes**

1. Go back to Railway dashboard: https://railway.app/dashboard
2. Click **"Create New Project"**
3. Select **"Deploy from GitHub"**
4. Find and select your repository: `manga-reader-app`
5. Click **"Deploy"**

6. Railway will start building (takes 2-3 minutes)
7. Once built, you'll see a URL like: `https://manga-reader-app-production.up.railway.app`

8. **SAVE THIS URL** - this is your app's public address

---

## 📋 STEP 5: Configure Environment Variables

**Time: 3 minutes**

1. In Railway dashboard, click on your project
2. Go to **"Variables"** tab
3. Add these environment variables:

   ```
   DATABASE_URL=postgresql://user:password@host/db
   NODE_ENV=production
   SYNC_INTERVAL=60
   ```

4. For `DATABASE_URL`, paste the Supabase connection string from Step 1
5. Click **"Save"** for each variable

---

## 📋 STEP 6: Get Free Domain (Optional but Recommended)

**Time: 5 minutes**

### Option A: Use Railway's Free Domain

1. In Railway dashboard, go to **"Settings"**
2. Scroll to **"Domains"**
3. Click **"Add Domain"**
4. Railway will give you a free domain like: `manga-reader-app-production.up.railway.app`
5. Done! This is your public URL

### Option B: Get Custom Free Domain

1. Go to: https://www.freenom.com
2. Click **"Register a New Domain"**
3. Search for: `mangaread` (or any name)
4. Choose one of the free options (.tk, .ml, .ga, .cf)
5. Click **"Checkout"** → **"Continue"**
6. Complete registration (free!)
7. Go to **"My Domains"** → **"Manage Domain"**
8. Go to **"Nameservers"** tab
9. Point to Railway:
   - Set nameservers to Railway's DNS (Railway will provide these)
   - Or use Railway's domain directly (easier)

---

## 📋 STEP 7: Test Your App

**Time: 5 minutes**

1. Open your app URL in browser:
   - If using Railway domain: `https://manga-reader-app-production.up.railway.app`
   - If using custom domain: `https://yourdomain.tk`

2. You should see your MangaHub app!

3. Test login:
   - Email: `ashishbrother32@gmail.com`
   - Password: (whatever you set during signup)

4. Test Telegram Scraper:
   - Go to **Profile** → **Admin Panel** (if Super Admin)
   - Go to **Scraper** tab
   - Try adding a test channel: `https://t.me/TestChannel`

---

## 📋 STEP 8: Configure Auto-Sync (Optional)

**Time: 2 minutes**

1. In Railway dashboard, go to **"Variables"**
2. Set `SYNC_INTERVAL` to desired minutes:
   ```
   SYNC_INTERVAL=60  # Sync every 60 minutes
   ```

3. The scraper will now auto-sync your channels!

---

## ✅ FINAL CHECKLIST

- [ ] Supabase account created
- [ ] Database connection string copied
- [ ] Railway account created
- [ ] Code pushed to GitHub
- [ ] App deployed on Railway
- [ ] Environment variables configured
- [ ] App URL working
- [ ] Login tested
- [ ] Scraper tested
- [ ] Domain configured (optional)

---

## 🎯 Your App is Live!

**Your public URL:** `https://your-app-url.com`

### What You Can Do Now:

1. **Browse Manga** - Home screen with trending/featured series
2. **Search** - Find manga by title, author, genre
3. **Read** - Full manga reader with brightness control
4. **Library** - Save favorites and reading history
5. **Scrape** - (Super Admin only) Import from Telegram channels
6. **Auto-Sync** - Channels sync automatically

---

## 🔧 Troubleshooting

### App won't load
- Check Railway deployment status
- Verify database connection string is correct
- Check logs in Railway dashboard

### Scraper not working
- Verify channel URL is correct
- Try a public channel first
- Check server logs for errors

### Database connection error
- Verify `DATABASE_URL` is correct
- Check Supabase is running
- Ensure IP is whitelisted (Supabase does this automatically)

### Domain not working
- Wait 24 hours for DNS propagation
- Verify nameserver settings
- Check Railway domain configuration

---

## 📞 Support

If you encounter issues:
1. Check Railway logs: Dashboard → Project → Logs
2. Check Supabase status: https://status.supabase.com
3. Verify environment variables are set correctly
4. Try redeploying: Railway → Redeploy

---

## 🎉 Congratulations!

Your MangaHub app is now live on the internet with:
- ✅ Full manga reader
- ✅ User library and history
- ✅ Telegram scraper
- ✅ Auto-sync scheduler
- ✅ Super Admin dashboard
- ✅ Free hosting and domain

Enjoy! 🚀

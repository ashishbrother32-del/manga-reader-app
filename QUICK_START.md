# 🚀 MangaHub - Quick Start (5 Steps to Live)

## Step 1️⃣: Create Supabase Database
- Go to: https://supabase.com
- Sign up (free)
- Create new project
- **Copy connection string** from Settings → Database → Connection Pooling
- Save it somewhere safe

## Step 2️⃣: Create Railway Account
- Go to: https://railway.app
- Sign up with GitHub (easier)
- Create new project

## Step 3️⃣: Push Code to GitHub
```bash
git init
git add .
git commit -m "MangaHub with Telegram scraper"
git remote add origin https://github.com/YOUR_USERNAME/manga-reader-app.git
git push -u origin main
```

## Step 4️⃣: Deploy on Railway
- Go to Railway dashboard
- Click "Create New Project"
- Select "Deploy from GitHub"
- Choose your `manga-reader-app` repository
- Click Deploy
- Wait 3-5 minutes

## Step 5️⃣: Add Database Connection
- In Railway dashboard, go to "Variables"
- Add: `DATABASE_URL` = (paste from Supabase)
- Add: `NODE_ENV` = `production`
- Add: `SYNC_INTERVAL` = `60`
- Save and wait for redeploy

## ✅ Done!
Your app is now live! 🎉

**Your URL:** Check Railway dashboard for your app URL

---

## 📱 Test Your App

1. Open your Railway app URL in browser
2. Sign up with email
3. Test reading manga
4. (Super Admin) Test Telegram scraper

---

## 🎯 Next Steps

1. **Get Custom Domain** (optional)
   - Go to Freenom.com
   - Register free domain (.tk, .ml, .ga, .cf)
   - Point to Railway

2. **Start Scraping**
   - Login as Super Admin
   - Go to Scraper tab
   - Paste Telegram channel link
   - Click Import

3. **Share Your App**
   - Give your URL to friends
   - They can sign up and read manga!

---

## 📞 Need Help?

See detailed guide: `DEPLOYMENT_GUIDE.md`
See environment variables: `ENV_VARIABLES.md`
See Telegram scraper: `TELEGRAM_SCRAPER_SETUP.md`

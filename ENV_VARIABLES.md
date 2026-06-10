# Environment Variables for Railway Deployment

When deploying on Railway, you need to set these environment variables in the Railway dashboard.

## Required Variables

### 1. DATABASE_URL (REQUIRED)
**Where to get it:** Supabase Dashboard → Settings → Database → Connection Pooling

**Example:**
```
postgresql://postgres:YourPassword123@db.supabase.co:5432/postgres
```

**How to find it:**
1. Go to https://supabase.com
2. Open your project
3. Click "Settings" (bottom left)
4. Click "Database"
5. Scroll to "Connection pooling"
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your actual database password

---

### 2. NODE_ENV
**Value:** `production`

This tells the app to run in production mode.

---

### 3. SYNC_INTERVAL (Optional)
**Value:** `60` (or any number in minutes)

How often the Telegram scraper auto-syncs channels.
- `60` = every 60 minutes (recommended)
- `30` = every 30 minutes (more frequent)
- `120` = every 2 hours (less frequent)

---

## How to Set Variables in Railway

1. Go to Railway Dashboard: https://railway.app/dashboard
2. Click on your project
3. Click the **"Variables"** tab
4. Click **"Add Variable"**
5. Enter:
   - **Key:** `DATABASE_URL`
   - **Value:** (paste from Supabase)
6. Click **"Save"**
7. Repeat for other variables

---

## Complete Variable List

Copy-paste this and fill in the values:

```
DATABASE_URL=postgresql://user:password@host:5432/db
NODE_ENV=production
SYNC_INTERVAL=60
```

---

## Testing Variables

After setting variables:
1. Railway will automatically redeploy
2. Check the deployment logs to verify no errors
3. Visit your app URL to test

If you see database errors:
- Verify `DATABASE_URL` is correct
- Check the password is correct
- Ensure Supabase project is running

---

## Troubleshooting

### "Connection refused" error
- Check `DATABASE_URL` is correct
- Verify Supabase project is running
- Wait 1-2 minutes for changes to take effect

### "Invalid connection string"
- Copy the full connection string from Supabase
- Don't modify the format
- Ensure password is correct

### Variables not updating
- Railway caches variables
- Click "Redeploy" in Railway dashboard
- Wait 2-3 minutes for new deployment

---

## Security Notes

- ✅ Never share your `DATABASE_URL`
- ✅ Don't commit `.env` files to GitHub
- ✅ Railway keeps variables secure
- ✅ Use strong database passwords

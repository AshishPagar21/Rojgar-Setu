# 🔧 Neon Database Credential Update Guide

Your database credentials are either **expired** or the **database is paused**. Follow these steps:

## Step 1: Go to Neon Console

1. Open https://console.neon.tech in your browser
2. **Log in** with your Neon account

## Step 2: Resume Database (if paused)

1. Find your project (look for `neondb`)
2. If it shows **"PAUSED"** status:
   - Click the **"Resume"** button
   - Wait 30-60 seconds for it to start

## Step 3: Get Fresh Connection String

1. In your project, click on the **"Databases"** or **"Connection Strings"** section
2. Look for database named `neondb`
3. Under "Connection string", select **"PostgreSQL"**
4. Copy the entire connection string (looks like: `postgresql://user:password@host/dbname?sslmode=require...`)

## Step 4: Update Your .env File

1. Open `backend/.env` in VS Code
2. Replace the entire `DATABASE_URL` value with the string from Step 3
3. Change `sslmode=require` to `sslmode=verify-full` in the URL
4. Save the file

**Example (with your credentials redacted):**

```
DATABASE_URL=postgresql://neondb_owner:YOUR_NEW_PASSWORD_HERE@ep-empty-glade-amt5pyuj-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require
```

## Step 5: Test the Connection

Run this command in the `backend/` directory:

```bash
npm run test:db
```

You should see:

```
✅ Connection successful!
✓ Database time: 2026-03-28...
```

## Step 6: Restart Your Server

Kill the running server (Ctrl+C) and restart it:

```bash
npm run dev
```

---

## ⚠️ Common Issues

**"password must be a string"** → Invalid credentials in .env

- Get fresh string from Neon console

**"Can't reach database"** → Database is paused or unreachable

- Go to Neon console and click Resume
- Wait 1 minute and try again

**SSL warning still showing** → sslmode is still `require`

- Make sure you changed it to `verify-full` in the URL

---

## 📞 Still Having Issues?

Run the diagnostic script to get specific error messages:

```bash
npm run test:db
```

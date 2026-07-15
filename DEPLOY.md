# Deployment Guide — Vercel + Neon

## Step 1: Create Neon Database (2 minutes)

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Click **Create Project**
3. Choose region: **US East (Ohio)** or closest to you
4. Copy the **Connection String** (looks like `postgresql://neondb_owner:...@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)
5. Save it somewhere — you'll need it for Vercel

## Step 2: Push to GitHub (3 minutes)

```bash
cd E:\Products\PIplanning\pi-planning-hub

# Initialize git
git init
git add .
git commit -m "PI Planning Hub - MVP"

# Create GitHub repo (install gh CLI first: winget install GitHub.cli)
gh repo create pi-planning-hub --public --source=. --push
```

## Step 3: Deploy to Vercel (3 minutes)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New Project**
3. Import your `pi-planning-hub` repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npx prisma generate && next build`
   - **Install Command**: `npm install`
5. Add Environment Variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string from Step 1
6. Click **Deploy**

## Step 4: Seed the Database (2 minutes)

After deployment, run seed command:

```bash
# Option A: Run locally with Neon database
DATABASE_URL="your-neon-connection-string" npx tsx prisma/seed.ts

# Option B: Use Vercel CLI
vercel env pull .env.local
npx tsx prisma/seed.ts
```

## Step 5: Verify (1 minute)

1. Open your Vercel URL (e.g., `pi-planning-hub.vercel.app`)
2. Check dashboard loads with data
3. Test role switching in header
4. Test chart selection on /charts page

---

## Troubleshooting

### Build fails with "Prisma generate error"
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Redeploy after adding the variable

### "Table does not exist" error
- Run the seed script with your Neon database URL
- Or use `npx prisma db push` to create tables first

### Charts show "No data available"
- Database is empty — run the seed script
- Check if API routes return data: `/api/dashboard`, `/api/features`

---

## Alternative: Keep Local + Vercel

You can run the app locally with SQLite for development and deploy to Vercel with PostgreSQL for the demo:

```bash
# Local development (SQLite)
npx prisma db push
npx tsx prisma/seed.ts
npm run dev

# Production (PostgreSQL on Vercel)
# Just push to GitHub — Vercel auto-deploys
```

---

## Quick Commands Reference

```bash
# Local dev
npm run dev

# Seed database
npx tsx prisma/seed.ts

# Push schema changes
npx prisma db push

# Generate Prisma client
npx prisma generate

# Deploy to Vercel
git push origin main
```

# Quick Deployment Guide

Follow these exact steps to deploy CollabFlow in 30 minutes.

## Step 1: MongoDB Atlas (5 mins)
1. Go to https://mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create **FREE** M0 cluster
4. Create database user
5. Network Access → Add IP: `0.0.0.0/0`
6. Connect → Get connection string
7. Save it!

## Step 2: Backend to Railway (10 mins)
1. Go to https://railway.app
2. Start New Project → Deploy from GitHub
3. Select your repo → choose `backend` folder
4. Add Variables:
   ```
   NODE_ENV=production
   MONGODB_URI=<paste from step 1>
   JWT_SECRET=<generate below>
   CLIENT_URL=https://temporary.com
   ```
5. Generate JWT Secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
6. Deploy → Copy Railway URL

## Step 3: Frontend to Vercel (5 mins)
1. Go to https://vercel.com
2. Import Git Repository
3. Select `frontend` folder as root
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=<Railway URL>
   NEXT_PUBLIC_SOCKET_URL=<Railway URL>
   ```
5. Deploy → Copy Vercel URL

## Step 4: Update Backend CORS (2 mins)
1. Go back to Railway
2. Update `CLIENT_URL` to Vercel URL
3. Redeploy

## Step 5: Test (3 mins)
1. Visit Vercel URL
2. Register new account
3. Create workspace
4. Done! 🎉

---

**Total time:** ~30 minutes
**Cost:** $0 (all free tiers)

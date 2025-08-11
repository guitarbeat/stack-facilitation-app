# Render Deployment Guide - Stack Facilitation App

This guide will help you deploy the new simplified Stack Facilitation app to Render.

## 🎯 Overview

You need to:
1. Create a new web service for the simple backend
2. Update the frontend environment variable
3. Clean up the old failed backend service

## 📋 Step-by-Step Instructions

### Step 1: Create New Backend Service

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Log in to your account

2. **Create New Web Service**
   - Click the **"New"** button in the top navigation
   - Select **"Web Service"**

3. **Connect Repository**
   - Select your GitHub repository: **`guitarbeat/stack-facilitation-app`**
   - Click **"Connect"**

4. **Configure Service Settings**
   ```
   Name: stack-facilitation-simple-backend
   Language: Node
   Root Directory: simple-backend
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **Environment Variables**
   Add these environment variables:
   ```
   NODE_ENV = production
   PORT = 10000
   ```

6. **Deploy**
   - Click **"Create Web Service"**
   - Wait for deployment to complete (5-10 minutes)
   - Note the service URL (e.g., `https://stack-facilitation-simple-backend.onrender.com`)

### Step 2: Update Frontend Environment Variable

1. **Go to Frontend Service**
   - In your Render dashboard, find your existing frontend service: **`stack-facilitation-app`**
   - Click on it to open settings

2. **Update Environment Variables**
   - Go to **"Environment"** tab
   - Add or update this variable:
   ```
   VITE_API_URL = https://stack-facilitation-simple-backend.onrender.com
   ```
   (Replace with your actual backend URL from Step 1)

3. **Redeploy Frontend**
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait for deployment to complete

### Step 3: Clean Up Old Services

1. **Delete Failed Backend**
   - Find the old service: **`stack-facilitation-backend`** (the one that failed)
   - Click on it → **"Settings"** → **"Delete Service"**
   - Confirm deletion

2. **Keep Database** (Optional)
   - Keep **`stack-facilitation-db`** - it's free and might be useful later
   - Or delete it if you don't need it

## ✅ Verification

After deployment, test your app:

1. **Visit your frontend URL**: `https://stack-facilitation-app.onrender.com`
2. **Create a meeting** - should generate a real meeting code
3. **Join the meeting** - should work with real-time updates
4. **Test speaking queue** - should update in real-time

## 🔧 Configuration Summary

### Backend Service (`simple-backend`)
```
Name: stack-facilitation-simple-backend
Runtime: Node
Root Directory: simple-backend
Build Command: npm install
Start Command: npm start
Environment Variables:
  - NODE_ENV=production
  - PORT=10000
```

### Frontend Service (`frontend`)
```
Name: stack-facilitation-app (existing)
Runtime: Static Site
Root Directory: frontend
Build Command: npm run build
Publish Directory: dist
Environment Variables:
  - VITE_API_URL=https://stack-facilitation-simple-backend.onrender.com
```

## 🚨 Troubleshooting

### Backend Issues
- Check logs in Render dashboard
- Ensure `simple-backend` directory exists in your repo
- Verify `package.json` has correct start script

### Frontend Issues
- Ensure `VITE_API_URL` points to correct backend URL
- Check browser console for CORS errors
- Verify backend is running and accessible

### Connection Issues
- Backend must be deployed first
- Frontend needs correct backend URL
- Both services should be on same Render account

## 🎉 Success!

Once deployed, your Stack Facilitation app will be live with:
- Real meeting creation and codes
- QR code generation
- Real-time speaking queue
- Beautiful Kahoot-style interface
- Mobile-responsive design

The app will be accessible at: `https://stack-facilitation-app.onrender.com`

---

**Need help?** Check the Render logs or create a new issue in the GitHub repository.


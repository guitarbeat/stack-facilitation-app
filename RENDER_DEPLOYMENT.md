# Render Deployment Guide

This guide walks you through deploying the current `simple-backend` + `frontend` stack to Render.

## Prerequisites
- Render account (free tier works to start)
- GitHub repository connected

## 1) Deploy the Backend (Web Service)
1. New → Web Service → Connect repo
2. Configure:
   - Name: `stack-facilitation-backend`
   - Branch: `main`
   - Root Directory: `simple-backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`
3. Environment Variables:
```
NODE_ENV=production
# URL of your frontend for QR join redirects (used by /join/:code)
FRONTEND_URL=https://stack-facilitation-frontend.onrender.com
# Optionally restrict CORS in code or via a proxy; current backend allows all origins for dev
```
4. Create Web Service

The backend will be available at something like:
- https://stack-facilitation-backend.onrender.com

## 2) Deploy the Frontend (Static Site)
1. New → Static Site → Connect same repo
2. Configure:
   - Name: `stack-facilitation-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
3. Environment Variables:
```
VITE_API_URL=https://stack-facilitation-backend.onrender.com
```
4. Create Static Site

The frontend will be available at something like:
- https://stack-facilitation-frontend.onrender.com

## 3) Update Backend Redirects (optional)
If you change the frontend URL, update the backend env `FRONTEND_URL` and redeploy so `/join/:code` redirects to your live frontend.

## Troubleshooting
- Build failures: check logs for missing dependencies
- CORS errors: ensure the browser is calling the correct `VITE_API_URL`
- WebSocket issues: verify `VITE_API_URL` points to your backend origin (Socket.io uses the same origin)

## Notes
- The root `render.yaml` in this repo references a legacy stack. Use the settings above for the current app.


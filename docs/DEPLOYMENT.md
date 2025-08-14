# Deployment

This project uses a simple split: a Node backend (`simple-backend/`) and a static React frontend (`frontend/`). The recommended host is Render because it supports both a Node Web Service and a Static Site with a generous free tier.

- Backend: Express + Socket.io (real-time), binds to 0.0.0.0 and uses the `PORT` environment variable.
- Frontend: Vite-built static site, configured via `VITE_API_URL`.
- Legacy: Root `render.yaml`, `docker-compose.yml`, and `docker/` target an older stack and are not used for the current app.

## Strategy

- Deploy `simple-backend/` as a Node Web Service
- Deploy `frontend/` as a Static Site
- Set the frontend `VITE_API_URL` to your backend’s URL
- Optionally set backend `FRONTEND_URL` so `/join/:code` redirects to your live frontend

Note: Do not set a fixed `PORT` value on Render. Render automatically provides `PORT` to your service.

## Deploy to Render

### 1) Backend (Web Service)

- New → Web Service → Connect repo
- Settings:
  - Name: `stack-facilitation-backend`
  - Branch: `main`
  - Root Directory: `simple-backend`
  - Runtime: Node
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Plan: Free
- Environment Variables:
  - `NODE_ENV=production`
  - `FRONTEND_URL=https://stack-facilitation-frontend.onrender.com` (optional)

Once deployed, you’ll have a URL like:
- `https://stack-facilitation-backend.onrender.com`

### 2) Frontend (Static Site)

- New → Static Site → Connect same repo
- Settings:
  - Name: `stack-facilitation-frontend`
  - Branch: `main`
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
- Environment Variables:
  - `VITE_API_URL=https://stack-facilitation-backend.onrender.com`

Your frontend URL will look like:
- `https://stack-facilitation-frontend.onrender.com`

### 3) Verification

- Visit your frontend URL
- Create a meeting (should generate a real code)
- Join the meeting from another device/tab and verify real-time updates

### 4) Clean up old services (if applicable)

- Delete any failed or legacy services (e.g., `stack-facilitation-backend` from an older attempt)
- You can keep an old free database if you want it for later, or delete it if unused

## Troubleshooting

- Build failures: check service logs
- CORS errors: ensure the frontend points to the correct backend `VITE_API_URL`
- WebSocket issues: verify `VITE_API_URL` uses the backend origin (Socket.io shares the origin)
- Connection order: deploy backend first, then set the frontend `VITE_API_URL` and redeploy

## Legacy Notes

- The root `render.yaml` and `docker-compose.yml` are for a legacy stack and not compatible with the current `simple-backend + frontend` architecture
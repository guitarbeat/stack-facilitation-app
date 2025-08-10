# Deployment Strategy for the Simplified Stack Facilitation App

## Current Situation
You have a simplified architecture in this repository:
- ✅ `frontend/` – Current React + Vite app
- ✅ `simple-backend/` – Current Express + Socket.io server
- 🗂️ `frontend-old/` – Legacy complex frontend (kept for reference)
- ⚠️ Legacy artifacts (`render.yaml`, `docker-compose.yml`, `Dockerfile`) target an older full-stack that is not in use

## Recommended Platform: Render
- Easy to host a Node backend and a static frontend
- Free tier is sufficient for testing
- See `RENDER_DEPLOYMENT.md` for exact settings

## Deployment Plan
**Option 1: Deploy to Render (Recommended)**
- Backend: deploy `simple-backend/` as a Node Web Service (`npm install`, `npm start`)
- Frontend: deploy `frontend/` as a Static Site (`npm install && npm run build`, publish `dist/`)
- Frontend env: `VITE_API_URL=https://<your-backend>.onrender.com`
- Backend env (optional): `FRONTEND_URL=https://<your-frontend>.onrender.com`

**Option 2: Other Hosts**
- Any provider that supports a Node web service (backend) + static hosting (frontend)

## What to Do with the Old Stack
- Keep `frontend-old/` for ideas and code reference
- Ignore or archive root-level legacy infra files that target the old stack

## Future Roadmap
- Phase 1: Current simple real-time queue (this repo)
- Phase 2: Persistence and additional features as needed
- Phase 3: Revisit advanced capabilities from legacy implementation where valuable

**Recommendation:** Use Render for fast, reliable deployment, and iterate from there. 🚀


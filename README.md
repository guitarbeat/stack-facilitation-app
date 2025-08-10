# Stack Facilitation App

An open, inclusive web application that helps groups run meetings using stack facilitation. Create meetings, share a code/QR, and manage a transparent speaking queue with real-time updates.

## ✨ Features

- **Create & Join Meetings**: PIN-based joining with shareable links/QR
- **Speaking Queue**: Raise hand, direct response, points of info/clarification
- **Real-time Updates**: Socket.io for instant queue and participant changes
- **Mobile-first UI**: Works great on phones and desktops
- **Privacy-friendly**: No accounts; just names and meeting codes

> Note: Advanced features from a previous architecture (proposals, consent voting, PWA/offline, DB persistence) are not part of the current simplified app. The older code is retained in `frontend-old/` for reference.

## 🗂️ Repository Structure

```
stack-facilitation-app/
├── frontend/            # React + Vite client (current)
├── simple-backend/      # Express + Socket.io server (current)
├── frontend-old/        # Legacy/complex frontend (kept for reference)
├── docs/                # Guides (Facilitation, Moderation)
├── deploy/              # Deployment helpers (may reference legacy setup)
├── docker/              # Legacy container scripts (not used by current app)
├── docker-compose.yml   # Legacy compose (targets old stack)
└── render.yaml          # Legacy Render config (targets old stack)
```

## 🚀 Quick Start (Local Development)

1) Backend

```bash
cd simple-backend
npm install
npm start   # starts on http://localhost:3000
```

2) Frontend

```bash
cd frontend
npm install
# Ensure API URL is set (creates ./frontend/.env if missing)
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev   # Vite dev server on http://localhost:5173
```

3) Open the app

- Visit http://localhost:5173
- Create a meeting and share the code or QR

## 🔧 Configuration

- **Frontend (`frontend/.env`)**
  - `VITE_API_URL` (required): Base URL for the backend API and WebSocket, e.g. `http://localhost:3000`

- **Backend (`simple-backend`)**
  - `PORT` (default `3000`): HTTP and WebSocket port
  - `FRONTEND_URL` (optional): Used for redirect links like `/join/:code` (default points to a placeholder Render URL)

## 📡 API & Socket Overview

- REST API
  - `POST /api/meetings` → Create meeting (body: `{ facilitatorName, meetingTitle }`)
  - `GET /api/meetings/:code` → Lookup meeting info
  - `GET /health` → Health check

- Socket.io Events
  - Client → Server: `join-meeting`, `join-queue`, `leave-queue`, `next-speaker`
  - Server → Client: `meeting-joined`, `participants-updated`, `queue-updated`, `participant-joined`, `participant-left`, `next-speaker`, `error`

Queue types supported: `speak`, `direct-response`, `point-of-info`, `clarification`.

## ☁️ Deployment

- Recommended: Render (free-tier friendly)
- Follow the updated deployment guide: `RENDER_DEPLOYMENT.md`

Notes:
- The root `render.yaml` and `docker-compose.yml` target a legacy stack and are not compatible with the current `simple-backend + frontend` setup.
- If you use Render, set:
  - Backend service env: `NODE_ENV=production`, `FRONTEND_URL=https://your-frontend.onrender.com`, optionally restrict CORS
  - Frontend static site env: `VITE_API_URL=https://your-backend.onrender.com`

## 📚 Documentation

- Facilitation guide: `docs/FACILITATION_GUIDE.md`
- Moderation guide: `docs/MODERATION_GUIDE.md`
- Render deployment: `RENDER_DEPLOYMENT.md`

## 🤝 Contributing

- Issues and PRs are welcome. Please keep accessibility and inclusion in mind.

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See `LICENSE` for details.


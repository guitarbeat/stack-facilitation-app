# Quick Start

Get the Stack Facilitation App running locally in minutes.

## Prerequisites
- Node.js 18+

## 1) Start the backend
```bash
cd simple-backend
npm install
npm start   # http://localhost:3000
```

## 2) Start the frontend
```bash
cd frontend
npm install
# Backend API URL for dev
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev   # http://localhost:5173
```

## 3) Open your browser
- Visit http://localhost:5173
- Create a meeting → Share the 6-character code or QR

## Next steps
- Full README: `README.md`
- Facilitation guide: `docs/FACILITATION_GUIDE.md`
- Moderation guide: `docs/MODERATION_GUIDE.md`
- Deployment: `docs/DEPLOYMENT.md`


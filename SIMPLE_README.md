# Stack Facilitation - Simple Meeting Tool

A clean, Kahoot-style meeting facilitation app for inclusive decision-making. Create meetings, share codes, and manage speaking queues in real-time.

## ✨ Features

- **🎯 Kahoot-Style Interface**: Simple, intuitive design that everyone understands
- **📱 QR Code Sharing**: Generate QR codes for easy mobile joining
- **⚡ Real-time Updates**: Socket.io powered live speaking queue
- **🙋 Speaking Queue**: Raise hand to speak, direct responses, points of info
- **📱 Mobile-First**: Responsive design that works on any device
- **🔒 Privacy-Focused**: No accounts needed, just names and meeting codes

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/guitarbeat/stack-facilitation-app.git
   cd stack-facilitation-app
   ```

2. **Start the backend**
   ```bash
   cd simple-backend
   npm install
   npm start
   ```

3. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open your browser**
   - Visit http://localhost:5173
   - Create a meeting or join with a code!

### Production Deployment

The app is designed to deploy easily on Render, Vercel, or similar platforms.

**Backend**: Deploy `simple-backend/` as a Node.js web service
**Frontend**: Deploy `frontend/` as a static site

## 🎮 How It Works

### For Facilitators
1. Click "Create Meeting"
2. Enter meeting name and your name
3. Get a meeting code and QR code
4. Share with participants
5. Manage the speaking queue

### For Participants
1. Scan QR code or enter meeting code
2. Enter your name
3. Join the meeting
4. Raise your hand to speak
5. Make direct responses or points of info

## 🏗️ Architecture

### Backend (`simple-backend/`)
- **Express.js** server with Socket.io
- **In-memory storage** for meetings and participants
- **RESTful API** for meeting creation
- **WebSocket events** for real-time updates

### Frontend (`frontend/`)
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time features
- **QR Code generation** for easy sharing

## 📡 API Endpoints

### REST API
- `POST /api/meetings` - Create a new meeting
- `GET /api/meetings/:code` - Get meeting info
- `GET /health` - Health check

### Socket.io Events
- `join-meeting` - Join a meeting room
- `join-queue` - Join speaking queue
- `leave-queue` - Leave speaking queue
- `next-speaker` - Facilitator calls next speaker

## 🎨 Design Philosophy

**Simple**: Like Kahoot, but for meetings
**Inclusive**: Progressive stack and direct response options
**Accessible**: Clean UI, keyboard navigation, screen reader friendly
**Fast**: Real-time updates, no page refreshes
**Mobile**: Works perfectly on phones and tablets

## 🔧 Configuration

### Environment Variables

**Backend** (`simple-backend/.env`):
```
PORT=3000
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:3000
```

## 📦 Dependencies

### Backend
- express - Web server
- socket.io - Real-time communication
- cors - Cross-origin requests
- uuid - Unique ID generation

### Frontend
- react - UI framework
- socket.io-client - Real-time client
- react-router-dom - Navigation
- qrcode - QR code generation
- lucide-react - Icons
- tailwindcss - Styling

## 🚀 Deployment

### Render (Recommended)

1. **Deploy Backend**:
   - Connect GitHub repository
   - Set root directory to `simple-backend`
   - Use Node.js runtime
   - Set start command: `npm start`

2. **Deploy Frontend**:
   - Connect same GitHub repository
   - Set root directory to `frontend`
   - Use Static Site
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`

### Other Platforms

The app works on any platform that supports:
- Node.js (for backend)
- Static site hosting (for frontend)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your meetings!

## 🙏 Acknowledgments

Built for inclusive, democratic decision-making in meetings and organizations.

---

**Made with ❤️ for better meetings**


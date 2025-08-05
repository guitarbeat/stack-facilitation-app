# Stack Facilitation - Simplified Rebuild Plan

## New Vision: Kahoot-Style Meeting Tool

### Core Flow
1. **Facilitator**: Creates meeting → Gets shareable link/QR code
2. **Participants**: Click link → Enter name → Join meeting
3. **Speaking Queue**: Raise hand to speak or direct response
4. **Real-time**: Live updates for all participants

### Key Features (Simplified)
- ✅ **No user accounts** - just names
- ✅ **One facilitator** per meeting
- ✅ **Speaking queue** with progressive stack
- ✅ **Direct responses** (process, info, clarification)
- ✅ **QR code sharing** for easy joining
- ✅ **Clean, mobile-first UI**
- ✅ **Real-time updates** via WebSocket

### Tech Stack (Simplified)
- **Frontend**: React + Vite + Tailwind (clean, simple)
- **Backend**: Node.js + Socket.io (real-time)
- **Database**: In-memory (no persistence needed)
- **Deployment**: Render (frontend + backend)

### Pages Needed
1. **Home** - Create or join meeting
2. **Create Meeting** - Facilitator setup
3. **Join Meeting** - Enter name + meeting code
4. **Meeting Room** - Speaking queue interface
5. **Facilitator View** - Queue management

### Data Structure
```javascript
Meeting {
  id: string,
  name: string,
  facilitator: string,
  participants: [{ name, id, joinedAt }],
  speakingQueue: [{ name, type: 'speak'|'direct', timestamp }],
  currentSpeaker: string|null,
  isActive: boolean
}
```

## Implementation Plan
1. Create new simplified frontend
2. Create simple Socket.io backend
3. Deploy and test
4. Add QR code generation
5. Polish UI/UX

Let's build something people will actually use! 🚀


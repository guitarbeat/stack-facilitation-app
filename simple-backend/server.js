const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.io
const corsOptions = {
  origin: "*", // Allow all origins for development
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const io = socketIo(server, {
  cors: corsOptions
});

// In-memory storage for meetings and participants
const meetings = new Map();
const participants = new Map();

// Generate a random 6-character meeting code
function generateMeetingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create a new meeting
app.post('/api/meetings', (req, res) => {
  const { facilitatorName, meetingTitle } = req.body;
  
  if (!facilitatorName || !meetingTitle) {
    return res.status(400).json({ error: 'Facilitator name and meeting title are required' });
  }

  const meetingCode = generateMeetingCode();
  const meetingId = uuidv4();
  
  const meeting = {
    id: meetingId,
    code: meetingCode,
    title: meetingTitle,
    facilitator: facilitatorName,
    participants: [],
    queue: [],
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  meetings.set(meetingCode, meeting);
  
  console.log(`Meeting created: ${meetingCode} - ${meetingTitle} by ${facilitatorName}`);
  
  res.json({
    meetingCode,
    meetingId,
    shareUrl: `${req.protocol}://${req.get('host')}/join/${meetingCode}`
  });
});

// Get meeting info
app.get('/api/meetings/:code', (req, res) => {
  const { code } = req.params;
  const meeting = meetings.get(code.toUpperCase());
  
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  
  res.json({
    code: meeting.code,
    title: meeting.title,
    facilitator: meeting.facilitator,
    participantCount: meeting.participants.length,
    isActive: meeting.isActive
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a meeting
  socket.on('join-meeting', (data) => {
    const { meetingCode, participantName, isFacilitator = false } = data;
    const meeting = meetings.get(meetingCode.toUpperCase());
    
    if (!meeting) {
      socket.emit('error', { message: 'Meeting not found' });
      return;
    }
    
    const participant = {
      id: socket.id,
      name: participantName,
      isFacilitator,
      joinedAt: new Date().toISOString(),
      isInQueue: false,
      queuePosition: null
    };
    
    // Add participant to meeting
    meeting.participants.push(participant);
    participants.set(socket.id, { meetingCode: meetingCode.toUpperCase(), participant });
    
    // Join the meeting room
    socket.join(meetingCode.toUpperCase());
    
    console.log(`${participantName} joined meeting ${meetingCode} as ${isFacilitator ? 'facilitator' : 'participant'}`);
    
    // Send meeting info to the participant
    socket.emit('meeting-joined', {
      meeting: {
        code: meeting.code,
        title: meeting.title,
        facilitator: meeting.facilitator
      },
      participant,
      queue: meeting.queue,
      participants: meeting.participants
    });
    
    // Notify all participants about the new participant
    socket.to(meetingCode.toUpperCase()).emit('participant-joined', {
      participant,
      participantCount: meeting.participants.length
    });
    
    // Send updated participant list
    io.to(meetingCode.toUpperCase()).emit('participants-updated', meeting.participants);
  });

  // Join speaking queue
  socket.on('join-queue', (data) => {
    const { type = 'speak' } = data; // 'speak', 'direct-response', 'point-of-info', 'clarification'
    const participantData = participants.get(socket.id);
    
    if (!participantData) {
      socket.emit('error', { message: 'Not in a meeting' });
      return;
    }
    
    const { meetingCode, participant } = participantData;
    const meeting = meetings.get(meetingCode);
    
    if (!meeting) {
      socket.emit('error', { message: 'Meeting not found' });
      return;
    }
    
    // Check if already in queue
    const existingIndex = meeting.queue.findIndex(item => item.participantId === socket.id);
    if (existingIndex !== -1) {
      socket.emit('error', { message: 'Already in queue' });
      return;
    }
    
    const queueItem = {
      id: uuidv4(),
      participantId: socket.id,
      participantName: participant.name,
      type,
      timestamp: new Date().toISOString(),
      position: meeting.queue.length + 1
    };
    
    meeting.queue.push(queueItem);
    participant.isInQueue = true;
    participant.queuePosition = meeting.queue.length;
    
    console.log(`${participant.name} joined queue for ${type} in meeting ${meetingCode}`);
    
    // Notify all participants about queue update
    io.to(meetingCode).emit('queue-updated', meeting.queue);
    io.to(meetingCode).emit('participants-updated', meeting.participants);
  });

  // Leave speaking queue
  socket.on('leave-queue', () => {
    const participantData = participants.get(socket.id);
    
    if (!participantData) {
      socket.emit('error', { message: 'Not in a meeting' });
      return;
    }
    
    const { meetingCode, participant } = participantData;
    const meeting = meetings.get(meetingCode);
    
    if (!meeting) {
      socket.emit('error', { message: 'Meeting not found' });
      return;
    }
    
    // Remove from queue
    const queueIndex = meeting.queue.findIndex(item => item.participantId === socket.id);
    if (queueIndex !== -1) {
      meeting.queue.splice(queueIndex, 1);
      
      // Update positions for remaining queue items
      meeting.queue.forEach((item, index) => {
        item.position = index + 1;
      });
      
      participant.isInQueue = false;
      participant.queuePosition = null;
      
      console.log(`${participant.name} left queue in meeting ${meetingCode}`);
      
      // Notify all participants about queue update
      io.to(meetingCode).emit('queue-updated', meeting.queue);
      io.to(meetingCode).emit('participants-updated', meeting.participants);
    }
  });

  // Facilitator: Next speaker
  socket.on('next-speaker', () => {
    const participantData = participants.get(socket.id);
    
    if (!participantData) {
      socket.emit('error', { message: 'Not in a meeting' });
      return;
    }
    
    const { meetingCode, participant } = participantData;
    const meeting = meetings.get(meetingCode);
    
    if (!meeting || !participant.isFacilitator) {
      socket.emit('error', { message: 'Not authorized' });
      return;
    }
    
    if (meeting.queue.length === 0) {
      socket.emit('error', { message: 'Queue is empty' });
      return;
    }
    
    // Remove first person from queue
    const nextSpeaker = meeting.queue.shift();
    
    // Update positions for remaining queue items
    meeting.queue.forEach((item, index) => {
      item.position = index + 1;
    });
    
    // Update participant status
    const speakerParticipant = meeting.participants.find(p => p.id === nextSpeaker.participantId);
    if (speakerParticipant) {
      speakerParticipant.isInQueue = false;
      speakerParticipant.queuePosition = null;
    }
    
    console.log(`Next speaker: ${nextSpeaker.participantName} in meeting ${meetingCode}`);
    
    // Notify all participants
    io.to(meetingCode).emit('next-speaker', nextSpeaker);
    io.to(meetingCode).emit('queue-updated', meeting.queue);
    io.to(meetingCode).emit('participants-updated', meeting.participants);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const participantData = participants.get(socket.id);
    if (participantData) {
      const { meetingCode, participant } = participantData;
      const meeting = meetings.get(meetingCode);
      
      if (meeting) {
        // Remove from participants
        const participantIndex = meeting.participants.findIndex(p => p.id === socket.id);
        if (participantIndex !== -1) {
          meeting.participants.splice(participantIndex, 1);
        }
        
        // Remove from queue if present
        const queueIndex = meeting.queue.findIndex(item => item.participantId === socket.id);
        if (queueIndex !== -1) {
          meeting.queue.splice(queueIndex, 1);
          
          // Update positions for remaining queue items
          meeting.queue.forEach((item, index) => {
            item.position = index + 1;
          });
        }
        
        console.log(`${participant.name} left meeting ${meetingCode}`);
        
        // Notify remaining participants
        socket.to(meetingCode).emit('participant-left', {
          participantId: socket.id,
          participantName: participant.name,
          participantCount: meeting.participants.length
        });
        
        socket.to(meetingCode).emit('queue-updated', meeting.queue);
        socket.to(meetingCode).emit('participants-updated', meeting.participants);
        
        // Clean up empty meetings
        if (meeting.participants.length === 0) {
          meetings.delete(meetingCode);
          console.log(`Meeting ${meetingCode} deleted (no participants)`);
        }
      }
      
      participants.delete(socket.id);
    }
  });
});

// Serve static files for QR code joining
app.get('/join/:code', (req, res) => {
  const { code } = req.params;
  const meeting = meetings.get(code.toUpperCase());
  
  if (!meeting) {
    return res.status(404).send(`
      <html>
        <head><title>Meeting Not Found</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Meeting Not Found</h1>
          <p>The meeting code "${code}" is not valid or the meeting has ended.</p>
        </body>
      </html>
    `);
  }
  
  // Redirect to frontend with meeting code
  const frontendUrl = process.env.FRONTEND_URL || 'https://stack-facilitation-app.onrender.com';
  res.redirect(`${frontendUrl}/join?code=${code.toUpperCase()}`);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Stack Facilitation Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Join meetings: http://localhost:${PORT}/join/MEETINGCODE`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});


import { create } from 'zustand';
import { io } from 'socket.io-client';

const useMeetingStore = create((set, get) => ({
  // Connection state
  socket: null,
  isConnected: false,
  
  // User state
  currentUser: null,
  
  // Meeting state
  currentMeeting: null,
  participants: [],
  
  // Queue state
  queue: [],
  currentSpeaker: null,
  
  // Proposal state
  proposals: [],
  
  // UI state
  isLoading: false,
  error: null,
  
  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  // WebSocket connection
  connectSocket: () => {
    const socket = io('ws://localhost:3001');
    
    socket.on('connect', () => {
      set({ socket, isConnected: true });
    });
    
    socket.on('disconnect', () => {
      set({ isConnected: false });
    });
    
    socket.on('queue-updated', (data) => {
      set({ queue: data.queue });
    });
    
    socket.on('speaker-changed', (data) => {
      set({ currentSpeaker: data.speaker });
    });
    
    socket.on('proposal-updated', (data) => {
      const { proposals } = get();
      const updatedProposals = proposals.map(p => 
        p.id === data.proposal.id ? data.proposal : p
      );
      set({ proposals: updatedProposals });
    });
    
    return socket;
  },
  
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
  
  // API calls
  createAnonymousUser: async (displayName, pronouns) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/users/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, pronouns })
      });
      
      if (!response.ok) throw new Error('Failed to create user');
      
      const user = await response.json();
      set({ currentUser: user, isLoading: false });
      return user;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  createMeeting: async (title, description, settings) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, settings })
      });
      
      if (!response.ok) throw new Error('Failed to create meeting');
      
      const meeting = await response.json();
      set({ currentMeeting: meeting, isLoading: false });
      return meeting;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  joinMeeting: async (pin, userId, role = 'PARTICIPANT') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/meetings/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, userId, role })
      });
      
      if (!response.ok) throw new Error('Failed to join meeting');
      
      const participant = await response.json();
      set({ currentMeeting: participant.meeting, isLoading: false });
      return participant;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  fetchMeeting: async (meetingId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/meetings/${meetingId}`);
      
      if (!response.ok) throw new Error('Failed to fetch meeting');
      
      const meeting = await response.json();
      set({ 
        currentMeeting: meeting,
        participants: meeting.participants,
        proposals: meeting.proposals,
        isLoading: false 
      });
      return meeting;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  addToQueue: async (meetingId, userId, type, metadata = {}) => {
    set({ error: null });
    try {
      const response = await fetch(`/api/queue/${meetingId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, metadata })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      
      const data = await response.json();
      set({ queue: data.orderedQueue });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  removeFromQueue: async (meetingId, itemId, userId, reason) => {
    set({ error: null });
    try {
      const response = await fetch(`/api/queue/${meetingId}/remove/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason })
      });
      
      if (!response.ok) throw new Error('Failed to remove from queue');
      
      const data = await response.json();
      set({ queue: data.orderedQueue });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  fetchQueue: async (meetingId) => {
    try {
      const response = await fetch(`/api/queue/${meetingId}`);
      
      if (!response.ok) throw new Error('Failed to fetch queue');
      
      const queue = await response.json();
      set({ queue });
      return queue;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  createProposal: async (meetingId, proposerId, title, description) => {
    set({ error: null });
    try {
      const response = await fetch(`/api/proposals/${meetingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposerId, title, description })
      });
      
      if (!response.ok) throw new Error('Failed to create proposal');
      
      const proposal = await response.json();
      const { proposals } = get();
      set({ proposals: [proposal, ...proposals] });
      return proposal;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  voteOnProposal: async (proposalId, userId, voteType, rationale) => {
    set({ error: null });
    try {
      const response = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, voteType, rationale })
      });
      
      if (!response.ok) throw new Error('Failed to vote on proposal');
      
      const vote = await response.json();
      return vote;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  }
}));

export default useMeetingStore;


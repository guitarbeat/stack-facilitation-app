import { io } from 'socket.io-client'
import apiService from './api.js'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket
    }

    const socketUrl = apiService.getSocketUrl()
    console.log('Connecting to socket:', socketUrl)

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id)
      this.isConnected = true
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.isConnected = false
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Meeting operations
  joinMeeting(meetingCode, participantName, isFacilitator = false) {
    if (!this.socket) {
      throw new Error('Socket not connected')
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Join meeting timeout'))
      }, 10000)

      this.socket.once('meeting-joined', (data) => {
        clearTimeout(timeout)
        resolve(data)
      })

      this.socket.once('error', (error) => {
        clearTimeout(timeout)
        reject(new Error(error.message || 'Failed to join meeting'))
      })

      this.socket.emit('join-meeting', {
        meetingCode: meetingCode.toUpperCase(),
        participantName,
        isFacilitator
      })
    })
  }

  // Queue operations
  joinQueue(type = 'speak') {
    if (!this.socket) {
      throw new Error('Socket not connected')
    }
    this.socket.emit('join-queue', { type })
  }

  leaveQueue() {
    if (!this.socket) {
      throw new Error('Socket not connected')
    }
    this.socket.emit('leave-queue')
  }

  // Facilitator operations
  nextSpeaker() {
    if (!this.socket) {
      throw new Error('Socket not connected')
    }
    this.socket.emit('next-speaker')
  }

  // Event listeners
  onQueueUpdated(callback) {
    if (!this.socket) return
    this.socket.on('queue-updated', callback)
  }

  onParticipantsUpdated(callback) {
    if (!this.socket) return
    this.socket.on('participants-updated', callback)
  }

  onParticipantJoined(callback) {
    if (!this.socket) return
    this.socket.on('participant-joined', callback)
  }

  onParticipantLeft(callback) {
    if (!this.socket) return
    this.socket.on('participant-left', callback)
  }

  onNextSpeaker(callback) {
    if (!this.socket) return
    this.socket.on('next-speaker', callback)
  }

  onError(callback) {
    if (!this.socket) return
    this.socket.on('error', callback)
  }

  // Remove listeners
  off(event, callback) {
    if (!this.socket) return
    this.socket.off(event, callback)
  }

  removeAllListeners() {
    if (!this.socket) return
    this.socket.removeAllListeners()
  }
}

export default new SocketService()


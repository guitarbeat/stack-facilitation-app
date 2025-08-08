import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Users, Play, Pause, SkipForward, Settings, LogOut, Crown, Loader2, MessageCircle } from 'lucide-react'
import socketService from '../services/socket'

function FacilitatorView() {
  const { meetingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { facilitatorName, meetingName, meetingCode } = location.state || {}
  
  const [meetingData, setMeetingData] = useState({
    code: meetingCode || meetingId,
    title: meetingName || 'Meeting',
    facilitator: facilitatorName || 'Facilitator',
    isActive: true,
    currentSpeaker: null
  })
  
  const [participants, setParticipants] = useState([])
  const [speakingQueue, setSpeakingQueue] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState('')
  const [currentSpeaker, setCurrentSpeaker] = useState(null)

  useEffect(() => {
    if (!facilitatorName || !meetingCode) {
      navigate('/create')
      return
    }

    // Set up socket listeners
    const setupSocketListeners = () => {
      socketService.onQueueUpdated((queue) => {
        console.log('Queue updated:', queue)
        setSpeakingQueue(queue)
      })

      socketService.onParticipantsUpdated((participantsList) => {
        console.log('Participants updated:', participantsList)
        setParticipants(participantsList)
      })

      socketService.onParticipantJoined((data) => {
        console.log('Participant joined:', data)
      })

      socketService.onParticipantLeft((data) => {
        console.log('Participant left:', data)
      })

      socketService.onNextSpeaker((speaker) => {
        console.log('Next speaker:', speaker)
        setCurrentSpeaker(speaker)
        
        // Clear current speaker after 10 seconds for facilitator
        setTimeout(() => {
          setCurrentSpeaker(null)
        }, 10000)
      })

      socketService.onError((error) => {
        console.error('Socket error:', error)
        setError(error.message || 'Connection error')
      })
    }

    // Connect and join as facilitator
    const connectAsFacilitator = async () => {
      try {
        if (!socketService.isConnected) {
          socketService.connect()
        }
        
        setupSocketListeners()
        
        // Join meeting as facilitator
        await socketService.joinMeeting(meetingCode, facilitatorName, true)
        setIsConnected(true)
      } catch (err) {
        console.error('Failed to connect as facilitator:', err)
        setError('Failed to connect to meeting')
      }
    }

    connectAsFacilitator()

    // Cleanup on unmount
    return () => {
      socketService.removeAllListeners()
    }
  }, [facilitatorName, meetingCode, navigate])

  const nextSpeaker = () => {
    if (speakingQueue.length === 0 || !isConnected) return
    
    try {
      socketService.nextSpeaker()
    } catch (err) {
      console.error('Error calling next speaker:', err)
      setError('Failed to call next speaker')
    }
  }

  const finishSpeaking = () => {
    setCurrentSpeaker(null)
  }

  const leaveMeeting = () => {
    socketService.disconnect()
    navigate('/')
  }

  const getQueueTypeDisplay = (type) => {
    switch (type) {
      case 'direct-response':
        return 'Direct Response'
      case 'point-of-info':
        return 'Point of Info'
      case 'clarification':
        return 'Clarification'
      default:
        return 'Speak'
    }
  }

  const getQueueTypeColor = (type) => {
    switch (type) {
      case 'direct-response':
        return 'bg-orange-100 text-orange-800'
      case 'point-of-info':
        return 'bg-blue-100 text-blue-800'
      case 'clarification':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isConnected && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up meeting...</h2>
          <p className="text-gray-600">Please wait while we prepare your facilitator view.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <LogOut className="w-8 h-8 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/create')}
            className="bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Crown className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{meetingData.title}</h1>
                <p className="text-gray-600">
                  Facilitator View • Code: {meetingData.code}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                <span>{participants.length} participants</span>
              </div>
              <button
                onClick={leaveMeeting}
                className="flex items-center text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                End Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Current Speaker Alert */}
        {currentSpeaker && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Now Speaking</h3>
                  <p className="text-green-700">
                    {currentSpeaker.participantName} - {getQueueTypeDisplay(currentSpeaker.type)}
                  </p>
                </div>
              </div>
              <button
                onClick={finishSpeaking}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Finish Speaking
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Speaking Queue */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Speaking Queue</h2>
              <button
                onClick={nextSpeaker}
                disabled={speakingQueue.length === 0}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  speakingQueue.length === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Next Speaker
              </button>
            </div>
            
            {speakingQueue.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No one in queue</p>
                <p className="text-sm text-gray-400">Participants can raise their hand to join the queue</p>
              </div>
            ) : (
              <div className="space-y-4">
                {speakingQueue.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg border-2 ${
                      index === 0
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`text-sm font-semibold px-3 py-1 rounded-full mr-3 ${
                          index === 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{entry.participantName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${getQueueTypeColor(entry.type)}`}>
                              {getQueueTypeDisplay(entry.type)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(entry.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="flex items-center text-blue-600">
                          <Play className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Next</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Participants */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Participants</h2>
            
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No participants yet</p>
                <p className="text-sm text-gray-400">Share the meeting code to invite people</p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center">
                      {participant.isFacilitator && (
                        <Crown className="w-4 h-4 text-yellow-600 mr-2" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{participant.name}</p>
                        <p className="text-xs text-gray-500">
                          {participant.isFacilitator ? 'Facilitator' : 'Participant'}
                        </p>
                      </div>
                    </div>
                    {participant.isInQueue && (
                      <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        In Queue
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Meeting Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Meeting Code:</strong> {meetingData.code}</p>
                <p><strong>Facilitator:</strong> {meetingData.facilitator}</p>
                <p><strong>Status:</strong> Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacilitatorView


import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Users, Play, Pause, SkipForward, Settings, LogOut, Crown, Loader2, MessageCircle } from 'lucide-react'
import socketService from '../services/socket'
import { useToast } from '../components/ui/ToastProvider.jsx'
import { playBeep } from '../utils/sound.js'

function FacilitatorView() {
  const { meetingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
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

    const setupSocketListeners = () => {
      socketService.onQueueUpdated((queue) => {
        setSpeakingQueue(queue)
      })

      socketService.onParticipantsUpdated((participantsList) => {
        setParticipants(participantsList)
      })

      socketService.onParticipantJoined((data) => {
        showToast({ type: 'info', title: `${data.participant.name} joined` })
      })

      socketService.onParticipantLeft((data) => {
        showToast({ type: 'info', title: `${data.participantName} left` })
      })

      socketService.onNextSpeaker((speaker) => {
        setCurrentSpeaker(speaker)
        showToast({ type: 'success', title: `Next: ${speaker.participantName}` })
        playBeep(1200, 120)
        setTimeout(() => {
          setCurrentSpeaker(null)
        }, 10000)
      })

      socketService.onError((error) => {
        setError(error.message || 'Connection error')
        showToast({ type: 'error', title: error.message || 'Connection error' })
      })
    }

    const connectAsFacilitator = async () => {
      try {
        if (!socketService.isConnected) {
          socketService.connect()
        }
        
        setupSocketListeners()
        
        await socketService.joinMeeting(meetingCode, facilitatorName, true)
        setIsConnected(true)
      } catch (err) {
        setError('Failed to connect to meeting')
      }
    }

    connectAsFacilitator()

    return () => {
      socketService.removeAllListeners()
    }
  }, [facilitatorName, meetingCode, navigate, showToast])

  const nextSpeaker = () => {
    if (speakingQueue.length === 0 || !isConnected) return
    
    try {
      socketService.nextSpeaker()
    } catch (err) {
      setError('Failed to call next speaker')
      showToast({ type: 'error', title: 'Failed to call next speaker' })
      playBeep(220, 200)
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
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">Setting up meeting...</h2>
          <p className="text-gray-600 dark:text-zinc-400">Please wait while we prepare your facilitator view.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md mx-auto dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <LogOut className="w-8 h-8 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">Connection Error</h2>
          <p className="text-gray-600 dark:text-zinc-400 mb-6">{error}</p>
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{meetingData.title}</h1>
              <p className="text-gray-600 dark:text-zinc-400">
                Facilitator View • Code: {meetingData.code}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600 dark:text-zinc-300">
              <Users className="w-5 h-5 mr-2" />
              <span>{participants.length} participants</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(meetingData.code)}
              className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              title="Copy meeting code"
            >
              Copy Code
            </button>
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
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 dark:bg-green-900/10 dark:border-green-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-300">Now Speaking</h3>
                <p className="text-green-700 dark:text-green-400">
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
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Speaking Queue</h2>
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
              <p className="text-gray-500 dark:text-zinc-400 text-lg">No one in queue</p>
              <p className="text-sm text-gray-400 dark:text-zinc-500">Participants can raise their hand to join the queue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {speakingQueue.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border-2 ${
                    index === 0
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/30'
                      : 'border-gray-200 bg-gray-50 dark:bg-zinc-950 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`text-sm font-semibold px-3 py-1 rounded-full mr-3 ${
                        index === 0
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-200'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-zinc-100">{entry.participantName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${getQueueTypeColor(entry.type)}`}>
                            {getQueueTypeDisplay(entry.type)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-zinc-400">
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="flex items-center text-blue-600 dark:text-blue-400">
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
        <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Participants</h2>
          
          {participants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-zinc-400">No participants yet</p>
              <p className="text-sm text-gray-400 dark:text-zinc-500">Share the meeting code to invite people</p>
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-950"
                >
                  <div className="flex items-center">
                    {participant.isFacilitator && (
                      <Crown className="w-4 h-4 text-yellow-600 mr-2" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-zinc-100">{participant.name}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {participant.isFacilitator ? 'Facilitator' : 'Participant'}
                      </p>
                    </div>
                  </div>
                  {participant.isInQueue && (
                    <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full dark:bg-purple-900/20 dark:text-purple-300">
                      In Queue
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Meeting Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800">
            <div className="space-y-2 text-sm text-gray-600 dark:text-zinc-400">
              <p><strong>Meeting Code:</strong> {meetingData.code}</p>
              <p><strong>Facilitator:</strong> {meetingData.facilitator}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacilitatorView


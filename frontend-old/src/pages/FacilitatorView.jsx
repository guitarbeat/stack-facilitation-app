import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Users, Play, Pause, SkipForward, Settings, LogOut, Crown } from 'lucide-react'

function FacilitatorView() {
  const { meetingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { facilitatorName, meetingName } = location.state || {}
  
  const [meetingData, setMeetingData] = useState({
    name: meetingName || 'Meeting',
    facilitator: facilitatorName || 'Facilitator',
    participants: 3,
    isActive: true,
    currentSpeaker: null
  })
  
  const [speakingQueue, setSpeakingQueue] = useState([
    { id: 1, name: 'Sarah Chen', type: 'speak', timestamp: Date.now() - 30000 },
    { id: 2, name: 'Mike Rodriguez', type: 'direct', subtype: 'clarification', timestamp: Date.now() - 15000 },
    { id: 3, name: 'Emma Thompson', type: 'speak', timestamp: Date.now() - 5000 }
  ])
  
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Sarah Chen', joinedAt: Date.now() - 300000 },
    { id: 2, name: 'Mike Rodriguez', joinedAt: Date.now() - 240000 },
    { id: 3, name: 'Emma Thompson', joinedAt: Date.now() - 180000 }
  ])

  useEffect(() => {
    if (!facilitatorName) {
      navigate('/create')
    }
  }, [facilitatorName, navigate])

  const nextSpeaker = () => {
    if (speakingQueue.length === 0) return
    
    const currentSpeaker = speakingQueue[0]
    setMeetingData(prev => ({ ...prev, currentSpeaker: currentSpeaker.name }))
    setSpeakingQueue(prev => prev.slice(1))
  }

  const finishSpeaking = () => {
    setMeetingData(prev => ({ ...prev, currentSpeaker: null }))
  }

  const removeFromQueue = (entryId) => {
    setSpeakingQueue(prev => prev.filter(entry => entry.id !== entryId))
  }

  const moveToTop = (entryId) => {
    setSpeakingQueue(prev => {
      const entry = prev.find(e => e.id === entryId)
      const others = prev.filter(e => e.id !== entryId)
      return [entry, ...others]
    })
  }

  const formatQueueEntry = (entry) => {
    if (entry.type === 'direct') {
      const typeLabels = {
        process: 'Process Point',
        info: 'Information',
        clarification: 'Clarification'
      }
      return `${entry.name} (${typeLabels[entry.subtype] || 'Direct Response'})`
    }
    return entry.name
  }

  const shareableLink = `${window.location.origin}/join?code=${meetingId}`

  if (!facilitatorName) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{meetingData.name}</h1>
                <p className="text-sm text-gray-600">
                  Facilitator: {meetingData.facilitator} • {meetingData.participants} participants
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Meeting Code</div>
                <div className="font-mono font-bold text-lg">{meetingId}</div>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-1" />
                End Meeting
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Current Speaker */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Speaker</h2>
              
              {meetingData.currentSpeaker ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-xl font-medium text-blue-900">
                        {meetingData.currentSpeaker} is speaking
                      </span>
                    </div>
                    <button
                      onClick={finishSpeaking}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Finish Speaking
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg">No one is currently speaking</p>
                  {speakingQueue.length > 0 && (
                    <button
                      onClick={nextSpeaker}
                      className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Next Speaker
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Speaking Queue Management */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Speaking Queue</h2>
                {speakingQueue.length > 0 && !meetingData.currentSpeaker && (
                  <button
                    onClick={nextSpeaker}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Next Speaker
                  </button>
                )}
              </div>
              
              {speakingQueue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Queue is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {speakingQueue.map((entry, index) => (
                    <div 
                      key={entry.id}
                      className="flex items-center p-4 rounded-lg border bg-gray-50"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {formatQueueEntry(entry)}
                        </div>
                        {entry.type === 'direct' && (
                          <div className="text-xs text-orange-600 font-medium">
                            Direct Response
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {index > 0 && (
                          <button
                            onClick={() => moveToTop(entry.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Move Up
                          </button>
                        )}
                        <button
                          onClick={() => removeFromQueue(entry.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meeting Controls */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Meeting Controls</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    meetingData.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {meetingData.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Queue</span>
                  <span className="text-sm font-medium">{speakingQueue.length} waiting</span>
                </div>
              </div>
            </div>

            {/* Share Meeting */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Share Meeting</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Meeting Code</label>
                  <div className="bg-gray-50 border rounded-lg p-3 text-center">
                    <div className="font-mono font-bold text-lg">{meetingId}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(shareableLink)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Copy Share Link
                </button>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Participants ({participants.length})
              </h3>
              <div className="space-y-2">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">{participant.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacilitatorView


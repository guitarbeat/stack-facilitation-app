import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Hand, MessageCircle, Info, Settings, LogOut, Users } from 'lucide-react'

function MeetingRoom() {
  const { meetingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { participantName } = location.state || {}
  
  const [meetingData, setMeetingData] = useState({
    name: 'Weekly Team Meeting',
    facilitator: 'Alex Johnson',
    participants: 8,
    currentSpeaker: null
  })
  
  const [speakingQueue, setSpeakingQueue] = useState([
    { id: 1, name: 'Sarah Chen', type: 'speak', timestamp: Date.now() - 30000 },
    { id: 2, name: 'Mike Rodriguez', type: 'direct', subtype: 'clarification', timestamp: Date.now() - 15000 },
    { id: 3, name: 'Emma Thompson', type: 'speak', timestamp: Date.now() - 5000 }
  ])
  
  const [isInQueue, setIsInQueue] = useState(false)
  const [showDirectOptions, setShowDirectOptions] = useState(false)

  useEffect(() => {
    if (!participantName) {
      navigate('/join')
    }
  }, [participantName, navigate])

  const joinQueue = (type = 'speak', subtype = null) => {
    if (isInQueue) return
    
    const newEntry = {
      id: Date.now(),
      name: participantName,
      type,
      subtype,
      timestamp: Date.now()
    }
    
    setSpeakingQueue(prev => [...prev, newEntry])
    setIsInQueue(true)
    setShowDirectOptions(false)
  }

  const leaveQueue = () => {
    setSpeakingQueue(prev => prev.filter(entry => entry.name !== participantName))
    setIsInQueue(false)
  }

  const getQueuePosition = () => {
    const position = speakingQueue.findIndex(entry => entry.name === participantName)
    return position >= 0 ? position + 1 : null
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

  if (!participantName) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{meetingData.name}</h1>
              <p className="text-sm text-gray-600">
                Facilitated by {meetingData.facilitator} • {meetingData.participants} participants
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-1" />
              Leave
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Speaking Queue */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Speaking Queue
              </h2>
              
              {meetingData.currentSpeaker && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium text-blue-900">
                      {meetingData.currentSpeaker} is speaking
                    </span>
                  </div>
                </div>
              )}

              {speakingQueue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Hand className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No one in queue. Raise your hand to speak!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {speakingQueue.map((entry, index) => (
                    <div 
                      key={entry.id}
                      className={`flex items-center p-3 rounded-lg border ${
                        entry.name === participantName 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mr-3">
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
                      </div>
                      {entry.name === participantName && (
                        <button
                          onClick={leaveQueue}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Leave Queue
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            {/* Your Status */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Status</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Connected as {participantName}</span>
                </div>
                {isInQueue && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">
                      Position #{getQueuePosition()} in queue
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Speaking Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Speaking Actions</h3>
              
              {!isInQueue ? (
                <div className="space-y-3">
                  <button
                    onClick={() => joinQueue('speak')}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Hand className="w-5 h-5 mr-2" />
                    Raise Hand to Speak
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowDirectOptions(!showDirectOptions)}
                      className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Direct Response
                    </button>
                    
                    {showDirectOptions && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => joinQueue('direct', 'process')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b"
                        >
                          <div className="font-medium">Process Point</div>
                          <div className="text-sm text-gray-600">Question about procedure</div>
                        </button>
                        <button
                          onClick={() => joinQueue('direct', 'info')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b"
                        >
                          <div className="font-medium">Information</div>
                          <div className="text-sm text-gray-600">Share relevant info</div>
                        </button>
                        <button
                          onClick={() => joinQueue('direct', 'clarification')}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50"
                        >
                          <div className="font-medium">Clarification</div>
                          <div className="text-sm text-gray-600">Ask for clarification</div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-medium">You're in the queue!</p>
                    <p className="text-green-600 text-sm">Position #{getQueuePosition()}</p>
                  </div>
                  <button
                    onClick={leaveQueue}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Leave Queue
                  </button>
                </div>
              )}
            </div>

            {/* Meeting Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Meeting Info
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Code: <span className="font-mono font-bold">{meetingId}</span></div>
                <div>Participants: {meetingData.participants}</div>
                <div>Queue: {speakingQueue.length} waiting</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingRoom


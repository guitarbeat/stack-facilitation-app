import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Users, LogIn } from 'lucide-react'

function JoinMeeting() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    meetingCode: searchParams.get('code') || '',
    participantName: ''
  })
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinMeeting = async (e) => {
    e.preventDefault()
    setIsJoining(true)

    // Simulate joining process
    setTimeout(() => {
      navigate(`/meeting/${formData.meetingCode}`, {
        state: { 
          participantName: formData.participantName,
          isParticipant: true 
        }
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <LogIn className="w-8 h-8 text-green-600 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Meeting</h1>
              <p className="text-gray-600">Enter the meeting code and your name</p>
            </div>

            <form onSubmit={handleJoinMeeting} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.meetingCode}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    meetingCode: e.target.value.toUpperCase() 
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl font-bold tracking-wider"
                  placeholder="ABC123"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.participantName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    participantName: e.target.value 
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Joining...
                  </div>
                ) : (
                  'Join Meeting'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Don't have a meeting code?{' '}
                <button 
                  onClick={() => navigate('/create')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Create a meeting
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinMeeting


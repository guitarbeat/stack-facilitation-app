import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Copy, QrCode as QrCodeIcon, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'
import apiService from '../services/api'

function CreateMeeting() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [meetingData, setMeetingData] = useState({
    name: '',
    facilitatorName: '',
    meetingCode: '',
    meetingId: '',
    shareableLink: ''
  })
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  const handleCreateMeeting = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Call the real API to create meeting
      const response = await apiService.createMeeting(
        meetingData.facilitatorName,
        meetingData.name
      )
      
      const shareableLink = `${window.location.origin}/join?code=${response.meetingCode}`
      
      // Generate QR Code
      try {
        const qrUrl = await QRCode.toDataURL(shareableLink)
        setQrCodeUrl(qrUrl)
      } catch (err) {
        console.error('Error generating QR code:', err)
      }

      setMeetingData(prev => ({
        ...prev,
        meetingCode: response.meetingCode,
        meetingId: response.meetingId,
        shareableLink
      }))
      setStep(2)
    } catch (err) {
      console.error('Error creating meeting:', err)
      setError('Failed to create meeting. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // Could add toast notification here
  }

  const startMeeting = () => {
    navigate(`/facilitate/${meetingData.meetingCode}`, {
      state: { 
        facilitatorName: meetingData.facilitatorName,
        meetingName: meetingData.name,
        meetingCode: meetingData.meetingCode
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => step === 1 ? navigate('/') : setStep(1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        {step === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Meeting</h1>
              <p className="text-gray-600">Set up your meeting and get a shareable link</p>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Name
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={meetingData.name}
                  onChange={(e) => setMeetingData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="e.g., Weekly Team Meeting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Facilitator)
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={meetingData.facilitatorName}
                  onChange={(e) => setMeetingData(prev => ({ ...prev, facilitatorName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Your name"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Meeting...
                  </>
                ) : (
                  'Create Meeting'
                )}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <QrCodeIcon className="w-8 h-8 text-green-600 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Created!</h1>
              <p className="text-gray-600">Share this code or link with participants</p>
            </div>

            <div className="space-y-6">
              {/* Meeting Code */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Code
                </label>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {meetingData.meetingCode}
                  </div>
                  <button
                    onClick={() => copyToClipboard(meetingData.meetingCode)}
                    className="flex items-center justify-center mx-auto text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Code
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code
                  </label>
                  <div className="flex justify-center">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
              )}

              {/* Shareable Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={meetingData.shareableLink}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(meetingData.shareableLink)}
                    className="px-4 py-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={startMeeting}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Start Meeting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateMeeting


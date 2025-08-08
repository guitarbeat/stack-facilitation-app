// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  async createMeeting(facilitatorName, meetingTitle) {
    try {
      const response = await fetch(`${this.baseUrl}/api/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilitatorName,
          meetingTitle
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating meeting:', error)
      throw error
    }
  }

  async getMeeting(meetingCode) {
    try {
      const response = await fetch(`${this.baseUrl}/api/meetings/${meetingCode}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Meeting not found')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting meeting:', error)
      throw error
    }
  }

  getJoinUrl(meetingCode) {
    return `${this.baseUrl}/join/${meetingCode}`
  }

  getSocketUrl() {
    return this.baseUrl
  }
}

export default new ApiService()


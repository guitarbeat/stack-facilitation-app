import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateMeeting from './pages/CreateMeeting'
import JoinMeeting from './pages/JoinMeeting'
import MeetingRoom from './pages/MeetingRoom'
import FacilitatorView from './pages/FacilitatorView'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateMeeting />} />
        <Route path="/join" element={<JoinMeeting />} />
        <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
        <Route path="/facilitate/:meetingId" element={<FacilitatorView />} />
      </Routes>
    </div>
  )
}

export default App


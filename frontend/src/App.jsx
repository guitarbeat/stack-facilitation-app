import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateMeeting from './pages/CreateMeeting'
import JoinMeeting from './pages/JoinMeeting'
import MeetingRoom from './pages/MeetingRoom'
import FacilitatorView from './pages/FacilitatorView'
import AppLayout from './components/layout/AppLayout'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateMeeting />} />
        <Route path="/join" element={<JoinMeeting />} />
        <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
        <Route path="/facilitate/:meetingId" element={<FacilitatorView />} />
      </Routes>
    </AppLayout>
  )
}

export default App


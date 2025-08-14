import { Link, useLocation } from 'react-router-dom'
import { Users } from 'lucide-react'

function AppLayout({ children }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-full">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Stack Facilitation</span>
          </Link>
          <nav className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/create"
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/create') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Create
            </Link>
            <Link
              to="/join"
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/join') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Join
            </Link>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}

export default AppLayout
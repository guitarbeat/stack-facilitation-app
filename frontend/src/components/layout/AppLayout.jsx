import { Link, useLocation } from 'react-router-dom'
import { Users } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle.jsx'

function AppLayout({ children }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-zinc-950 dark:to-zinc-900">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-full">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-zinc-100">Stack Facilitation</span>
          </Link>
          <div className="flex items-center space-x-3">
            <nav className="flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Home
              </Link>
              <Link
                to="/create"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/create') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Create
              </Link>
              <Link
                to="/join"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/join') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Join
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}

export default AppLayout
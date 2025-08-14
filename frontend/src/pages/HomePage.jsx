import { Link } from 'react-router-dom'
import { Users, MessageSquare, QrCode } from 'lucide-react'

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full">
            <Users className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-zinc-100 mb-4">
          Stack Facilitation
        </h1>
        <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Simple, inclusive meeting facilitation. Create a meeting or join with a code - just like Kahoot!
        </p>
      </div>

      {/* Main Actions */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
        {/* Create Meeting */}
        <Link 
          to="/create"
          className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-900/40 hover:-translate-y-1"
        >
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
              <MessageSquare className="w-8 h-8 text-blue-600 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-3">Create Meeting</h2>
            <p className="text-gray-600 dark:text-zinc-400 mb-6">
              Start a new meeting and get a shareable link for participants
            </p>
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold group-hover:bg-blue-700 transition-colors">
              Create Now
            </div>
          </div>
        </Link>

        {/* Join Meeting */}
        <Link 
          to="/join"
          className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-green-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-green-900/40 hover:-translate-y-1"
        >
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-green-200 transition-colors">
              <QrCode className="w-8 h-8 text-green-600 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-3">Join Meeting</h2>
            <p className="text-gray-600 dark:text-zinc-400 mb-6">
              Enter a meeting code to join an existing meeting
            </p>
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold group-hover:bg-green-700 transition-colors">
              Join Now
            </div>
          </div>
        </Link>
      </div>

      {/* How it Works */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-zinc-100 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-zinc-100">Create or Join</h3>
            <p className="text-gray-600 dark:text-zinc-400">Facilitator creates a meeting, participants join with a code</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-zinc-100">Enter Your Name</h3>
            <p className="text-gray-600 dark:text-zinc-400">No accounts needed - just enter your name to participate</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-zinc-100">Speaking Queue</h3>
            <p className="text-gray-600 dark:text-zinc-400">Raise your hand to speak or make direct responses</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage


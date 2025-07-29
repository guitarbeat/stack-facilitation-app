import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useMeetingStore from './store/meetingStore';
import HomePage from './components/HomePage';
import CreateMeeting from './components/CreateMeeting';
import JoinMeeting from './components/JoinMeeting';
import MeetingRoom from './components/MeetingRoom';
import UserSetup from './components/UserSetup';
import ErrorBoundary from './components/ErrorBoundary';
import SkipLink from './components/accessibility/SkipLink';
import LiveRegion from './components/accessibility/LiveRegion';
import './styles/globals.css';

function App() {
  const { connectSocket, disconnectSocket } = useMeetingStore();

  useEffect(() => {
    // Connect to WebSocket on app start
    connectSocket();

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <SkipLink />
        <LiveRegion />
        
        <Router>
          <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-neutral-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Stack Facilitation
                </h1>
                <p className="text-sm text-neutral-600 mt-2">
                  Inclusive cooperative meeting facilitation with accessibility at its core
                </p>
              </motion.div>
            </div>
          </header>

          <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none" tabIndex="-1">
            <AnimatePresence mode="wait">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <motion.div
                      key="home"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <HomePage />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/setup" 
                  element={
                    <motion.div
                      key="setup"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <UserSetup />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/create" 
                  element={
                    <motion.div
                      key="create"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CreateMeeting />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/join" 
                  element={
                    <motion.div
                      key="join"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <JoinMeeting />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/meeting/:meetingId" 
                  element={
                    <motion.div
                      key="meeting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <MeetingRoom />
                    </motion.div>
                  } 
                />
              </Routes>
            </AnimatePresence>
          </main>

          <footer className="bg-white/80 backdrop-blur-sm border-t border-neutral-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-sm text-neutral-600 space-y-2">
                  <p className="font-medium">
                    Built with ❤️ for cooperative democracy and inclusive decision-making
                  </p>
                  <div className="flex justify-center items-center space-x-4 text-xs">
                    <span className="inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      Open Source
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      WCAG 2.2 AA
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                      Privacy-First
                    </span>
                  </div>
                  <div className="pt-4 border-t border-neutral-200 mt-6">
                    <a 
                      href="#code-of-conduct" 
                      className="text-primary-600 hover:text-primary-700 underline transition-colors duration-200 mr-4"
                      aria-label="View Code of Conduct"
                    >
                      Code of Conduct
                    </a>
                    <a 
                      href="#privacy" 
                      className="text-primary-600 hover:text-primary-700 underline transition-colors duration-200 mr-4"
                      aria-label="View Privacy Policy"
                    >
                      Privacy Policy
                    </a>
                    <a 
                      href="#accessibility" 
                      className="text-primary-600 hover:text-primary-700 underline transition-colors duration-200"
                      aria-label="View Accessibility Statement"
                    >
                      Accessibility
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </footer>
        </Router>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: 'var(--color-neutral-800)',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '0.875rem',
              fontWeight: '500',
              maxWidth: '400px',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-success-500)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--color-error-500)',
                secondary: 'white',
              },
            },
            loading: {
              iconTheme: {
                primary: 'var(--color-primary-500)',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;


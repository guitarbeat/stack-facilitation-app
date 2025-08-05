import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusCircleIcon, 
  UserGroupIcon, 
  HandRaisedIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  EyeIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: HandRaisedIcon,
      title: 'Stack Management',
      description: 'Transparent speaking queue with progressive stack support for inclusive participation',
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Direct Responses',
      description: 'Quick interventions for clarification and process points without disrupting flow',
      color: 'from-secondary-500 to-secondary-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Consensus Building',
      description: 'Structured proposal and consent-based decision making tools',
      color: 'from-success-500 to-success-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Safety First',
      description: 'Built-in Code of Conduct and incident reporting for safe spaces',
      color: 'from-warning-500 to-warning-600'
    },
    {
      icon: EyeIcon,
      title: 'Accessible Design',
      description: 'WCAG 2.2 AA compliant with screen reader support and keyboard navigation',
      color: 'from-info-500 to-info-600'
    },
    {
      icon: SparklesIcon,
      title: 'Real-time Updates',
      description: 'Live synchronization across all participants with offline support',
      color: 'from-primary-600 to-secondary-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <HeartIcon className="w-4 h-4" />
          Built for cooperative democracy
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Stack Facilitation
          </span>
        </h2>
        
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8 leading-relaxed">
          An open, inclusive web application designed to help cooperatives and community groups 
          run effective meetings using stack-based facilitation methods with accessibility at its core.
        </p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <button
            onClick={() => navigate('/create')}
            className="btn btn-primary btn-lg group inline-flex items-center gap-2 min-w-[200px]"
          >
            <PlusCircleIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Create Meeting
          </button>
          
          <button
            onClick={() => navigate('/join')}
            className="btn btn-outline btn-lg group inline-flex items-center gap-2 min-w-[200px]"
          >
            <UserGroupIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            Join Meeting
          </button>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="card bg-gradient-to-br from-primary-50 via-white to-secondary-50 border-primary-200 shadow-lg"
      >
        <div className="card-header">
          <h3 className="text-2xl font-bold text-neutral-900 text-center">
            How Stack Facilitation Works
          </h3>
          <p className="text-neutral-600 text-center mt-2">
            A democratic approach to meeting facilitation that ensures every voice is heard
          </p>
        </div>
        
        <div className="card-body space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Speaking Stack</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Participants "raise their hand" to join a visible queue. The facilitator manages 
                    the order, ensuring everyone gets a chance to speak.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-secondary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Progressive Stack (Optional)</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Prioritizes voices that are often marginalized, using self-selected tags like 
                    "new to group" or "affected by decision" to promote inclusive participation.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-success-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Direct Responses & Points</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Quick interventions for process questions, information sharing, or clarification 
                    without waiting in the full queue.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-warning-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Consensus Decision Making</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Structured proposal process with consent-based voting: agree, stand aside, 
                    concerns, or block with transparent decision recording.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="text-center"
      >
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span>Open Source</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span>Privacy-First</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
            <span>WCAG 2.2 AA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
            <span>Community-Driven</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-info-500 rounded-full"></div>
            <span>Works Offline</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default HomePage;


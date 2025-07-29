# Stack Facilitation App

An open, inclusive web application that helps cooperatives and democratic organizations run meetings using "stack" facilitation methods. This tool supports transparent queue management, progressive stack prioritization, consent-based decision making, and comprehensive accessibility features.

## 🌟 Features

### Core Meeting Functionality
- **Meeting Creation & Joining**: Simple PIN-based meeting access
- **User Roles**: Facilitator, Stack Keeper, Participant, Observer
- **Speaking Queue Management**: Transparent ordering with position tracking
- **Real-time Updates**: WebSocket-powered live synchronization
- **Meeting Export**: Markdown and CSV export of meeting minutes

### Advanced Queue Management
- **Stack Types**: Hand raising, direct responses, points (process/info/clarification)
- **Progressive Stack**: Prioritizes underrepresented voices with configurable invite tags
- **Transparent Ordering**: Clear explanations of queue position reasoning
- **Direct Response System**: Time-limited responses to current speaker

### Proposal & Decision Making
- **Consent-Based Voting**: Agree, Stand Aside, Concern, Block options
- **Proposal Tracking**: Full lifecycle from creation to resolution
- **Voting History**: Transparent record of all decisions
- **Amendment Support**: Modify proposals based on feedback

### Accessibility & Inclusion
- **WCAG 2.2 AA Compliant**: Full screen reader support and keyboard navigation
- **Live Regions**: Real-time announcements for assistive technologies
- **Focus Management**: Proper focus handling for dynamic content
- **Skip Links**: Quick navigation for keyboard users
- **High Contrast**: Accessible color schemes and typography

### Safety & Governance
- **Code of Conduct**: Built-in community guidelines with enforcement
- **Incident Reporting**: Anonymous reporting system for violations
- **Privacy Controls**: Granular settings for data sharing and visibility
- **Data Retention**: Configurable automatic data deletion
- **Moderation Tools**: Facilitator controls for managing disruptive behavior

### Technical Features
- **Progressive Web App (PWA)**: Installable with offline functionality
- **Offline Support**: IndexedDB storage with conflict-free sync
- **Internationalization**: Multi-language support with RTL text
- **Cross-Platform**: Works on desktop, tablet, and mobile devices
- **Real-time Collaboration**: Instant updates across all participants

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/guitarbeat/stack-facilitation-app.git
cd stack-facilitation-app

# Start with Docker Compose
docker-compose up -d

# Access the application
open http://localhost:3001
```

### Manual Installation

#### Prerequisites
- Node.js 20+ 
- PostgreSQL 15+
- pnpm (recommended) or npm

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database configuration
npx prisma migrate dev
npm run dev
```

#### Frontend Setup
```bash
cd frontend
pnpm install
pnpm run dev
```

## 📖 Usage Guide

### Creating a Meeting

1. **Navigate to Home**: Visit the application homepage
2. **Click "Create Meeting"**: Start the meeting creation process
3. **Fill Meeting Details**:
   - Meeting title and description
   - Your name and role as facilitator
   - Meeting settings (progressive stack, time limits, etc.)
4. **Share the PIN**: Distribute the 6-character meeting PIN to participants

### Joining a Meeting

1. **Click "Join Meeting"**: From the homepage
2. **Enter Meeting PIN**: The 6-character code from the facilitator
3. **Provide Your Information**:
   - Display name and pronouns (optional)
   - Select any relevant identity tags for progressive stack
   - Choose your role (participant or observer)
4. **Accept Code of Conduct**: Review and accept community guidelines

### Participating in Discussions

#### Joining the Speaking Queue

1. **Click "Join Speaking Queue"**: When you want to speak
2. **Select Queue Type**:
   - **Raise Hand**: General comment or question
   - **Direct Response**: Response to current speaker (time-limited)
   - **Point of Process**: Question about meeting procedure
   - **Point of Information**: Factual information to share
   - **Point of Clarification**: Request for clarification

#### Understanding Your Position

- **Position Number**: Your place in the speaking queue
- **Ordering Reason**: Explanation of why you're in this position
- **Progressive Stack Info**: How identity tags affect your priority
- **Estimated Wait Time**: Approximate time until your turn

#### Speaking

- **Wait for Facilitator**: You'll be called when it's your turn
- **Respect Time Limits**: Keep comments within allocated time
- **Use Hand Signals**: Indicate agreement, concerns, or process points
- **Stay on Topic**: Keep comments relevant to current discussion

### Making Proposals

#### Creating a Proposal

1. **Click "Create Proposal"**: Available to all participants
2. **Fill Proposal Details**:
   - Clear, concise title
   - Detailed description of what you're proposing
   - Any relevant background information
3. **Submit for Discussion**: Proposal enters active discussion phase

#### Voting Process

1. **Review Proposal**: Read the full text and any amendments
2. **Participate in Discussion**: Use speaking queue to share thoughts
3. **Cast Your Vote** when called:
   - **Agree**: You support the proposal
   - **Stand Aside**: You don't support but won't block
   - **Concern**: You have reservations that need addressing
   - **Block**: You believe this would harm the group (rare)

#### Consent-Based Decision Making

- **Consensus Goal**: Aim for decisions everyone can live with
- **Address Concerns**: Work together to modify proposals
- **Respect Blocks**: Serious objections require discussion
- **Document Decisions**: All outcomes are recorded

## 🛠️ Development

### Project Structure

```
stack-facilitation-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API and utility services
│   │   ├── store/          # Zustand state management
│   │   └── i18n/           # Internationalization
│   ├── public/             # Static assets
│   └── tests/              # Frontend tests
├── backend/                 # Node.js/Fastify backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── ordering/       # Queue ordering algorithms
│   │   └── types/          # TypeScript type definitions
│   ├── prisma/             # Database schema and migrations
│   └── tests/              # Backend tests
├── docker/                 # Docker configuration files
├── deploy/                 # Deployment scripts and configs
└── docs/                   # Additional documentation
```

### Technology Stack

#### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Accessible component library
- **Socket.io Client**: Real-time communication
- **Workbox**: Service worker and PWA functionality

#### Backend  
- **Node.js 20**: JavaScript runtime
- **Fastify**: Fast and efficient web framework
- **Prisma**: Type-safe database ORM
- **Socket.io**: WebSocket server for real-time features
- **TypeScript**: Type safety and better developer experience

#### Database & Infrastructure
- **PostgreSQL**: Robust relational database
- **Redis**: Session storage and caching (optional)
- **Docker**: Containerization and deployment
- **Nginx**: Reverse proxy and static file serving

### Running Tests

```bash
# Backend unit tests
cd backend && npm test

# Frontend unit tests  
cd frontend && pnpm test

# End-to-end tests
cd frontend && pnpm test:e2e

# All tests with coverage
npm run test:all
```

### Building for Production

```bash
# Build frontend
cd frontend && pnpm build

# Build backend
cd backend && npm run build

# Build Docker image
docker build -t stack-facilitation .
```

## 🚀 Deployment

### Fly.io (Recommended)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
./deploy/deploy.sh fly
```

### Docker Compose

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Other Platforms

The application can be deployed to any platform supporting Node.js and PostgreSQL:

- **Render**: Connect GitHub repo with automatic deployments
- **Railway**: One-click deployment with built-in PostgreSQL
- **Heroku**: Use provided Procfile and buildpacks
- **DigitalOcean App Platform**: Deploy directly from GitHub
- **AWS/GCP/Azure**: Use container services with provided Dockerfile

### Environment Variables

Required environment variables for production:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-secure-random-secret
CORS_ORIGIN=https://your-domain.com
```

Optional environment variables:

```bash
REDIS_URL=redis://host:port
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
MAX_MEETING_PARTICIPANTS=100
DEFAULT_MEETING_DURATION_HOURS=4
```

## 🔧 Configuration

### Meeting Settings

Facilitators can configure various meeting parameters:

- **Progressive Stack**: Enable prioritization of underrepresented voices
- **Invite Tags**: Custom tags for progressive stack (e.g., "new_member", "directly_affected")
- **Time Limits**: Speaking time per person and total meeting duration
- **Queue Limits**: Maximum queue size and direct response limits
- **Privacy Settings**: Data retention, recording permissions, visibility controls

### Accessibility Settings

- **Screen Reader Optimization**: Enhanced ARIA labels and live regions
- **Keyboard Navigation**: Full functionality without mouse
- **High Contrast Mode**: Improved visibility for low vision users
- **Font Size Scaling**: Adjustable text size for readability
- **Motion Reduction**: Respect user preferences for reduced motion

### Internationalization

Currently supported languages:
- English (en)
- Spanish (es) 
- French (fr)
- German (de)
- Arabic (ar) - with RTL support
- Hebrew (he) - with RTL support

To add a new language:
1. Add translations to `frontend/src/i18n/index.js`
2. Configure language settings (direction, date format, etc.)
3. Test with right-to-left languages if applicable

## 🤝 Contributing

We welcome contributions from the community! This project is built by and for cooperative and democratic organizations.

### Getting Started

1. **Fork the Repository**: Create your own copy on GitHub
2. **Clone Locally**: `git clone https://github.com/your-username/stack-facilitation-app.git`
3. **Create Branch**: `git checkout -b feature/your-feature-name`
4. **Make Changes**: Implement your feature or fix
5. **Test Thoroughly**: Run all tests and add new ones
6. **Submit PR**: Create a pull request with clear description

### Development Guidelines

- **Code Style**: Use Prettier and ESLint configurations
- **Commit Messages**: Follow conventional commit format
- **Testing**: Maintain test coverage above 80%
- **Accessibility**: Ensure all features are accessible
- **Documentation**: Update docs for any user-facing changes

### Areas for Contribution

- **Translations**: Add support for more languages
- **Accessibility**: Improve screen reader support and keyboard navigation
- **Mobile Experience**: Enhance touch interfaces and responsive design
- **Facilitation Features**: Add new meeting tools and processes
- **Integration**: Connect with other cooperative tools and platforms

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). This ensures that:

- The software remains free and open source
- Any modifications must be shared back to the community
- Network use (like hosting a service) requires sharing source code
- Commercial use is permitted with proper attribution

See the [LICENSE](LICENSE) file for full details.

## 🙏 Acknowledgments

This project is inspired by and built for the cooperative movement, democratic organizations, and communities working toward more inclusive decision-making processes.

Special thanks to:
- **Cooperative movement organizers** who provided requirements and feedback
- **Accessibility advocates** who guided inclusive design principles  
- **Open source contributors** who built the tools this project depends on
- **Democratic process facilitators** who shared their expertise

## 📞 Support

### Getting Help

- **Documentation**: Check this README and the docs/ folder
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Email**: Contact the maintainers at [email]

### Reporting Security Issues

Please report security vulnerabilities privately to [security-email]. Do not create public issues for security problems.

### Community Guidelines

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inclusive environment for all contributors and users.

---

**Built with ❤️ for cooperative democracy and inclusive decision-making.**


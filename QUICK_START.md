# Quick Start Guide

Get the Stack Facilitation App running locally in minutes!

## Prerequisites

- Node.js 20+ 
- PostgreSQL 15+
- pnpm (recommended) or npm

## 🚀 Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/guitarbeat/stack-facilitation-app.git
cd stack-facilitation-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
pnpm install
```

### 2. Database Setup

```bash
# Start PostgreSQL (varies by system)
# macOS with Homebrew:
brew services start postgresql

# Ubuntu/Debian:
sudo systemctl start postgresql

# Create database
createdb stack_facilitation

# Set up environment
cd ../backend
cp .env.example .env
# Edit .env with your database URL
```

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Optional: Seed with sample data
npx prisma db seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
pnpm dev
```

### 5. Open Your Browser

Visit `http://localhost:5173` to see the app!

## 🐳 Docker Quick Start

Even faster with Docker:

```bash
git clone https://github.com/guitarbeat/stack-facilitation-app.git
cd stack-facilitation-app

# Start everything
docker-compose up -d

# Visit http://localhost:3001
```

## 🎯 First Meeting

1. Click "Create Meeting"
2. Fill in meeting details
3. Share the 6-character PIN with participants
4. Start facilitating!

## 📚 Next Steps

- Read the [README](README.md) for detailed documentation
- Check out the [Facilitation Guide](docs/FACILITATION_GUIDE.md)
- Review the [Moderation Guide](docs/MODERATION_GUIDE.md)

## 🆘 Need Help?

- Check the [Issues](https://github.com/guitarbeat/stack-facilitation-app/issues) page
- Read the full documentation in the `docs/` folder
- Review the deployment options in `deploy/`

Happy facilitating! 🎉


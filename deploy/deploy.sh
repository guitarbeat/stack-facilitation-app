#!/bin/bash
set -e

# Stack Facilitation App Deployment Script
# Supports multiple deployment targets: Fly.io, Render, Railway, Docker

DEPLOYMENT_TARGET=${1:-"fly"}
APP_NAME="stack-facilitation"

echo "🚀 Deploying Stack Facilitation App to $DEPLOYMENT_TARGET"

# Check if required tools are installed
check_dependencies() {
    case $DEPLOYMENT_TARGET in
        "fly")
            if ! command -v flyctl &> /dev/null; then
                echo "❌ flyctl is not installed. Please install it first:"
                echo "   curl -L https://fly.io/install.sh | sh"
                exit 1
            fi
            ;;
        "docker")
            if ! command -v docker &> /dev/null; then
                echo "❌ Docker is not installed. Please install Docker first."
                exit 1
            fi
            ;;
    esac
}

# Build and test the application
build_and_test() {
    echo "📦 Building application..."
    
    # Build frontend
    cd frontend
    npm install
    npm run build
    cd ..
    
    # Build backend
    cd backend
    npm install
    npm run build
    cd ..
    
    echo "✅ Build completed successfully"
    
    # Run tests
    echo "🧪 Running tests..."
    cd backend && npm test && cd ..
    cd frontend && npm test && cd ..
    echo "✅ All tests passed"
}

# Deploy to Fly.io
deploy_fly() {
    echo "🛫 Deploying to Fly.io..."
    
    # Check if app exists
    if ! flyctl apps list | grep -q "$APP_NAME"; then
        echo "📱 Creating new Fly.io app..."
        flyctl apps create "$APP_NAME" --org personal
        
        # Create PostgreSQL database
        echo "🗄️ Creating PostgreSQL database..."
        flyctl postgres create --name "$APP_NAME-db" --org personal --region sea
        flyctl postgres attach --app "$APP_NAME" "$APP_NAME-db"
    fi
    
    # Set secrets
    echo "🔐 Setting up secrets..."
    flyctl secrets set SESSION_SECRET="$(openssl rand -base64 32)" --app "$APP_NAME"
    flyctl secrets set CORS_ORIGIN="https://$APP_NAME.fly.dev" --app "$APP_NAME"
    
    # Deploy
    flyctl deploy --config deploy/fly.toml --app "$APP_NAME"
    
    echo "✅ Deployed to https://$APP_NAME.fly.dev"
}

# Deploy with Docker locally
deploy_docker() {
    echo "🐳 Deploying with Docker..."
    
    # Build image
    docker build -t "$APP_NAME:latest" .
    
    # Run with docker-compose
    docker-compose down
    docker-compose up -d
    
    echo "✅ Deployed locally at http://localhost:3001"
}

# Deploy to Render
deploy_render() {
    echo "🎨 Deploying to Render..."
    echo "Please follow these steps:"
    echo "1. Push your code to GitHub"
    echo "2. Connect your GitHub repo to Render"
    echo "3. Use the following settings:"
    echo "   - Build Command: npm install && npm run build"
    echo "   - Start Command: npm start"
    echo "   - Environment: Node.js"
    echo "4. Add environment variables in Render dashboard"
    echo "   - NODE_ENV=production"
    echo "   - DATABASE_URL=<your-postgres-url>"
    echo "   - SESSION_SECRET=<random-secret>"
}

# Deploy to Railway
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI is not installed. Please install it first:"
        echo "   npm install -g @railway/cli"
        exit 1
    fi
    
    # Login and deploy
    railway login
    railway link
    railway up
    
    echo "✅ Deployed to Railway"
}

# Main deployment flow
main() {
    echo "🏗️ Starting deployment process..."
    
    check_dependencies
    build_and_test
    
    case $DEPLOYMENT_TARGET in
        "fly")
            deploy_fly
            ;;
        "docker")
            deploy_docker
            ;;
        "render")
            deploy_render
            ;;
        "railway")
            deploy_railway
            ;;
        *)
            echo "❌ Unknown deployment target: $DEPLOYMENT_TARGET"
            echo "Supported targets: fly, docker, render, railway"
            exit 1
            ;;
    esac
    
    echo "🎉 Deployment completed successfully!"
}

# Run main function
main


#!/bin/bash
set -e

# Stack Facilitation App Deployment Script
# Supports deployment targets: Render, Railway

DEPLOYMENT_TARGET=${1:-"render"}
APP_NAME="stack-facilitation"

echo "🚀 Deploying Stack Facilitation App to $DEPLOYMENT_TARGET"

# Check if required tools are installed
check_dependencies() {
	case $DEPLOYMENT_TARGET in
		"railway")
			if ! command -v railway &> /dev/null; then
				echo "❌ Railway CLI is not installed. Please install it first:"
				echo "   npm install -g @railway/cli"
				exit 1
			fi
			;;
		"render")
			# No CLI required; guide-based deployment
			;;
	esac
}

# Build the application (no tests configured)
build_and_test() {
	echo "📦 Building application..."
	
	# Build frontend
	cd frontend
	npm install
	npm run build
	cd ..
	
	# Prepare backend (no build step needed)
	cd simple-backend
	npm install
	cd ..
	
	echo "✅ Build steps completed"
	echo "🧪 Skipping tests (none configured)"
}

# Deploy to Render (instructions output)
deploy_render() {
	echo "🎨 Deploying to Render..."
	echo "Please follow these steps:"
	echo "1. Push your code to GitHub"
	echo "2. Connect your GitHub repo to Render"
	echo "3. Create two services:"
	echo "   - Backend (Web Service):"
	echo "     Root Directory: simple-backend"
	echo "     Build Command: npm install"
	echo "     Start Command: npm start"
	echo "   - Frontend (Static Site):"
	echo "     Root Directory: frontend"
	echo "     Build Command: npm install && npm run build"
	echo "     Publish Directory: dist"
	echo "4. Set environment variables in Render:"
	echo "   - Backend: NODE_ENV=production (optional FRONTEND_URL=https://your-frontend.onrender.com)"
	echo "   - Frontend: VITE_API_URL=https://your-backend.onrender.com"
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
		"render")
			deploy_render
			;;
		"railway")
			deploy_railway
			;;
		*)
			echo "❌ Unknown deployment target: $DEPLOYMENT_TARGET"
			echo "Supported targets: render, railway"
			exit 1
			;;
	esac
	
	echo "🎉 Deployment completed successfully!"
}

# Run main function
main


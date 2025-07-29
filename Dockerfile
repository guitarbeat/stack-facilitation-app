# Multi-stage Dockerfile for Stack Facilitation App
# Builds both frontend and backend in a single container

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN pnpm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package.json backend/package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runtime

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy built backend
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/dist ./dist
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/node_modules ./node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/package.json ./package.json
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/prisma ./prisma

# Copy built frontend to backend's static directory
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/dist ./static

# Copy startup scripts
COPY --chown=nodejs:nodejs docker/start.sh ./start.sh
COPY --chown=nodejs:nodejs docker/healthcheck.sh ./healthcheck.sh

# Make scripts executable
RUN chmod +x ./start.sh ./healthcheck.sh

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ./healthcheck.sh

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["./start.sh"]


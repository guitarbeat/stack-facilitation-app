import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import staticFiles from '@fastify/static';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import routes
import meetingRoutes from './routes/meetings.js';
import userRoutes from './routes/users.js';
import queueRoutes from './routes/queue.js';
import proposalRoutes from './routes/proposals.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma client
export const prisma = new PrismaClient();

// Initialize Fastify
const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(cors, {
  origin: true,
  credentials: true
});

// Register WebSocket support
await fastify.register(websocket);

// Register static file serving for frontend
await fastify.register(staticFiles, {
  root: path.join(__dirname, '../../frontend/dist'),
  prefix: '/'
});

// WebSocket connection handler
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', message => {
      // Handle WebSocket messages
      const data = JSON.parse(message.toString());
      console.log('WebSocket message:', data);
      
      // Echo back for now - will implement proper handling
      connection.socket.send(JSON.stringify({
        type: 'echo',
        data: data
      }));
    });
    
    connection.socket.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register API routes
await fastify.register(meetingRoutes, { prefix: '/api/meetings' });
await fastify.register(userRoutes, { prefix: '/api/users' });
await fastify.register(queueRoutes, { prefix: '/api/queue' });
await fastify.register(proposalRoutes, { prefix: '/api/proposals' });

// Health check endpoint
fastify.get('/api/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`Server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();


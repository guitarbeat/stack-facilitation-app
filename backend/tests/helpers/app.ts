import Fastify, { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Import routes
import meetingRoutes from '../../src/routes/meetings.js';
import userRoutes from '../../src/routes/users.js';
import queueRoutes from '../../src/routes/queue.js';
import proposalRoutes from '../../src/routes/proposals.js';
import incidentRoutes from '../../src/routes/incidents.js';

export async function build(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false // Disable logging in tests
  });

  // Register CORS
  await app.register(import('@fastify/cors'), {
    origin: true
  });

  // Register routes
  await app.register(meetingRoutes, { prefix: '/api/meetings' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(queueRoutes, { prefix: '/api/queue' });
  await app.register(proposalRoutes, { prefix: '/api/proposals' });
  await app.register(incidentRoutes, { prefix: '/api/incidents' });

  return app;
}


import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index.js';
import { v4 as uuidv4 } from 'uuid';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Create or get anonymous user
  fastify.post('/anonymous', async (request, reply) => {
    const { displayName, pronouns } = request.body as any;

    try {
      const user = await prisma.user.create({
        data: {
          displayName: displayName || `Anonymous ${Math.random().toString(36).substring(2, 8)}`,
          pronouns,
          isAnonymous: true
        }
      });

      return user;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to create anonymous user' });
    }
  });

  // Create registered user (for future magic link auth)
  fastify.post('/register', async (request, reply) => {
    const { displayName, email, pronouns } = request.body as any;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return reply.code(400).send({ error: 'User already exists' });
      }

      const user = await prisma.user.create({
        data: {
          displayName,
          email,
          pronouns,
          isAnonymous: false
        }
      });

      return user;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to create user' });
    }
  });

  // Get user by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          meetingParticipants: {
            include: {
              meeting: true
            }
          }
        }
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return user;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch user' });
    }
  });

  // Update user profile
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { displayName, pronouns, consentToRecording } = request.body as any;

    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          displayName,
          pronouns,
          consentToRecording
        }
      });

      return user;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to update user' });
    }
  });

  // Get user's meeting history
  fastify.get('/:id/meetings', async (request, reply) => {
    const { id } = request.params as any;

    try {
      const meetings = await prisma.meetingParticipant.findMany({
        where: { userId: id },
        include: {
          meeting: true
        },
        orderBy: {
          joinedAt: 'desc'
        }
      });

      return meetings.map(mp => mp.meeting);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch user meetings' });
    }
  });
};

export default userRoutes;


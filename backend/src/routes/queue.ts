import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index.js';
import { StackComparator } from '../ordering/stackComparator.js';
import { QueueItemType, QueueItemStatus } from '@prisma/client';

const queueRoutes: FastifyPluginAsync = async (fastify) => {
  // Add item to queue (raise hand, direct response, points)
  fastify.post('/:meetingId/add', async (request, reply) => {
    const { meetingId } = request.params as any;
    const { userId, type, metadata = {} } = request.body as any;

    try {
      // Check if meeting exists and is active
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId }
      });

      if (!meeting || !meeting.isActive) {
        return reply.code(400).send({ error: 'Meeting not found or inactive' });
      }

      const settings = meeting.settings as any;

      // Check direct response limits
      if (type === QueueItemType.DIRECT_RESPONSE) {
        const recentDirectResponses = await prisma.queueItem.count({
          where: {
            meetingId,
            userId,
            type: QueueItemType.DIRECT_RESPONSE,
            createdAt: {
              gte: new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
            }
          }
        });

        if (recentDirectResponses >= settings.maxDirectResponsesPerUser) {
          return reply.code(400).send({ 
            error: 'Direct response limit exceeded' 
          });
        }
      }

      // Check if user already has an active queue item
      const existingItem = await prisma.queueItem.findFirst({
        where: {
          meetingId,
          userId,
          status: QueueItemStatus.WAITING
        }
      });

      if (existingItem) {
        return reply.code(400).send({ 
          error: 'User already has an active queue item' 
        });
      }

      const queueItem = await prisma.queueItem.create({
        data: {
          meetingId,
          userId,
          type,
          metadata
        },
        include: {
          user: true
        }
      });

      // Get updated queue with ordering
      const orderedQueue = await getOrderedQueue(meetingId);

      // Broadcast queue update via WebSocket (placeholder)
      // TODO: Implement WebSocket broadcasting

      return { queueItem, orderedQueue };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to add to queue' });
    }
  });

  // Remove item from queue
  fastify.delete('/:meetingId/remove/:itemId', async (request, reply) => {
    const { meetingId, itemId } = request.params as any;
    const { userId, reason } = request.body as any;

    try {
      const queueItem = await prisma.queueItem.findUnique({
        where: { id: itemId },
        include: { user: true }
      });

      if (!queueItem || queueItem.meetingId !== meetingId) {
        return reply.code(404).send({ error: 'Queue item not found' });
      }

      // Check permissions (user can remove their own item, facilitator can remove any)
      const participant = await prisma.meetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId,
            userId
          }
        }
      });

      const canRemove = queueItem.userId === userId || 
                       participant?.role === 'FACILITATOR';

      if (!canRemove) {
        return reply.code(403).send({ error: 'Permission denied' });
      }

      await prisma.queueItem.update({
        where: { id: itemId },
        data: {
          status: QueueItemStatus.SKIPPED,
          metadata: {
            ...(queueItem.metadata as any),
            removalReason: reason
          }
        }
      });

      const orderedQueue = await getOrderedQueue(meetingId);
      return { orderedQueue };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to remove from queue' });
    }
  });

  // Get ordered queue for meeting
  fastify.get('/:meetingId', async (request, reply) => {
    const { meetingId } = request.params as any;

    try {
      const orderedQueue = await getOrderedQueue(meetingId);
      return orderedQueue;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch queue' });
    }
  });

  // Start speaking (facilitator action)
  fastify.post('/:meetingId/start-speaking/:itemId', async (request, reply) => {
    const { meetingId, itemId } = request.params as any;
    const { facilitatorId } = request.body as any;

    try {
      // Verify facilitator permissions
      const facilitator = await prisma.meetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId,
            userId: facilitatorId
          }
        }
      });

      if (!facilitator || facilitator.role !== 'FACILITATOR') {
        return reply.code(403).send({ error: 'Facilitator permission required' });
      }

      // End any currently speaking items
      await prisma.queueItem.updateMany({
        where: {
          meetingId,
          status: QueueItemStatus.SPEAKING
        },
        data: {
          status: QueueItemStatus.DONE,
          completedAt: new Date()
        }
      });

      // Start the new speaker
      const queueItem = await prisma.queueItem.update({
        where: { id: itemId },
        data: {
          status: QueueItemStatus.SPEAKING,
          startedAt: new Date()
        },
        include: {
          user: true
        }
      });

      const orderedQueue = await getOrderedQueue(meetingId);
      return { currentSpeaker: queueItem, orderedQueue };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to start speaking' });
    }
  });

  // End speaking (auto or manual)
  fastify.post('/:meetingId/end-speaking/:itemId', async (request, reply) => {
    const { meetingId, itemId } = request.params as any;
    const { facilitatorId } = request.body as any;

    try {
      // Verify facilitator permissions
      const facilitator = await prisma.meetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId,
            userId: facilitatorId
          }
        }
      });

      if (!facilitator || facilitator.role !== 'FACILITATOR') {
        return reply.code(403).send({ error: 'Facilitator permission required' });
      }

      const queueItem = await prisma.queueItem.update({
        where: { id: itemId },
        data: {
          status: QueueItemStatus.DONE,
          completedAt: new Date()
        },
        include: {
          user: true
        }
      });

      const orderedQueue = await getOrderedQueue(meetingId);
      return { completedSpeaker: queueItem, orderedQueue };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to end speaking' });
    }
  });

  // Reorder queue item (facilitator action)
  fastify.post('/:meetingId/reorder', async (request, reply) => {
    const { meetingId } = request.params as any;
    const { facilitatorId, itemId, newPosition, reason } = request.body as any;

    try {
      // Verify facilitator permissions
      const facilitator = await prisma.meetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId,
            userId: facilitatorId
          }
        }
      });

      if (!facilitator || facilitator.role !== 'FACILITATOR') {
        return reply.code(403).send({ error: 'Facilitator permission required' });
      }

      // Log the reordering action
      const queueItem = await prisma.queueItem.update({
        where: { id: itemId },
        data: {
          metadata: {
            ...(await prisma.queueItem.findUnique({ where: { id: itemId } }))?.metadata as any,
            reorderHistory: [
              ...((await prisma.queueItem.findUnique({ where: { id: itemId } }))?.metadata as any)?.reorderHistory || [],
              {
                timestamp: new Date(),
                facilitatorId,
                reason,
                newPosition
              }
            ]
          }
        }
      });

      const orderedQueue = await getOrderedQueue(meetingId);
      return { orderedQueue };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to reorder queue' });
    }
  });
};

// Helper function to get ordered queue
async function getOrderedQueue(meetingId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId }
  });

  if (!meeting) {
    throw new Error('Meeting not found');
  }

  const queueItems = await prisma.queueItem.findMany({
    where: {
      meetingId,
      status: QueueItemStatus.WAITING
    },
    include: {
      user: true
    }
  });

  // Get recent speakers for progressive stack
  const recentSpeakers = await prisma.queueItem.findMany({
    where: {
      meetingId,
      status: QueueItemStatus.DONE,
      completedAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
      }
    },
    select: {
      userId: true
    },
    orderBy: {
      completedAt: 'desc'
    },
    take: 5 // Last 5 speakers
  });

  const recentSpeakerIds = recentSpeakers.map(s => s.userId);
  const comparator = new StackComparator(meeting.settings as any, recentSpeakerIds);
  const orderedItems = comparator.sortQueue(queueItems);

  // Add ordering reasons
  const queueWithReasons = orderedItems.map((item, index) => ({
    ...item,
    position: index + 1,
    orderingReason: comparator.getOrderingReason(item, index + 1)
  }));

  return queueWithReasons;
}

export default queueRoutes;


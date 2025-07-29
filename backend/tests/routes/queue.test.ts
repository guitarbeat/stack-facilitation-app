import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { build } from '../helpers/app.js';
import { FastifyInstance } from 'fastify';

describe('Queue Routes', () => {
  let app: FastifyInstance;
  let meeting: any;
  let user: any;
  let facilitator: any;

  beforeEach(async () => {
    app = await build();
    
    // Create test user
    user = await global.prisma.user.create({
      data: {
        displayName: 'Test User',
        isAnonymous: true
      }
    });

    // Create test facilitator
    facilitator = await global.prisma.user.create({
      data: {
        displayName: 'Test Facilitator',
        isAnonymous: false
      }
    });

    // Create test meeting
    meeting = await global.prisma.meeting.create({
      data: {
        title: 'Test Meeting',
        pin: 'TEST01',
        settings: {
          progressiveStack: false,
          directResponseWindowSec: 30,
          maxDirectResponsesPerUser: 3,
          timePerSpeakerSec: 180,
          allowAnonymous: true,
          retentionDays: 30,
          inviteTags: []
        }
      }
    });

    // Add participants
    await global.prisma.meetingParticipant.createMany({
      data: [
        {
          meetingId: meeting.id,
          userId: user.id,
          role: 'PARTICIPANT'
        },
        {
          meetingId: meeting.id,
          userId: facilitator.id,
          role: 'FACILITATOR'
        }
      ]
    });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/queue/:meetingId/add', () => {
    it('should add user to queue successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/queue/${meeting.id}/add`,
        payload: {
          userId: user.id,
          type: 'HAND',
          metadata: {}
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.queueItem).toBeDefined();
      expect(result.queueItem.type).toBe('HAND');
      expect(result.queueItem.userId).toBe(user.id);
      expect(result.orderedQueue).toHaveLength(1);
    });

    it('should prevent duplicate queue entries', async () => {
      // Add user to queue first time
      await app.inject({
        method: 'POST',
        url: `/api/queue/${meeting.id}/add`,
        payload: {
          userId: user.id,
          type: 'HAND',
          metadata: {}
        }
      });

      // Try to add same user again
      const response = await app.inject({
        method: 'POST',
        url: `/api/queue/${meeting.id}/add`,
        payload: {
          userId: user.id,
          type: 'DIRECT_RESPONSE',
          metadata: {}
        }
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toContain('already has an active queue item');
    });

    it('should enforce direct response limits', async () => {
      // Add maximum direct responses
      for (let i = 0; i < 3; i++) {
        await app.inject({
          method: 'POST',
          url: `/api/queue/${meeting.id}/add`,
          payload: {
            userId: user.id,
            type: 'DIRECT_RESPONSE',
            metadata: {}
          }
        });

        // Remove from queue to allow next addition
        const queueItem = await global.prisma.queueItem.findFirst({
          where: { userId: user.id, status: 'WAITING' }
        });
        
        if (queueItem) {
          await global.prisma.queueItem.update({
            where: { id: queueItem.id },
            data: { status: 'DONE' }
          });
        }
      }

      // Try to add one more (should fail)
      const response = await app.inject({
        method: 'POST',
        url: `/api/queue/${meeting.id}/add`,
        payload: {
          userId: user.id,
          type: 'DIRECT_RESPONSE',
          metadata: {}
        }
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toContain('Direct response limit exceeded');
    });

    it('should reject requests for inactive meetings', async () => {
      // Deactivate meeting
      await global.prisma.meeting.update({
        where: { id: meeting.id },
        data: { isActive: false }
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/queue/${meeting.id}/add`,
        payload: {
          userId: user.id,
          type: 'HAND',
          metadata: {}
        }
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toContain('Meeting not found or inactive');
    });
  });

  describe('GET /api/queue/:meetingId', () => {
    it('should return ordered queue', async () => {
      // Add multiple queue items
      await global.prisma.queueItem.createMany({
        data: [
          {
            meetingId: meeting.id,
            userId: user.id,
            type: 'HAND',
            createdAt: new Date('2024-01-01T10:00:00Z')
          },
          {
            meetingId: meeting.id,
            userId: facilitator.id,
            type: 'DIRECT_RESPONSE',
            createdAt: new Date('2024-01-01T10:01:00Z')
          }
        ]
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/queue/${meeting.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const queue = JSON.parse(response.body);
      expect(queue).toHaveLength(2);
      
      // Direct response should come first
      expect(queue[0].type).toBe('DIRECT_RESPONSE');
      expect(queue[0].position).toBe(1);
      expect(queue[0].orderingReason).toBeDefined();
      
      expect(queue[1].type).toBe('HAND');
      expect(queue[1].position).toBe(2);
    });

    it('should only return waiting items', async () => {
      await global.prisma.queueItem.createMany({
        data: [
          {
            meetingId: meeting.id,
            userId: user.id,
            type: 'HAND',
            status: 'WAITING'
          },
          {
            meetingId: meeting.id,
            userId: facilitator.id,
            type: 'HAND',
            status: 'DONE'
          }
        ]
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/queue/${meeting.id}`
      });

      expect(response.statusCode).toBe(200);
      
      const queue = JSON.parse(response.body);
      expect(queue).toHaveLength(1);
      expect(queue[0].status).toBe('WAITING');
    });
  });

  describe('DELETE /api/queue/:meetingId/remove/:itemId', () => {
    let queueItem: any;

    beforeEach(async () => {
      queueItem = await global.prisma.queueItem.create({
        data: {
          meetingId: meeting.id,
          userId: user.id,
          type: 'HAND'
        }
      });
    });

    it('should allow user to remove their own item', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/queue/${meeting.id}/remove/${queueItem.id}`,
        payload: {
          userId: user.id,
          reason: 'User removed themselves'
        }
      });

      expect(response.statusCode).toBe(200);
      
      // Verify item was marked as skipped
      const updatedItem = await global.prisma.queueItem.findUnique({
        where: { id: queueItem.id }
      });
      expect(updatedItem?.status).toBe('SKIPPED');
    });

    it('should allow facilitator to remove any item', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/queue/${meeting.id}/remove/${queueItem.id}`,
        payload: {
          userId: facilitator.id,
          reason: 'Facilitator removed item'
        }
      });

      expect(response.statusCode).toBe(200);
    });

    it('should prevent non-facilitators from removing others items', async () => {
      const otherUser = await global.prisma.user.create({
        data: {
          displayName: 'Other User',
          isAnonymous: true
        }
      });

      await global.prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          userId: otherUser.id,
          role: 'PARTICIPANT'
        }
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/queue/${meeting.id}/remove/${queueItem.id}`,
        payload: {
          userId: otherUser.id,
          reason: 'Unauthorized removal'
        }
      });

      expect(response.statusCode).toBe(403);
      expect(JSON.parse(response.body).error).toBe('Permission denied');
    });
  });

  describe('POST /api/queue/:meetingId/start-speaking/:itemId', () => {
    let queueItem: any;

    beforeEach(async () => {
      queueItem = await global.prisma.queueItem.create({
        data: {
          meetingId: meeting.id,
          userId: user.id,
          type: 'HAND'
        }
      });
    });

    it('should allow facilitator to start speaking', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/queue/${meeting.id}/start-speaking/${queueItem.id}`,
        payload: {
          facilitatorId: facilitator.id
        }
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.body);
      expect(result.currentSpeaker.status).toBe('SPEAKING');
      expect(result.currentSpeaker.startedAt).toBeDefined();
    });

    it('should prevent non-facilitators from starting speaking', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/queue/${meeting.id}/start-speaking/${queueItem.id}`,
        payload: {
          facilitatorId: user.id
        }
      });

      expect(response.statusCode).toBe(403);
      expect(JSON.parse(response.body).error).toBe('Facilitator permission required');
    });

    it('should end current speaker when starting new one', async () => {
      // Start first speaker
      await app.inject({
        method: 'POST',
        url: `/api/queue/${meeting.id}/start-speaking/${queueItem.id}`,
        payload: {
          facilitatorId: facilitator.id
        }
      });

      // Create second queue item
      const queueItem2 = await global.prisma.queueItem.create({
        data: {
          meetingId: meeting.id,
          userId: facilitator.id,
          type: 'HAND'
        }
      });

      // Start second speaker
      await app.inject({
        method: 'POST',
        url: `/api/queue/${meeting.id}/start-speaking/${queueItem2.id}`,
        payload: {
          facilitatorId: facilitator.id
        }
      });

      // Verify first speaker was ended
      const firstSpeaker = await global.prisma.queueItem.findUnique({
        where: { id: queueItem.id }
      });
      expect(firstSpeaker?.status).toBe('DONE');
      expect(firstSpeaker?.completedAt).toBeDefined();
    });
  });

  describe('Progressive Stack Integration', () => {
    beforeEach(async () => {
      // Update meeting to enable progressive stack
      await global.prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          settings: {
            progressiveStack: true,
            directResponseWindowSec: 30,
            maxDirectResponsesPerUser: 3,
            timePerSpeakerSec: 180,
            allowAnonymous: true,
            retentionDays: 30,
            inviteTags: ['new_to_group', 'affected_by_decision']
          }
        }
      });
    });

    it('should apply progressive stack ordering', async () => {
      // Add queue items with different tags
      await app.inject({
        method: 'POST',
        url: `/api/queue/${meeting.id}/add`,
        payload: {
          userId: user.id,
          type: 'HAND',
          metadata: { tags: ['new_to_group'] }
        }
      });

      await app.inject({
        method: 'POST',
        url: `/api/queue/${meeting.id}/add`,
        payload: {
          userId: facilitator.id,
          type: 'HAND',
          metadata: { tags: [] }
        }
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/queue/${meeting.id}`
      });

      const queue = JSON.parse(response.body);
      
      // User with invite tag should be first
      expect(queue[0].userId).toBe(user.id);
      expect(queue[0].orderingReason).toContain('Invite tags: new_to_group');
      
      expect(queue[1].userId).toBe(facilitator.id);
    });
  });
});


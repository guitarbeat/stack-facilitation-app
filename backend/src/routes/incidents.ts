import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index.js';
import { IncidentStatus } from '@prisma/client';

const incidentRoutes: FastifyPluginAsync = async (fastify) => {
  // Create incident report
  fastify.post('/', async (request, reply) => {
    const { 
      meetingId, 
      reporterId, 
      type, 
      description, 
      urgent, 
      anonymous 
    } = request.body as any;

    try {
      // Verify meeting exists
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId }
      });

      if (!meeting) {
        return reply.code(404).send({ error: 'Meeting not found' });
      }

      // Create incident report
      const incident = await prisma.incidentReport.create({
        data: {
          meetingId,
          reporterId: anonymous ? null : reporterId,
          description: `[${type.toUpperCase()}] ${description}`,
          status: urgent ? IncidentStatus.INVESTIGATING : IncidentStatus.OPEN,
          metadata: {
            type,
            urgent,
            anonymous,
            timestamp: new Date().toISOString()
          } as any
        }
      });

      // If urgent, notify facilitators immediately
      if (urgent) {
        await notifyFacilitators(meetingId, incident);
      }

      // Return minimal response to protect privacy
      return {
        id: incident.id,
        status: incident.status,
        message: 'Incident report submitted successfully'
      };
    } catch (error) {
      console.error('Failed to create incident report:', error);
      reply.code(500).send({ error: 'Failed to submit incident report' });
    }
  });

  // Get incident reports for meeting (facilitators only)
  fastify.get('/meeting/:meetingId', async (request, reply) => {
    const { meetingId } = request.params as any;
    const { userId } = request.query as any;

    try {
      // Verify user is a facilitator
      const participant = await prisma.meetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId,
            userId
          }
        }
      });

      if (!participant || participant.role !== 'FACILITATOR') {
        return reply.code(403).send({ error: 'Facilitator access required' });
      }

      const incidents = await prisma.incidentReport.findMany({
        where: { meetingId },
        include: {
          reporter: {
            select: {
              id: true,
              displayName: true,
              // Don't include reporter info for anonymous reports
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Filter out reporter info for anonymous reports
      const sanitizedIncidents = incidents.map(incident => {
        const metadata = incident.metadata as any;
        if (metadata?.anonymous) {
          return {
            ...incident,
            reporter: null,
            reporterId: null
          };
        }
        return incident;
      });

      return sanitizedIncidents;
    } catch (error) {
      console.error('Failed to fetch incident reports:', error);
      reply.code(500).send({ error: 'Failed to fetch incident reports' });
    }
  });

  // Update incident status (facilitators only)
  fastify.put('/:incidentId/status', async (request, reply) => {
    const { incidentId } = request.params as any;
    const { facilitatorId, status, notes } = request.body as any;

    try {
      // Get incident to verify meeting
      const incident = await prisma.incidentReport.findUnique({
        where: { id: incidentId },
        include: { meeting: true }
      });

      if (!incident) {
        return reply.code(404).send({ error: 'Incident not found' });
      }

      // Verify user is a facilitator
      const facilitator = await prisma.meetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId: incident.meetingId,
            userId: facilitatorId
          }
        }
      });

      if (!facilitator || facilitator.role !== 'FACILITATOR') {
        return reply.code(403).send({ error: 'Facilitator access required' });
      }

      // Update incident status
      const updatedIncident = await prisma.incidentReport.update({
        where: { id: incidentId },
        data: {
          status,
          metadata: {
            ...(incident.metadata as any),
            statusHistory: [
              ...((incident.metadata as any)?.statusHistory || []),
              {
                status,
                facilitatorId,
                notes,
                timestamp: new Date().toISOString()
              }
            ]
          }
        }
      });

      return updatedIncident;
    } catch (error) {
      console.error('Failed to update incident status:', error);
      reply.code(500).send({ error: 'Failed to update incident status' });
    }
  });

  // Get incident statistics (facilitators only)
  fastify.get('/meeting/:meetingId/stats', async (request, reply) => {
    const { meetingId } = request.params as any;
    const { userId } = request.query as any;

    try {
      // Verify user is a facilitator
      const participant = await prisma.meetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId,
            userId
          }
        }
      });

      if (!participant || participant.role !== 'FACILITATOR') {
        return reply.code(403).send({ error: 'Facilitator access required' });
      }

      const stats = await prisma.incidentReport.groupBy({
        by: ['status'],
        where: { meetingId },
        _count: {
          status: true
        }
      });

      const totalIncidents = await prisma.incidentReport.count({
        where: { meetingId }
      });

      const urgentIncidents = await prisma.incidentReport.count({
        where: {
          meetingId,
          metadata: {
            path: ['urgent'],
            equals: true
          }
        }
      });

      return {
        total: totalIncidents,
        urgent: urgentIncidents,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Failed to fetch incident statistics:', error);
      reply.code(500).send({ error: 'Failed to fetch incident statistics' });
    }
  });
};

// Helper function to notify facilitators of urgent incidents
async function notifyFacilitators(meetingId: string, incident: any) {
  try {
    const facilitators = await prisma.meetingParticipant.findMany({
      where: {
        meetingId,
        role: 'FACILITATOR'
      },
      include: {
        user: true
      }
    });

    // In a real implementation, this would send notifications
    // via WebSocket, email, or push notifications
    console.log(`Urgent incident reported in meeting ${meetingId}:`, {
      incidentId: incident.id,
      facilitators: facilitators.map(f => f.user.displayName)
    });

    // TODO: Implement actual notification system
    // - WebSocket broadcast to facilitators
    // - Email notifications
    // - Push notifications
    // - SMS for critical incidents

  } catch (error) {
    console.error('Failed to notify facilitators:', error);
  }
}

export default incidentRoutes;


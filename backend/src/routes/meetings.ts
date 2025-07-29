import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index.js';
import { v4 as uuidv4 } from 'uuid';

const meetingRoutes: FastifyPluginAsync = async (fastify) => {
  // Create a new meeting
  fastify.post('/', async (request, reply) => {
    const { title, description, settings } = request.body as any;
    
    const defaultSettings = {
      progressiveStack: false,
      directResponseWindowSec: 30,
      maxDirectResponsesPerUser: 3,
      timePerSpeakerSec: 180,
      allowAnonymous: true,
      retentionDays: 30,
      inviteTags: []
    };

    try {
      const meeting = await prisma.meeting.create({
        data: {
          title,
          description,
          pin: Math.random().toString(36).substring(2, 8).toUpperCase(),
          settings: { ...defaultSettings, ...settings }
        }
      });

      return meeting;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to create meeting' });
    }
  });

  // Get meeting by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any;

    try {
      const meeting = await prisma.meeting.findUnique({
        where: { id },
        include: {
          participants: {
            include: {
              user: true
            }
          },
          queueItems: {
            include: {
              user: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          proposals: {
            include: {
              proposer: true,
              votes: {
                include: {
                  user: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!meeting) {
        return reply.code(404).send({ error: 'Meeting not found' });
      }

      return meeting;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch meeting' });
    }
  });

  // Join meeting by PIN
  fastify.post('/join', async (request, reply) => {
    const { pin, userId, role = 'PARTICIPANT' } = request.body as any;

    try {
      const meeting = await prisma.meeting.findUnique({
        where: { pin }
      });

      if (!meeting) {
        return reply.code(404).send({ error: 'Meeting not found' });
      }

      // Check if user is already a participant
      const existingParticipant = await prisma.meetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId: meeting.id,
            userId
          }
        }
      });

      if (existingParticipant) {
        return reply.code(400).send({ error: 'User already joined this meeting' });
      }

      const participant = await prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          userId,
          role
        },
        include: {
          meeting: true,
          user: true
        }
      });

      return participant;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to join meeting' });
    }
  });

  // Update meeting settings
  fastify.put('/:id/settings', async (request, reply) => {
    const { id } = request.params as any;
    const { settings } = request.body as any;

    try {
      const meeting = await prisma.meeting.update({
        where: { id },
        data: {
          settings
        }
      });

      return meeting;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to update meeting settings' });
    }
  });

  // End meeting
  fastify.put('/:id/end', async (request, reply) => {
    const { id } = request.params as any;

    try {
      const meeting = await prisma.meeting.update({
        where: { id },
        data: {
          isActive: false
        }
      });

      return meeting;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to end meeting' });
    }
  });

  // Export meeting data
  fastify.get('/:id/export', async (request, reply) => {
    const { id } = request.params as any;
    const { format = 'json' } = request.query as any;

    try {
      const meeting = await prisma.meeting.findUnique({
        where: { id },
        include: {
          participants: {
            include: {
              user: true
            }
          },
          queueItems: {
            include: {
              user: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          proposals: {
            include: {
              proposer: true,
              votes: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      });

      if (!meeting) {
        return reply.code(404).send({ error: 'Meeting not found' });
      }

      if (format === 'csv') {
        // Generate CSV export
        const csvData = generateCSVExport(meeting);
        reply.type('text/csv');
        reply.header('Content-Disposition', `attachment; filename="meeting-${id}.csv"`);
        return csvData;
      } else if (format === 'markdown') {
        // Generate Markdown export
        const markdownData = generateMarkdownExport(meeting);
        reply.type('text/markdown');
        reply.header('Content-Disposition', `attachment; filename="meeting-${id}.md"`);
        return markdownData;
      }

      return meeting;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to export meeting data' });
    }
  });
};

function generateCSVExport(meeting: any): string {
  const lines = [];
  lines.push('Type,Timestamp,User,Content,Status');
  
  // Add queue items
  meeting.queueItems.forEach((item: any) => {
    lines.push(`${item.type},${item.createdAt},${item.user.displayName},"Queue item",${item.status}`);
  });
  
  // Add proposals
  meeting.proposals.forEach((proposal: any) => {
    lines.push(`PROPOSAL,${proposal.createdAt},${proposal.proposer.displayName},"${proposal.title}",${proposal.status}`);
    proposal.votes.forEach((vote: any) => {
      lines.push(`VOTE,${vote.createdAt},${vote.user.displayName},"${vote.voteType}",RECORDED`);
    });
  });
  
  return lines.join('\n');
}

function generateMarkdownExport(meeting: any): string {
  const lines = [];
  lines.push(`# ${meeting.title}`);
  lines.push('');
  lines.push(`**Meeting Date:** ${meeting.createdAt}`);
  lines.push(`**Status:** ${meeting.isActive ? 'Active' : 'Ended'}`);
  lines.push('');
  
  lines.push('## Participants');
  meeting.participants.forEach((participant: any) => {
    lines.push(`- ${participant.user.displayName} (${participant.role})`);
  });
  lines.push('');
  
  lines.push('## Speaking Queue History');
  meeting.queueItems.forEach((item: any, index: number) => {
    lines.push(`${index + 1}. **${item.user.displayName}** - ${item.type} (${item.status})`);
  });
  lines.push('');
  
  lines.push('## Proposals and Decisions');
  meeting.proposals.forEach((proposal: any) => {
    lines.push(`### ${proposal.title}`);
    lines.push(`**Status:** ${proposal.status}`);
    lines.push(`**Proposed by:** ${proposal.proposer.displayName}`);
    lines.push('');
    lines.push('**Votes:**');
    proposal.votes.forEach((vote: any) => {
      lines.push(`- ${vote.user.displayName}: ${vote.voteType}`);
    });
    lines.push('');
  });
  
  return lines.join('\n');
}

export default meetingRoutes;


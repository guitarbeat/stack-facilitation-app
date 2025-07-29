import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index.js';
import { ProposalStatus, VoteType } from '@prisma/client';

const proposalRoutes: FastifyPluginAsync = async (fastify) => {
  // Create a new proposal
  fastify.post('/:meetingId', async (request, reply) => {
    const { meetingId } = request.params as any;
    const { proposerId, title, description } = request.body as any;

    try {
      // Verify meeting exists and is active
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId }
      });

      if (!meeting || !meeting.isActive) {
        return reply.code(400).send({ error: 'Meeting not found or inactive' });
      }

      // Verify proposer is a participant
      const participant = await prisma.meetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId,
            userId: proposerId
          }
        }
      });

      if (!participant) {
        return reply.code(403).send({ error: 'User is not a meeting participant' });
      }

      const proposal = await prisma.proposal.create({
        data: {
          meetingId,
          proposerId,
          title,
          description
        },
        include: {
          proposer: true,
          votes: {
            include: {
              user: true
            }
          }
        }
      });

      return proposal;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to create proposal' });
    }
  });

  // Get proposal by ID
  fastify.get('/:proposalId', async (request, reply) => {
    const { proposalId } = request.params as any;

    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
          proposer: true,
          votes: {
            include: {
              user: true
            }
          }
        }
      });

      if (!proposal) {
        return reply.code(404).send({ error: 'Proposal not found' });
      }

      return proposal;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch proposal' });
    }
  });

  // Vote on a proposal
  fastify.post('/:proposalId/vote', async (request, reply) => {
    const { proposalId } = request.params as any;
    const { userId, voteType, rationale } = request.body as any;

    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
          meeting: true
        }
      });

      if (!proposal) {
        return reply.code(404).send({ error: 'Proposal not found' });
      }

      if (proposal.status !== ProposalStatus.ACTIVE) {
        return reply.code(400).send({ error: 'Proposal is not active for voting' });
      }

      // Verify voter is a participant
      const participant = await prisma.meetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId: proposal.meetingId,
            userId
          }
        }
      });

      if (!participant) {
        return reply.code(403).send({ error: 'User is not a meeting participant' });
      }

      // Create or update vote
      const vote = await prisma.vote.upsert({
        where: {
          proposalId_userId: {
            proposalId,
            userId
          }
        },
        update: {
          voteType,
          rationale
        },
        create: {
          proposalId,
          userId,
          voteType,
          rationale
        },
        include: {
          user: true
        }
      });

      // Check if proposal should be decided
      await checkProposalDecision(proposalId);

      return vote;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to record vote' });
    }
  });

  // Get all proposals for a meeting
  fastify.get('/meeting/:meetingId', async (request, reply) => {
    const { meetingId } = request.params as any;

    try {
      const proposals = await prisma.proposal.findMany({
        where: { meetingId },
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
      });

      return proposals;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch proposals' });
    }
  });

  // Update proposal status (facilitator action)
  fastify.put('/:proposalId/status', async (request, reply) => {
    const { proposalId } = request.params as any;
    const { facilitatorId, status, rationale } = request.body as any;

    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
          meeting: true
        }
      });

      if (!proposal) {
        return reply.code(404).send({ error: 'Proposal not found' });
      }

      // Verify facilitator permissions
      const facilitator = await prisma.meetingParticipant.findUnique({
        where: {
          meetingId_userId: {
            meetingId: proposal.meetingId,
            userId: facilitatorId
          }
        }
      });

      if (!facilitator || facilitator.role !== 'FACILITATOR') {
        return reply.code(403).send({ error: 'Facilitator permission required' });
      }

      const updatedProposal = await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          status,
          decidedAt: status !== ProposalStatus.ACTIVE ? new Date() : null
        },
        include: {
          proposer: true,
          votes: {
            include: {
              user: true
            }
          }
        }
      });

      return updatedProposal;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to update proposal status' });
    }
  });

  // Withdraw proposal (proposer action)
  fastify.put('/:proposalId/withdraw', async (request, reply) => {
    const { proposalId } = request.params as any;
    const { userId } = request.body as any;

    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId }
      });

      if (!proposal) {
        return reply.code(404).send({ error: 'Proposal not found' });
      }

      if (proposal.proposerId !== userId) {
        return reply.code(403).send({ error: 'Only the proposer can withdraw' });
      }

      if (proposal.status !== ProposalStatus.ACTIVE) {
        return reply.code(400).send({ error: 'Proposal is not active' });
      }

      const updatedProposal = await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          status: ProposalStatus.WITHDRAWN,
          decidedAt: new Date()
        },
        include: {
          proposer: true,
          votes: {
            include: {
              user: true
            }
          }
        }
      });

      return updatedProposal;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to withdraw proposal' });
    }
  });
};

// Helper function to check if a proposal should be automatically decided
async function checkProposalDecision(proposalId: string) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      votes: true,
      meeting: {
        include: {
          participants: {
            where: {
              leftAt: null // Only active participants
            }
          }
        }
      }
    }
  });

  if (!proposal || proposal.status !== ProposalStatus.ACTIVE) {
    return;
  }

  const totalParticipants = proposal.meeting.participants.length;
  const votes = proposal.votes;
  
  // Check for blocks
  const blocks = votes.filter(v => v.voteType === VoteType.BLOCK);
  if (blocks.length > 0) {
    await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status: ProposalStatus.BLOCKED,
        decidedAt: new Date()
      }
    });
    return;
  }

  // Check if all participants have voted
  if (votes.length === totalParticipants) {
    const agrees = votes.filter(v => v.voteType === VoteType.AGREE).length;
    const standAsides = votes.filter(v => v.voteType === VoteType.STAND_ASIDE).length;
    const concerns = votes.filter(v => v.voteType === VoteType.CONCERN).length;

    // Proposal passes if no blocks and majority agreement
    if (agrees + standAsides >= Math.ceil(totalParticipants * 0.5)) {
      await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          status: ProposalStatus.PASSED,
          decidedAt: new Date()
        }
      });
    }
  }
}

export default proposalRoutes;


import { describe, it, expect, beforeEach } from 'vitest';
import { StackComparator } from '../../src/ordering/stackComparator.js';
import { QueueItemType, QueueItemStatus } from '@prisma/client';

describe('StackComparator', () => {
  let comparator: StackComparator;
  let mockSettings: any;
  let mockQueueItems: any[];

  beforeEach(() => {
    mockSettings = {
      progressiveStack: false,
      directResponseWindowSec: 30,
      maxDirectResponsesPerUser: 3,
      timePerSpeakerSec: 180,
      inviteTags: ['new_to_group', 'affected_by_decision']
    };

    comparator = new StackComparator(mockSettings);

    // Create mock queue items
    mockQueueItems = [
      {
        id: '1',
        userId: 'user1',
        type: QueueItemType.HAND,
        status: QueueItemStatus.WAITING,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        metadata: {},
        user: { id: 'user1', displayName: 'Alice' }
      },
      {
        id: '2',
        userId: 'user2',
        type: QueueItemType.HAND,
        status: QueueItemStatus.WAITING,
        createdAt: new Date('2024-01-01T10:01:00Z'),
        metadata: {},
        user: { id: 'user2', displayName: 'Bob' }
      },
      {
        id: '3',
        userId: 'user3',
        type: QueueItemType.DIRECT_RESPONSE,
        status: QueueItemStatus.WAITING,
        createdAt: new Date('2024-01-01T10:02:00Z'),
        metadata: {},
        user: { id: 'user3', displayName: 'Charlie' }
      }
    ];
  });

  describe('Basic FIFO Ordering', () => {
    it('should order items by creation time (FIFO)', () => {
      const sorted = comparator.sortQueue(mockQueueItems.slice(0, 2));
      
      expect(sorted).toHaveLength(2);
      expect(sorted[0].user.displayName).toBe('Alice');
      expect(sorted[1].user.displayName).toBe('Bob');
    });

    it('should filter out non-waiting items', () => {
      mockQueueItems[0].status = QueueItemStatus.SPEAKING;
      mockQueueItems[1].status = QueueItemStatus.DONE;
      
      const sorted = comparator.sortQueue(mockQueueItems);
      
      expect(sorted).toHaveLength(1);
      expect(sorted[0].user.displayName).toBe('Charlie');
    });
  });

  describe('Direct Response Priority', () => {
    it('should prioritize direct responses over regular hands', () => {
      const sorted = comparator.sortQueue(mockQueueItems);
      
      expect(sorted).toHaveLength(3);
      expect(sorted[0].user.displayName).toBe('Charlie'); // Direct response
      expect(sorted[1].user.displayName).toBe('Alice');   // First hand
      expect(sorted[2].user.displayName).toBe('Bob');     // Second hand
    });

    it('should maintain FIFO order within direct responses', () => {
      const directResponse2 = {
        id: '4',
        userId: 'user4',
        type: QueueItemType.DIRECT_RESPONSE,
        status: QueueItemStatus.WAITING,
        createdAt: new Date('2024-01-01T10:03:00Z'),
        metadata: {},
        user: { id: 'user4', displayName: 'David' }
      };

      const items = [...mockQueueItems, directResponse2];
      const sorted = comparator.sortQueue(items);
      
      expect(sorted[0].user.displayName).toBe('Charlie'); // First direct response
      expect(sorted[1].user.displayName).toBe('David');   // Second direct response
      expect(sorted[2].user.displayName).toBe('Alice');   // First hand
      expect(sorted[3].user.displayName).toBe('Bob');     // Second hand
    });
  });

  describe('Point System Priority', () => {
    it('should prioritize points of process highest', () => {
      const pointProcess = {
        id: '4',
        userId: 'user4',
        type: QueueItemType.POINT_PROCESS,
        status: QueueItemStatus.WAITING,
        createdAt: new Date('2024-01-01T10:03:00Z'),
        metadata: {},
        user: { id: 'user4', displayName: 'David' }
      };

      const items = [...mockQueueItems, pointProcess];
      const sorted = comparator.sortQueue(items);
      
      expect(sorted[0].user.displayName).toBe('David');   // Point of process (highest)
      expect(sorted[1].user.displayName).toBe('Charlie'); // Direct response
      expect(sorted[2].user.displayName).toBe('Alice');   // Regular hand
    });

    it('should order points by priority: process > info > clarification', () => {
      const points = [
        {
          id: '4',
          userId: 'user4',
          type: QueueItemType.POINT_CLARIFICATION,
          status: QueueItemStatus.WAITING,
          createdAt: new Date('2024-01-01T10:03:00Z'),
          metadata: {},
          user: { id: 'user4', displayName: 'David' }
        },
        {
          id: '5',
          userId: 'user5',
          type: QueueItemType.POINT_INFO,
          status: QueueItemStatus.WAITING,
          createdAt: new Date('2024-01-01T10:04:00Z'),
          metadata: {},
          user: { id: 'user5', displayName: 'Eve' }
        },
        {
          id: '6',
          userId: 'user6',
          type: QueueItemType.POINT_PROCESS,
          status: QueueItemStatus.WAITING,
          createdAt: new Date('2024-01-01T10:05:00Z'),
          metadata: {},
          user: { id: 'user6', displayName: 'Frank' }
        }
      ];

      const items = [...mockQueueItems.slice(0, 2), ...points];
      const sorted = comparator.sortQueue(items);
      
      expect(sorted[0].user.displayName).toBe('Frank'); // Point of process
      expect(sorted[1].user.displayName).toBe('Eve');   // Point of info
      expect(sorted[2].user.displayName).toBe('David'); // Point of clarification
      expect(sorted[3].user.displayName).toBe('Alice'); // Regular hand
      expect(sorted[4].user.displayName).toBe('Bob');   // Regular hand
    });
  });

  describe('Progressive Stack', () => {
    beforeEach(() => {
      mockSettings.progressiveStack = true;
      comparator = new StackComparator(mockSettings, ['user2']); // user2 spoke recently
    });

    it('should prioritize users with invite tags who havent spoken recently', () => {
      mockQueueItems[0].metadata = { tags: ['new_to_group'] };
      mockQueueItems[1].metadata = { tags: [] };
      
      const sorted = comparator.sortQueue(mockQueueItems.slice(0, 2));
      
      expect(sorted[0].user.displayName).toBe('Alice'); // Has invite tag + hasn't spoken
      expect(sorted[1].user.displayName).toBe('Bob');   // No invite tag
    });

    it('should give moderate priority to users with invite tags who spoke recently', () => {
      mockQueueItems[0].metadata = { tags: [] };
      mockQueueItems[1].metadata = { tags: ['affected_by_decision'] };
      
      const sorted = comparator.sortQueue(mockQueueItems.slice(0, 2));
      
      expect(sorted[0].user.displayName).toBe('Bob');   // Has invite tag (even though spoke recently)
      expect(sorted[1].user.displayName).toBe('Alice'); // No invite tag
    });

    it('should give small priority to users who havent spoken recently', () => {
      // Both users have no invite tags, but user1 hasn't spoken recently
      const sorted = comparator.sortQueue(mockQueueItems.slice(0, 2));
      
      expect(sorted[0].user.displayName).toBe('Alice'); // Hasn't spoken recently
      expect(sorted[1].user.displayName).toBe('Bob');   // Spoke recently
    });

    it('should maintain FIFO within same priority tier', () => {
      // Both users have same progressive stack priority
      mockQueueItems[0].metadata = { tags: ['new_to_group'] };
      mockQueueItems[1].metadata = { tags: ['affected_by_decision'] };
      
      const sorted = comparator.sortQueue(mockQueueItems.slice(0, 2));
      
      // Both have invite tags and Alice hasn't spoken recently (higher priority)
      // But if they had same priority, FIFO would apply
      expect(sorted[0].user.displayName).toBe('Alice'); // Earlier timestamp
    });
  });

  describe('Ordering Reasons', () => {
    it('should provide reason for FIFO ordering', () => {
      const reason = comparator.getOrderingReason(mockQueueItems[0], 1);
      expect(reason).toBe('First in, first out');
    });

    it('should provide reason for direct response', () => {
      const reason = comparator.getOrderingReason(mockQueueItems[2], 1);
      expect(reason).toBe('Direct response');
    });

    it('should provide reason for point of process', () => {
      const pointProcess = {
        ...mockQueueItems[0],
        type: QueueItemType.POINT_PROCESS
      };
      
      const reason = comparator.getOrderingReason(pointProcess, 1);
      expect(reason).toBe('Point of process (highest priority)');
    });

    it('should provide reason for progressive stack', () => {
      mockSettings.progressiveStack = true;
      comparator = new StackComparator(mockSettings, ['user2']);
      
      mockQueueItems[0].metadata = { tags: ['new_to_group'] };
      
      const reason = comparator.getOrderingReason(mockQueueItems[0], 1);
      expect(reason).toContain('Invite tags: new_to_group');
      expect(reason).toContain('Has not spoken recently');
    });
  });

  describe('Recent Speakers Management', () => {
    it('should update recent speakers list', () => {
      comparator.updateRecentSpeakers(['user1', 'user3']);
      
      mockQueueItems[0].metadata = { tags: ['new_to_group'] };
      mockQueueItems[1].metadata = { tags: ['new_to_group'] };
      
      mockSettings.progressiveStack = true;
      comparator = new StackComparator(mockSettings, ['user1', 'user3']);
      
      const sorted = comparator.sortQueue(mockQueueItems.slice(0, 2));
      
      // user2 (Bob) hasn't spoken recently, should be prioritized
      expect(sorted[0].user.displayName).toBe('Bob');
      expect(sorted[1].user.displayName).toBe('Alice');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mixed queue with all types correctly', () => {
      const complexQueue = [
        {
          id: '1',
          userId: 'user1',
          type: QueueItemType.HAND,
          status: QueueItemStatus.WAITING,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          metadata: { tags: ['new_to_group'] },
          user: { id: 'user1', displayName: 'Alice' }
        },
        {
          id: '2',
          userId: 'user2',
          type: QueueItemType.DIRECT_RESPONSE,
          status: QueueItemStatus.WAITING,
          createdAt: new Date('2024-01-01T10:01:00Z'),
          metadata: {},
          user: { id: 'user2', displayName: 'Bob' }
        },
        {
          id: '3',
          userId: 'user3',
          type: QueueItemType.POINT_PROCESS,
          status: QueueItemStatus.WAITING,
          createdAt: new Date('2024-01-01T10:02:00Z'),
          metadata: {},
          user: { id: 'user3', displayName: 'Charlie' }
        },
        {
          id: '4',
          userId: 'user4',
          type: QueueItemType.HAND,
          status: QueueItemStatus.WAITING,
          createdAt: new Date('2024-01-01T10:03:00Z'),
          metadata: {},
          user: { id: 'user4', displayName: 'David' }
        }
      ];

      mockSettings.progressiveStack = true;
      comparator = new StackComparator(mockSettings, ['user2', 'user4']); // Bob and David spoke recently
      
      const sorted = comparator.sortQueue(complexQueue);
      
      // Expected order:
      // 1. Charlie (Point of process - highest priority)
      // 2. Bob (Direct response)
      // 3. Alice (Hand + progressive stack boost)
      // 4. David (Hand, but spoke recently)
      
      expect(sorted[0].user.displayName).toBe('Charlie');
      expect(sorted[1].user.displayName).toBe('Bob');
      expect(sorted[2].user.displayName).toBe('Alice');
      expect(sorted[3].user.displayName).toBe('David');
    });
  });
});


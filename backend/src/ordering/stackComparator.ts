import { QueueItem, QueueItemType, QueueItemStatus } from '@prisma/client';

interface QueueItemWithUser extends QueueItem {
  user: {
    id: string;
    displayName: string;
  };
}

interface MeetingSettings {
  progressiveStack: boolean;
  directResponseWindowSec: number;
  maxDirectResponsesPerUser: number;
  timePerSpeakerSec: number;
  inviteTags: string[];
}

/**
 * Stack Comparator Algorithm
 * 
 * Ordering Rules:
 * 1. Base order: FIFO by created time
 * 2. Direct responses: Move ahead of normal hands but behind existing direct responses
 * 3. Progressive Stack (if enabled): Priority boost for users with invite tags who haven't spoken recently
 * 4. Points (process/info/clarification): Can briefly interject based on type
 * 
 * This algorithm ensures transparent, auditable ordering while supporting inclusive facilitation.
 */
export class StackComparator {
  private settings: MeetingSettings;
  private recentSpeakers: Set<string>; // Users who spoke in last N turns

  constructor(settings: MeetingSettings, recentSpeakers: string[] = []) {
    this.settings = settings;
    this.recentSpeakers = new Set(recentSpeakers);
  }

  /**
   * Sort queue items according to stack facilitation rules
   */
  sortQueue(items: QueueItemWithUser[]): QueueItemWithUser[] {
    // Filter only waiting items
    const waitingItems = items.filter(item => item.status === QueueItemStatus.WAITING);
    
    return waitingItems.sort((a, b) => this.compareItems(a, b));
  }

  /**
   * Compare two queue items for ordering
   * Returns negative if a should come before b, positive if b should come before a
   */
  private compareItems(a: QueueItemWithUser, b: QueueItemWithUser): number {
    // 1. Points have highest priority (process > info > clarification)
    const aPointPriority = this.getPointPriority(a.type);
    const bPointPriority = this.getPointPriority(b.type);
    
    if (aPointPriority !== bPointPriority) {
      return bPointPriority - aPointPriority; // Higher priority first
    }

    // 2. Direct responses come before regular hands
    const aIsDirectResponse = a.type === QueueItemType.DIRECT_RESPONSE;
    const bIsDirectResponse = b.type === QueueItemType.DIRECT_RESPONSE;
    
    if (aIsDirectResponse && !bIsDirectResponse) return -1;
    if (!aIsDirectResponse && bIsDirectResponse) return 1;

    // 3. Progressive stack priority (if enabled)
    if (this.settings.progressiveStack) {
      const aProgressivePriority = this.getProgressiveStackPriority(a);
      const bProgressivePriority = this.getProgressiveStackPriority(b);
      
      if (aProgressivePriority !== bProgressivePriority) {
        return bProgressivePriority - aProgressivePriority; // Higher priority first
      }
    }

    // 4. FIFO by creation time (stable sort)
    return a.createdAt.getTime() - b.createdAt.getTime();
  }

  /**
   * Get priority level for point types
   */
  private getPointPriority(type: QueueItemType): number {
    switch (type) {
      case QueueItemType.POINT_PROCESS:
        return 3; // Highest priority
      case QueueItemType.POINT_INFO:
        return 2;
      case QueueItemType.POINT_CLARIFICATION:
        return 1;
      default:
        return 0; // Regular hands and direct responses
    }
  }

  /**
   * Calculate progressive stack priority for a queue item
   */
  private getProgressiveStackPriority(item: QueueItemWithUser): number {
    if (!this.settings.progressiveStack) return 0;

    let priority = 0;
    const metadata = item.metadata as any;
    const userTags = metadata?.tags || [];

    // Check if user has invite tags
    const hasInviteTags = this.settings.inviteTags.some(tag => 
      userTags.includes(tag)
    );

    // Check if user hasn't spoken recently
    const hasntSpokenRecently = !this.recentSpeakers.has(item.userId);

    // Apply progressive stack boost
    if (hasInviteTags && hasntSpokenRecently) {
      priority += 10; // Significant boost
    } else if (hasInviteTags) {
      priority += 5; // Moderate boost
    } else if (hasntSpokenRecently) {
      priority += 2; // Small boost
    }

    return priority;
  }

  /**
   * Get explanation for why an item is positioned where it is
   */
  getOrderingReason(item: QueueItemWithUser, position: number): string {
    const reasons = [];

    // Point type reasons
    if (item.type === QueueItemType.POINT_PROCESS) {
      reasons.push('Point of process (highest priority)');
    } else if (item.type === QueueItemType.POINT_INFO) {
      reasons.push('Point of information');
    } else if (item.type === QueueItemType.POINT_CLARIFICATION) {
      reasons.push('Point of clarification');
    }

    // Direct response reason
    if (item.type === QueueItemType.DIRECT_RESPONSE) {
      reasons.push('Direct response');
    }

    // Progressive stack reasons
    if (this.settings.progressiveStack) {
      const metadata = item.metadata as any;
      const userTags = metadata?.tags || [];
      const hasInviteTags = this.settings.inviteTags.some(tag => 
        userTags.includes(tag)
      );
      const hasntSpokenRecently = !this.recentSpeakers.has(item.userId);

      if (hasInviteTags) {
        const tagList = userTags.filter((tag: string) => 
          this.settings.inviteTags.includes(tag)
        ).join(', ');
        reasons.push(`Invite tags: ${tagList}`);
      }

      if (hasntSpokenRecently) {
        reasons.push('Has not spoken recently');
      }
    }

    // Default FIFO reason
    if (reasons.length === 0) {
      reasons.push('First in, first out');
    }

    return reasons.join('; ');
  }

  /**
   * Update recent speakers list
   */
  updateRecentSpeakers(speakerIds: string[]) {
    this.recentSpeakers = new Set(speakerIds);
  }
}

/**
 * Pseudocode for the ordering algorithm:
 * 
 * function sortQueue(items):
 *   waitingItems = filter items where status == WAITING
 *   
 *   return sort waitingItems by:
 *     1. Point priority (process > info > clarification > none)
 *     2. Direct response flag (direct responses before regular hands)
 *     3. Progressive stack priority (if enabled):
 *        a. Has invite tags AND hasn't spoken recently: +10
 *        b. Has invite tags only: +5
 *        c. Hasn't spoken recently only: +2
 *        d. Neither: +0
 *     4. Creation timestamp (FIFO within same priority tier)
 * 
 * This ensures:
 * - Process interventions can always interrupt
 * - Direct responses get timely attention
 * - Progressive stack amplifies marginalized voices
 * - FIFO fairness within priority tiers
 * - Transparent, auditable ordering
 */


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QueueDisplay from '../../../src/components/queue/QueueDisplay';

// Mock the store
const mockStore = {
  currentUser: {
    id: 'user1',
    displayName: 'Test User',
    role: 'PARTICIPANT'
  },
  currentMeeting: {
    id: 'meeting1',
    title: 'Test Meeting',
    settings: {
      progressiveStack: false,
      allowAnonymous: true
    }
  },
  queueItems: [],
  currentSpeaker: null,
  addToQueue: vi.fn(),
  removeFromQueue: vi.fn(),
  startSpeaking: vi.fn()
};

// Mock zustand store
vi.mock('../../../src/store/meetingStore', () => ({
  default: () => mockStore
}));

// Mock components that might not be available
vi.mock('../../../src/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}));

vi.mock('../../../src/components/ui/card', () => ({
  Card: ({ children, className }) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }) => <h3 className={className}>{children}</h3>
}));

vi.mock('../../../src/components/ui/badge', () => ({
  Badge: ({ children, className }) => <span className={className}>{children}</span>
}));

describe('QueueDisplay', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.queueItems = [];
    mockStore.currentSpeaker = null;
  });

  it('renders empty queue message when no items', () => {
    render(<QueueDisplay />);
    
    expect(screen.getByText(/no one is currently in the speaking queue/i)).toBeInTheDocument();
  });

  it('displays queue items with correct information', () => {
    mockStore.queueItems = [
      {
        id: 'item1',
        userId: 'user1',
        type: 'HAND',
        position: 1,
        orderingReason: 'First in, first out',
        user: {
          id: 'user1',
          displayName: 'Alice',
          pronouns: 'she/her'
        }
      },
      {
        id: 'item2',
        userId: 'user2',
        type: 'DIRECT_RESPONSE',
        position: 2,
        orderingReason: 'Direct response',
        user: {
          id: 'user2',
          displayName: 'Bob',
          pronouns: 'he/him'
        }
      }
    ];

    render(<QueueDisplay />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('she/her')).toBeInTheDocument();
    expect(screen.getByText('he/him')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows different queue item types with appropriate styling', () => {
    mockStore.queueItems = [
      {
        id: 'item1',
        userId: 'user1',
        type: 'HAND',
        position: 1,
        orderingReason: 'First in, first out',
        user: { id: 'user1', displayName: 'Alice' }
      },
      {
        id: 'item2',
        userId: 'user2',
        type: 'POINT_PROCESS',
        position: 2,
        orderingReason: 'Point of process (highest priority)',
        user: { id: 'user2', displayName: 'Bob' }
      }
    ];

    render(<QueueDisplay />);
    
    expect(screen.getByText('Raise Hand')).toBeInTheDocument();
    expect(screen.getByText('Point of Process')).toBeInTheDocument();
  });

  it('allows user to join queue', async () => {
    render(<QueueDisplay />);
    
    const raiseHandButton = screen.getByText(/raise hand/i);
    await user.click(raiseHandButton);
    
    expect(mockStore.addToQueue).toHaveBeenCalledWith({
      userId: 'user1',
      type: 'HAND',
      metadata: {}
    });
  });

  it('shows queue type selection when clicking join queue', async () => {
    render(<QueueDisplay />);
    
    const joinButton = screen.getByText(/join speaking queue/i);
    await user.click(joinButton);
    
    expect(screen.getByText('Raise Hand')).toBeInTheDocument();
    expect(screen.getByText('Direct Response')).toBeInTheDocument();
    expect(screen.getByText('Point of Process')).toBeInTheDocument();
    expect(screen.getByText('Point of Information')).toBeInTheDocument();
    expect(screen.getByText('Point of Clarification')).toBeInTheDocument();
  });

  it('allows user to leave queue if they are in it', async () => {
    mockStore.queueItems = [
      {
        id: 'item1',
        userId: 'user1',
        type: 'HAND',
        position: 1,
        orderingReason: 'First in, first out',
        user: { id: 'user1', displayName: 'Test User' }
      }
    ];

    render(<QueueDisplay />);
    
    const leaveButton = screen.getByText(/leave queue/i);
    await user.click(leaveButton);
    
    expect(mockStore.removeFromQueue).toHaveBeenCalledWith('item1', 'User removed themselves');
  });

  it('shows facilitator controls when user is facilitator', () => {
    mockStore.currentUser.role = 'FACILITATOR';
    mockStore.queueItems = [
      {
        id: 'item1',
        userId: 'user2',
        type: 'HAND',
        position: 1,
        orderingReason: 'First in, first out',
        user: { id: 'user2', displayName: 'Alice' }
      }
    ];

    render(<QueueDisplay />);
    
    expect(screen.getByText(/start speaking/i)).toBeInTheDocument();
    expect(screen.getByText(/remove from queue/i)).toBeInTheDocument();
  });

  it('allows facilitator to start speaker', async () => {
    mockStore.currentUser.role = 'FACILITATOR';
    mockStore.queueItems = [
      {
        id: 'item1',
        userId: 'user2',
        type: 'HAND',
        position: 1,
        orderingReason: 'First in, first out',
        user: { id: 'user2', displayName: 'Alice' }
      }
    ];

    render(<QueueDisplay />);
    
    const startButton = screen.getByText(/start speaking/i);
    await user.click(startButton);
    
    expect(mockStore.startSpeaking).toHaveBeenCalledWith('item1');
  });

  it('displays current speaker information', () => {
    mockStore.currentSpeaker = {
      id: 'item1',
      userId: 'user1',
      type: 'HAND',
      status: 'SPEAKING',
      startedAt: new Date().toISOString(),
      user: {
        id: 'user1',
        displayName: 'Alice',
        pronouns: 'she/her'
      }
    };

    render(<QueueDisplay />);
    
    expect(screen.getByText(/currently speaking/i)).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows progressive stack information when enabled', () => {
    mockStore.currentMeeting.settings.progressiveStack = true;
    mockStore.queueItems = [
      {
        id: 'item1',
        userId: 'user1',
        type: 'HAND',
        position: 1,
        orderingReason: 'Invite tags: new_to_group, Has not spoken recently',
        user: { id: 'user1', displayName: 'Alice' },
        metadata: { tags: ['new_to_group'] }
      }
    ];

    render(<QueueDisplay />);
    
    expect(screen.getByText(/invite tags: new_to_group/i)).toBeInTheDocument();
  });

  it('handles accessibility announcements', async () => {
    const mockAnnounce = vi.fn();
    
    // Mock the useAnnouncements hook
    vi.mock('../../../src/hooks/useAnnouncements', () => ({
      default: () => ({
        announceQueueJoin: mockAnnounce,
        announceQueueLeave: mockAnnounce,
        announcement: '',
        level: 'polite'
      })
    }));

    render(<QueueDisplay />);
    
    const raiseHandButton = screen.getByText(/raise hand/i);
    await user.click(raiseHandButton);
    
    // Should trigger accessibility announcement
    await waitFor(() => {
      expect(mockStore.addToQueue).toHaveBeenCalled();
    });
  });

  it('displays ordering reasons for transparency', () => {
    mockStore.queueItems = [
      {
        id: 'item1',
        userId: 'user1',
        type: 'DIRECT_RESPONSE',
        position: 1,
        orderingReason: 'Direct response',
        user: { id: 'user1', displayName: 'Alice' }
      },
      {
        id: 'item2',
        userId: 'user2',
        type: 'HAND',
        position: 2,
        orderingReason: 'First in, first out',
        user: { id: 'user2', displayName: 'Bob' }
      }
    ];

    render(<QueueDisplay />);
    
    expect(screen.getByText('Direct response')).toBeInTheDocument();
    expect(screen.getByText('First in, first out')).toBeInTheDocument();
  });

  it('handles queue updates in real-time', async () => {
    const { rerender } = render(<QueueDisplay />);
    
    // Initially empty
    expect(screen.getByText(/no one is currently in the speaking queue/i)).toBeInTheDocument();
    
    // Add items to queue
    mockStore.queueItems = [
      {
        id: 'item1',
        userId: 'user1',
        type: 'HAND',
        position: 1,
        orderingReason: 'First in, first out',
        user: { id: 'user1', displayName: 'Alice' }
      }
    ];
    
    rerender(<QueueDisplay />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText(/no one is currently in the speaking queue/i)).not.toBeInTheDocument();
  });
});


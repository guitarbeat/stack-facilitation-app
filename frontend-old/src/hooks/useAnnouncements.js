import { useState, useCallback } from 'react';

/**
 * Custom hook for managing accessibility announcements
 * Provides a clean API for announcing changes to screen readers
 */
function useAnnouncements() {
  const [announcement, setAnnouncement] = useState('');
  const [level, setLevel] = useState('polite');

  const announce = useCallback((message, priority = 'polite') => {
    setLevel(priority);
    setAnnouncement(message);
  }, []);

  const announcePolite = useCallback((message) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message) => {
    announce(message, 'assertive');
  }, [announce]);

  // Queue-specific announcements
  const announceQueueChange = useCallback((position, total, reason) => {
    if (position === 1) {
      announce(`You are now next to speak. ${reason}`, 'assertive');
    } else {
      announce(`You are now number ${position} of ${total} in the speaking queue. ${reason}`, 'polite');
    }
  }, [announce]);

  const announceQueueJoin = useCallback((position, total, type) => {
    const typeText = type === 'HAND' ? 'raised hand' : 
                    type === 'DIRECT_RESPONSE' ? 'direct response' :
                    type === 'POINT_PROCESS' ? 'point of process' :
                    type === 'POINT_INFO' ? 'point of information' :
                    type === 'POINT_CLARIFICATION' ? 'point of clarification' : 'joined queue';
    
    announce(`${typeText} added. You are number ${position} of ${total} in the speaking queue.`, 'polite');
  }, [announce]);

  const announceQueueLeave = useCallback(() => {
    announce('You have left the speaking queue.', 'polite');
  }, [announce]);

  const announceSpeakerChange = useCallback((speakerName, type) => {
    const typeText = type === 'HAND' ? '' : 
                    type === 'DIRECT_RESPONSE' ? ' with a direct response' :
                    type === 'POINT_PROCESS' ? ' with a point of process' :
                    type === 'POINT_INFO' ? ' with a point of information' :
                    type === 'POINT_CLARIFICATION' ? ' with a point of clarification' : '';
    
    announce(`${speakerName} is now speaking${typeText}.`, 'assertive');
  }, [announce]);

  // Proposal-specific announcements
  const announceProposalCreated = useCallback((title, proposer) => {
    announce(`New proposal created by ${proposer}: ${title}`, 'polite');
  }, [announce]);

  const announceVoteCast = useCallback((proposalTitle, voteType) => {
    const voteText = voteType === 'AGREE' ? 'agreement' :
                    voteType === 'STAND_ASIDE' ? 'stand aside' :
                    voteType === 'CONCERN' ? 'concern' :
                    voteType === 'BLOCK' ? 'block' : voteType;
    
    announce(`Your ${voteText} vote has been recorded for proposal: ${proposalTitle}`, 'polite');
  }, [announce]);

  const announceProposalDecision = useCallback((title, status) => {
    const statusText = status === 'PASSED' ? 'has passed' :
                      status === 'BLOCKED' ? 'has been blocked' :
                      status === 'WITHDRAWN' ? 'has been withdrawn' : `is now ${status}`;
    
    announce(`Proposal "${title}" ${statusText}.`, 'assertive');
  }, [announce]);

  // Meeting-specific announcements
  const announceMeetingJoin = useCallback((meetingTitle, participantCount) => {
    announce(`Joined meeting: ${meetingTitle}. ${participantCount} participants present.`, 'polite');
  }, [announce]);

  const announceParticipantJoin = useCallback((name, role) => {
    announce(`${name} joined as ${role}.`, 'polite');
  }, [announce]);

  const announceParticipantLeave = useCallback((name) => {
    announce(`${name} left the meeting.`, 'polite');
  }, [announce]);

  // Error announcements
  const announceError = useCallback((error) => {
    announce(`Error: ${error}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message) => {
    announce(`Success: ${message}`, 'polite');
  }, [announce]);

  return {
    announcement,
    level,
    announce,
    announcePolite,
    announceAssertive,
    announceQueueChange,
    announceQueueJoin,
    announceQueueLeave,
    announceSpeakerChange,
    announceProposalCreated,
    announceVoteCast,
    announceProposalDecision,
    announceMeetingJoin,
    announceParticipantJoin,
    announceParticipantLeave,
    announceError,
    announceSuccess
  };
}

export default useAnnouncements;


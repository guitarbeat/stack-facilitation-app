import { test, expect } from '@playwright/test';

test.describe('Complete Meeting Flow', () => {
  let meetingPin;
  let facilitatorPage;
  let participantPage;

  test.beforeAll(async ({ browser }) => {
    // Create two browser contexts for facilitator and participant
    const facilitatorContext = await browser.newContext();
    const participantContext = await browser.newContext();
    
    facilitatorPage = await facilitatorContext.newPage();
    participantPage = await participantContext.newPage();
  });

  test('should complete full meeting lifecycle', async () => {
    // Step 1: Facilitator creates meeting
    await facilitatorPage.goto('/');
    await facilitatorPage.click('text=Create Meeting');
    
    await facilitatorPage.fill('[data-testid="meeting-title"]', 'Test Cooperative Meeting');
    await facilitatorPage.fill('[data-testid="facilitator-name"]', 'Alice Facilitator');
    await facilitatorPage.click('[data-testid="create-meeting-button"]');
    
    // Extract meeting PIN
    await facilitatorPage.waitForSelector('[data-testid="meeting-pin"]');
    meetingPin = await facilitatorPage.textContent('[data-testid="meeting-pin"]');
    expect(meetingPin).toMatch(/^[A-Z0-9]{6}$/);
    
    // Step 2: Participant joins meeting
    await participantPage.goto('/');
    await participantPage.click('text=Join Meeting');
    
    await participantPage.fill('[data-testid="meeting-pin-input"]', meetingPin);
    await participantPage.fill('[data-testid="participant-name"]', 'Bob Participant');
    await participantPage.click('[data-testid="join-meeting-button"]');
    
    // Verify both users are in meeting
    await expect(facilitatorPage.locator('[data-testid="participant-list"]')).toContainText('Bob Participant');
    await expect(participantPage.locator('[data-testid="meeting-title"]')).toContainText('Test Cooperative Meeting');
    
    // Step 3: Test speaking queue
    await participantPage.click('[data-testid="join-queue-button"]');
    await participantPage.click('[data-testid="queue-type-hand"]');
    
    // Verify participant appears in queue
    await expect(facilitatorPage.locator('[data-testid="queue-display"]')).toContainText('Bob Participant');
    await expect(facilitatorPage.locator('[data-testid="queue-position-1"]')).toBeVisible();
    
    // Facilitator starts speaker
    await facilitatorPage.click('[data-testid="start-speaking-button"]');
    
    // Verify current speaker is displayed
    await expect(facilitatorPage.locator('[data-testid="current-speaker"]')).toContainText('Bob Participant');
    await expect(participantPage.locator('[data-testid="speaking-indicator"]')).toBeVisible();
    
    // Step 4: Test direct response
    await facilitatorPage.click('[data-testid="join-queue-button"]');
    await facilitatorPage.click('[data-testid="queue-type-direct-response"]');
    
    // Verify direct response is prioritized
    await expect(facilitatorPage.locator('[data-testid="queue-position-1"]')).toContainText('Alice Facilitator');
    await expect(facilitatorPage.locator('[data-testid="ordering-reason"]')).toContainText('Direct response');
    
    // Step 5: Test proposal creation
    await facilitatorPage.click('[data-testid="create-proposal-button"]');
    await facilitatorPage.fill('[data-testid="proposal-title"]', 'Test Proposal');
    await facilitatorPage.fill('[data-testid="proposal-description"]', 'This is a test proposal for our cooperative.');
    await facilitatorPage.click('[data-testid="submit-proposal-button"]');
    
    // Verify proposal appears
    await expect(facilitatorPage.locator('[data-testid="proposal-list"]')).toContainText('Test Proposal');
    await expect(participantPage.locator('[data-testid="proposal-list"]')).toContainText('Test Proposal');
    
    // Step 6: Test voting
    await participantPage.click('[data-testid="vote-agree-button"]');
    await facilitatorPage.click('[data-testid="vote-agree-button"]');
    
    // Verify votes are recorded
    await expect(facilitatorPage.locator('[data-testid="vote-count-agree"]')).toContainText('2');
    
    // Step 7: Test meeting export
    await facilitatorPage.click('[data-testid="export-meeting-button"]');
    await facilitatorPage.click('[data-testid="export-markdown"]');
    
    // Verify download starts
    const downloadPromise = facilitatorPage.waitForEvent('download');
    await facilitatorPage.click('[data-testid="confirm-export"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.md$/);
  });

  test('should handle progressive stack correctly', async () => {
    // Create meeting with progressive stack enabled
    await facilitatorPage.goto('/');
    await facilitatorPage.click('text=Create Meeting');
    
    await facilitatorPage.fill('[data-testid="meeting-title"]', 'Progressive Stack Test');
    await facilitatorPage.fill('[data-testid="facilitator-name"]', 'Facilitator');
    await facilitatorPage.check('[data-testid="enable-progressive-stack"]');
    await facilitatorPage.click('[data-testid="create-meeting-button"]');
    
    const pin = await facilitatorPage.textContent('[data-testid="meeting-pin"]');
    
    // Join as participant with invite tag
    await participantPage.goto('/');
    await participantPage.click('text=Join Meeting');
    await participantPage.fill('[data-testid="meeting-pin-input"]', pin);
    await participantPage.fill('[data-testid="participant-name"]', 'New Member');
    await participantPage.selectOption('[data-testid="participant-tags"]', 'new_to_group');
    await participantPage.click('[data-testid="join-meeting-button"]');
    
    // Both join queue
    await facilitatorPage.click('[data-testid="join-queue-button"]');
    await facilitatorPage.click('[data-testid="queue-type-hand"]');
    
    await participantPage.click('[data-testid="join-queue-button"]');
    await participantPage.click('[data-testid="queue-type-hand"]');
    
    // Verify participant with invite tag is prioritized
    await expect(facilitatorPage.locator('[data-testid="queue-position-1"]')).toContainText('New Member');
    await expect(facilitatorPage.locator('[data-testid="ordering-reason"]')).toContainText('Invite tags: new_to_group');
  });

  test('should be accessible with screen readers', async () => {
    await facilitatorPage.goto('/');
    
    // Test skip links
    await facilitatorPage.keyboard.press('Tab');
    await expect(facilitatorPage.locator('[data-testid="skip-to-content"]')).toBeFocused();
    
    // Test ARIA labels and live regions
    await facilitatorPage.click('text=Create Meeting');
    await facilitatorPage.fill('[data-testid="meeting-title"]', 'Accessibility Test');
    await facilitatorPage.fill('[data-testid="facilitator-name"]', 'Test Facilitator');
    await facilitatorPage.click('[data-testid="create-meeting-button"]');
    
    // Verify live region announcements
    await expect(facilitatorPage.locator('[aria-live="polite"]')).toContainText('Meeting created successfully');
    
    // Test keyboard navigation
    await facilitatorPage.keyboard.press('Tab');
    await facilitatorPage.keyboard.press('Tab');
    await facilitatorPage.keyboard.press('Enter'); // Should activate focused element
    
    // Verify focus management
    await expect(facilitatorPage.locator(':focus')).toBeVisible();
  });

  test('should work offline and sync when back online', async () => {
    // Create meeting and join
    await facilitatorPage.goto('/');
    await facilitatorPage.click('text=Create Meeting');
    await facilitatorPage.fill('[data-testid="meeting-title"]', 'Offline Test');
    await facilitatorPage.fill('[data-testid="facilitator-name"]', 'Facilitator');
    await facilitatorPage.click('[data-testid="create-meeting-button"]');
    
    const pin = await facilitatorPage.textContent('[data-testid="meeting-pin"]');
    
    await participantPage.goto('/');
    await participantPage.click('text=Join Meeting');
    await participantPage.fill('[data-testid="meeting-pin-input"]', pin);
    await participantPage.fill('[data-testid="participant-name"]', 'Participant');
    await participantPage.click('[data-testid="join-meeting-button"]');
    
    // Go offline
    await participantPage.context().setOffline(true);
    
    // Try to join queue while offline
    await participantPage.click('[data-testid="join-queue-button"]');
    await participantPage.click('[data-testid="queue-type-hand"]');
    
    // Verify offline indicator
    await expect(participantPage.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Go back online
    await participantPage.context().setOffline(false);
    
    // Verify sync occurs
    await expect(participantPage.locator('[data-testid="sync-indicator"]')).toBeVisible();
    await expect(facilitatorPage.locator('[data-testid="queue-display"]')).toContainText('Participant');
  });

  test('should handle incident reporting', async () => {
    // Create and join meeting
    await facilitatorPage.goto('/');
    await facilitatorPage.click('text=Create Meeting');
    await facilitatorPage.fill('[data-testid="meeting-title"]', 'Safety Test');
    await facilitatorPage.fill('[data-testid="facilitator-name"]', 'Facilitator');
    await facilitatorPage.click('[data-testid="create-meeting-button"]');
    
    const pin = await facilitatorPage.textContent('[data-testid="meeting-pin"]');
    
    await participantPage.goto('/');
    await participantPage.click('text=Join Meeting');
    await participantPage.fill('[data-testid="meeting-pin-input"]', pin);
    await participantPage.fill('[data-testid="participant-name"]', 'Participant');
    await participantPage.click('[data-testid="join-meeting-button"]');
    
    // Open incident report
    await participantPage.click('[data-testid="report-incident-button"]');
    
    // Fill incident report
    await participantPage.selectOption('[data-testid="incident-type"]', 'harassment');
    await participantPage.fill('[data-testid="incident-description"]', 'Test incident report');
    await participantPage.check('[data-testid="incident-anonymous"]');
    await participantPage.click('[data-testid="submit-incident-report"]');
    
    // Verify report submitted
    await expect(participantPage.locator('[data-testid="report-success"]')).toBeVisible();
    
    // Verify facilitator can see report (but not reporter info due to anonymous)
    await facilitatorPage.click('[data-testid="view-incidents-button"]');
    await expect(facilitatorPage.locator('[data-testid="incident-list"]')).toContainText('Test incident report');
    await expect(facilitatorPage.locator('[data-testid="incident-reporter"]')).toContainText('Anonymous');
  });

  test.afterAll(async () => {
    await facilitatorPage.close();
    await participantPage.close();
  });
});


import { openDB } from 'idb';

const DB_NAME = 'StackFacilitationDB';
const DB_VERSION = 1;

// IndexedDB stores
const STORES = {
  MEETINGS: 'meetings',
  QUEUE_ITEMS: 'queueItems',
  PROPOSALS: 'proposals',
  USERS: 'users',
  SYNC_QUEUE: 'syncQueue'
};

class OfflineStorage {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  async init() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Meetings store
          if (!db.objectStoreNames.contains(STORES.MEETINGS)) {
            const meetingStore = db.createObjectStore(STORES.MEETINGS, { keyPath: 'id' });
            meetingStore.createIndex('pin', 'pin', { unique: true });
            meetingStore.createIndex('isActive', 'isActive');
          }

          // Queue items store
          if (!db.objectStoreNames.contains(STORES.QUEUE_ITEMS)) {
            const queueStore = db.createObjectStore(STORES.QUEUE_ITEMS, { keyPath: 'id' });
            queueStore.createIndex('meetingId', 'meetingId');
            queueStore.createIndex('userId', 'userId');
            queueStore.createIndex('status', 'status');
          }

          // Proposals store
          if (!db.objectStoreNames.contains(STORES.PROPOSALS)) {
            const proposalStore = db.createObjectStore(STORES.PROPOSALS, { keyPath: 'id' });
            proposalStore.createIndex('meetingId', 'meetingId');
            proposalStore.createIndex('status', 'status');
          }

          // Users store
          if (!db.objectStoreNames.contains(STORES.USERS)) {
            const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
            userStore.createIndex('email', 'email', { unique: true, sparse: true });
          }

          // Sync queue store for offline actions
          if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
            const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            syncStore.createIndex('timestamp', 'timestamp');
            syncStore.createIndex('action', 'action');
          }
        }
      });

      console.log('IndexedDB initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      return false;
    }
  }

  // Meeting operations
  async saveMeeting(meeting) {
    if (!this.db) await this.init();
    
    try {
      await this.db.put(STORES.MEETINGS, {
        ...meeting,
        lastUpdated: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Failed to save meeting:', error);
      return false;
    }
  }

  async getMeeting(meetingId) {
    if (!this.db) await this.init();
    
    try {
      return await this.db.get(STORES.MEETINGS, meetingId);
    } catch (error) {
      console.error('Failed to get meeting:', error);
      return null;
    }
  }

  async getMeetingByPin(pin) {
    if (!this.db) await this.init();
    
    try {
      return await this.db.getFromIndex(STORES.MEETINGS, 'pin', pin);
    } catch (error) {
      console.error('Failed to get meeting by PIN:', error);
      return null;
    }
  }

  // Queue operations
  async saveQueueItems(meetingId, queueItems) {
    if (!this.db) await this.init();
    
    try {
      const tx = this.db.transaction(STORES.QUEUE_ITEMS, 'readwrite');
      
      // Clear existing queue items for this meeting
      const existingItems = await tx.store.index('meetingId').getAll(meetingId);
      for (const item of existingItems) {
        await tx.store.delete(item.id);
      }
      
      // Save new queue items
      for (const item of queueItems) {
        await tx.store.put({
          ...item,
          lastUpdated: new Date().toISOString()
        });
      }
      
      await tx.done;
      return true;
    } catch (error) {
      console.error('Failed to save queue items:', error);
      return false;
    }
  }

  async getQueueItems(meetingId) {
    if (!this.db) await this.init();
    
    try {
      return await this.db.getAllFromIndex(STORES.QUEUE_ITEMS, 'meetingId', meetingId);
    } catch (error) {
      console.error('Failed to get queue items:', error);
      return [];
    }
  }

  // Proposal operations
  async saveProposals(meetingId, proposals) {
    if (!this.db) await this.init();
    
    try {
      const tx = this.db.transaction(STORES.PROPOSALS, 'readwrite');
      
      for (const proposal of proposals) {
        await tx.store.put({
          ...proposal,
          lastUpdated: new Date().toISOString()
        });
      }
      
      await tx.done;
      return true;
    } catch (error) {
      console.error('Failed to save proposals:', error);
      return false;
    }
  }

  async getProposals(meetingId) {
    if (!this.db) await this.init();
    
    try {
      return await this.db.getAllFromIndex(STORES.PROPOSALS, 'meetingId', meetingId);
    } catch (error) {
      console.error('Failed to get proposals:', error);
      return [];
    }
  }

  // User operations
  async saveUser(user) {
    if (!this.db) await this.init();
    
    try {
      await this.db.put(STORES.USERS, {
        ...user,
        lastUpdated: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Failed to save user:', error);
      return false;
    }
  }

  async getUser(userId) {
    if (!this.db) await this.init();
    
    try {
      return await this.db.get(STORES.USERS, userId);
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  // Sync queue operations for offline actions
  async addToSyncQueue(action, data) {
    if (!this.db) await this.init();
    
    try {
      await this.db.add(STORES.SYNC_QUEUE, {
        action,
        data,
        timestamp: new Date().toISOString(),
        retries: 0
      });
      return true;
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      return false;
    }
  }

  async getSyncQueue() {
    if (!this.db) await this.init();
    
    try {
      return await this.db.getAll(STORES.SYNC_QUEUE);
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  async removeSyncItem(id) {
    if (!this.db) await this.init();
    
    try {
      await this.db.delete(STORES.SYNC_QUEUE, id);
      return true;
    } catch (error) {
      console.error('Failed to remove sync item:', error);
      return false;
    }
  }

  async clearSyncQueue() {
    if (!this.db) await this.init();
    
    try {
      await this.db.clear(STORES.SYNC_QUEUE);
      return true;
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
      return false;
    }
  }

  // Network status handlers
  handleOnline() {
    console.log('App is online - starting sync');
    this.isOnline = true;
    this.syncOfflineActions();
  }

  handleOffline() {
    console.log('App is offline - enabling offline mode');
    this.isOnline = false;
  }

  // Sync offline actions when back online
  async syncOfflineActions() {
    if (!this.isOnline) return;

    const syncItems = await this.getSyncQueue();
    
    for (const item of syncItems) {
      try {
        await this.executeSyncAction(item);
        await this.removeSyncItem(item.id);
      } catch (error) {
        console.error('Failed to sync action:', error);
        
        // Increment retry count
        item.retries = (item.retries || 0) + 1;
        
        // Remove item if too many retries
        if (item.retries >= 3) {
          await this.removeSyncItem(item.id);
          console.warn('Sync item removed after 3 failed attempts:', item);
        }
      }
    }
  }

  async executeSyncAction(syncItem) {
    const { action, data } = syncItem;
    
    switch (action) {
      case 'ADD_TO_QUEUE':
        return await fetch(`/api/queue/${data.meetingId}/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.payload)
        });
        
      case 'REMOVE_FROM_QUEUE':
        return await fetch(`/api/queue/${data.meetingId}/remove/${data.itemId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.payload)
        });
        
      case 'CREATE_PROPOSAL':
        return await fetch(`/api/proposals/${data.meetingId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.payload)
        });
        
      case 'VOTE_ON_PROPOSAL':
        return await fetch(`/api/proposals/${data.proposalId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.payload)
        });
        
      default:
        console.warn('Unknown sync action:', action);
    }
  }

  // Utility methods
  isOffline() {
    return !this.isOnline;
  }

  async clearAllData() {
    if (!this.db) await this.init();
    
    try {
      const storeNames = Object.values(STORES);
      const tx = this.db.transaction(storeNames, 'readwrite');
      
      for (const storeName of storeNames) {
        await tx.objectStore(storeName).clear();
      }
      
      await tx.done;
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage;


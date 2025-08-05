// Service Worker for Stack Facilitation PWA
// Provides offline functionality and caching

const CACHE_NAME = 'stack-facilitation-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

const API_CACHE_NAME = 'stack-facilitation-api-v1';
const API_URLS = [
  '/api/meetings',
  '/api/users',
  '/api/queue',
  '/api/proposals'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static file requests
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network request failed, trying cache', error);
    
    // Fall back to cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache', request.url);
        return cachedResponse;
      }
    }
    
    // Return offline response for failed requests
    return new Response(
      JSON.stringify({
        error: 'Network unavailable',
        offline: true,
        message: 'This action will be synced when you\'re back online'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fall back to network
    const networkResponse = await fetch(request);
    
    // Cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to serve static request', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'queue-sync') {
    event.waitUntil(syncQueueActions());
  }
  
  if (event.tag === 'proposal-sync') {
    event.waitUntil(syncProposalActions());
  }
});

// Sync queue actions when back online
async function syncQueueActions() {
  try {
    // This would integrate with IndexedDB to sync offline actions
    console.log('Service Worker: Syncing queue actions');
    
    // Send message to main thread to handle sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_QUEUE_ACTIONS'
      });
    });
  } catch (error) {
    console.error('Service Worker: Failed to sync queue actions', error);
  }
}

// Sync proposal actions when back online
async function syncProposalActions() {
  try {
    console.log('Service Worker: Syncing proposal actions');
    
    // Send message to main thread to handle sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_PROPOSAL_ACTIONS'
      });
    });
  } catch (error) {
    console.error('Service Worker: Failed to sync proposal actions', error);
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'New meeting activity',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'meeting-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Meeting'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Stack Facilitation', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Loaded');


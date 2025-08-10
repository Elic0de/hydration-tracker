// Service Worker for Hydration Tracker PWA
const CACHE_NAME = 'hydration-tracker-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  // Add more static assets as needed
];

// Dynamic cache patterns
const CACHE_PATTERNS = {
  api: /^https:\/\/api\./,
  images: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  styles: /\.css$/,
  scripts: /\.js$/,
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[SW] Opened cache');
      
      try {
        await cache.addAll(STATIC_CACHE_URLS);
        console.log('[SW] Static files cached');
      } catch (error) {
        console.error('[SW] Failed to cache static files:', error);
      }
    })()
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })()
  );
  
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy: Network First (for HTML pages and API calls)
    if (request.headers.get('accept')?.includes('text/html') || 
        CACHE_PATTERNS.api.test(request.url)) {
      return await networkFirst(request);
    }
    
    // Strategy: Cache First (for static assets)
    if (CACHE_PATTERNS.images.test(request.url) ||
        CACHE_PATTERNS.styles.test(request.url) ||
        CACHE_PATTERNS.scripts.test(request.url)) {
      return await cacheFirst(request);
    }
    
    // Strategy: Stale While Revalidate (for other resources)
    return await staleWhileRevalidate(request);
    
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    
    // Return offline page for navigation requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const cache = await caches.open(CACHE_NAME);
      return await cache.match(OFFLINE_URL) || new Response('Offline', { status: 503 });
    }
    
    // Return cached response if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return generic offline response
    return new Response('Resource not available offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network First strategy
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone and cache the response
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Cache First strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Start network request (don't await)
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.log('[SW] Network update failed:', error);
  });
  
  // Return cached response if available, otherwise wait for network
  return cachedResponse || networkResponsePromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync-hydration') {
    event.waitUntil(syncHydrationData());
  }
});

async function syncHydrationData() {
  try {
    // Get pending sync data from IndexedDB or localStorage
    const pendingData = await getPendingSyncData();
    
    if (pendingData.length > 0) {
      console.log('[SW] Syncing pending data:', pendingData);
      
      // Process each pending item
      for (const item of pendingData) {
        try {
          // Send data to server (if you have a backend)
          // await fetch('/api/sync', {
          //   method: 'POST',
          //   body: JSON.stringify(item),
          //   headers: { 'Content-Type': 'application/json' }
          // });
          
          console.log('[SW] Synced item:', item);
        } catch (error) {
          console.error('[SW] Failed to sync item:', item, error);
        }
      }
      
      // Clear synced data
      await clearSyncData();
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function getPendingSyncData() {
  // In a real app, you would get this from IndexedDB
  // For now, return empty array
  return [];
}

async function clearSyncData() {
  // Clear synced data from storage
  console.log('[SW] Clearing synced data');
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : '水分補給の時間です！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'hydration-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'record',
        title: '記録する',
        icon: '/icons/action-record.png'
      },
      {
        action: 'dismiss',
        title: '後で',
        icon: '/icons/action-dismiss.png'
      }
    ],
    data: {
      url: '/?action=quick-record',
      timestamp: Date.now()
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('💧 水分補給リマインダー', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'record') {
    // Open app and trigger quick record
    event.waitUntil(
      clients.openWindow(data.url || '/?action=quick-record')
    );
  } else if (action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default click - open the app
    event.waitUntil(
      clients.openWindow(data.url || '/')
    );
  }
});

// Message handler for communication with the app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Error handler
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

// Unhandled promise rejection handler
self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker registered successfully');
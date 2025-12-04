// BarrelVerse Service Worker
// Provides offline functionality and caching

const CACHE_NAME = 'barrelverse-v1'
const OFFLINE_URL = '/offline'

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('BarrelVerse: Caching core assets')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API requests (always go to network)
  if (event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response and update cache in background
          event.waitUntil(
            fetch(event.request)
              .then((response) => {
                if (response.ok) {
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(event.request, response))
                }
              })
              .catch(() => {})
          )
          return cachedResponse
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response.ok && response.type === 'basic') {
              const responseToCache = response.clone()
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseToCache))
            }
            return response
          })
          .catch(() => {
            // Network failed, try to serve offline page for navigation
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
            }
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-collection') {
    event.waitUntil(syncCollection())
  }
  if (event.tag === 'sync-tastings') {
    event.waitUntil(syncTastings())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  
  const options = {
    body: data.body || 'New update from BarrelVerse',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'BarrelVerse', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
})

// Helper functions
async function syncCollection() {
  // Sync offline collection changes
  const cache = await caches.open(CACHE_NAME)
  const offlineChanges = await cache.match('/offline-collection-changes')
  
  if (offlineChanges) {
    const changes = await offlineChanges.json()
    // Send to server
    for (const change of changes) {
      try {
        await fetch('/api/collection/sync', {
          method: 'POST',
          body: JSON.stringify(change)
        })
      } catch (e) {
        console.error('Failed to sync:', e)
      }
    }
    // Clear offline changes
    await cache.delete('/offline-collection-changes')
  }
}

async function syncTastings() {
  // Sync offline tasting notes
  const cache = await caches.open(CACHE_NAME)
  const offlineTastings = await cache.match('/offline-tastings')
  
  if (offlineTastings) {
    const tastings = await offlineTastings.json()
    for (const tasting of tastings) {
      try {
        await fetch('/api/tastings/sync', {
          method: 'POST',
          body: JSON.stringify(tasting)
        })
      } catch (e) {
        console.error('Failed to sync tasting:', e)
      }
    }
    await cache.delete('/offline-tastings')
  }
}

console.log('🥃 BarrelVerse Service Worker loaded')

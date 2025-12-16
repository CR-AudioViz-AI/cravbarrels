// BarrelVerse Service Worker
// Provides offline functionality and caching
// UPDATED: Force cache refresh with new version

const CACHE_NAME = 'barrelverse-v2-fresh'  // NEW VERSION - CLEARS OLD CACHE
const OFFLINE_URL = '/offline'

// Assets to cache immediately - NO IMAGES
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json'
]

// Install event - cache core assets only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('BarrelVerse v2: Caching core assets')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - DELETE ALL OLD CACHES
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('BarrelVerse: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - NEVER cache images, only cache HTML/CSS/JS
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  
  // Skip API requests
  if (event.request.url.includes('/api/')) return
  
  // Skip image requests - always fetch fresh
  if (event.request.url.includes('unsplash.com') || 
      event.request.url.includes('.jpg') ||
      event.request.url.includes('.png') ||
      event.request.url.includes('.webp') ||
      event.request.url.includes('.gif')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
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

        return fetch(event.request)
          .then((response) => {
            if (response.ok && response.type === 'basic') {
              const responseToCache = response.clone()
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseToCache))
            }
            return response
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
            }
          })
      })
  )
})

console.log('🥃 BarrelVerse Service Worker v2 loaded - Fresh images!')

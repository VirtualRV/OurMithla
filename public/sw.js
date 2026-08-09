const CACHE_NAME = 'ourmithla-pwa-v1'
const STATIC_ASSETS = [
  '/',
  '/blog',
  '/panchang',
  '/contact',
  '/favicon.ico',
  '/icon.png',
  '/apple-icon.png',
  '/images/hero-mithila.png',
]

// Install event - precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - Network-first with Cache fallback for dynamic requests, Cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Ignore non-GET requests or browser extension/admin/AdSense scripts
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/admin') ||
    url.hostname.includes('googlesyndication') ||
    url.hostname.includes('google-analytics')
  ) {
    return
  }

  // Network-first strategy for dynamic pages and Panchang data
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return networkResponse
      })
      .catch(() => {
        // Fallback to cache if network fails (offline mode)
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Return home page if navigation request fails
          if (event.request.mode === 'navigate') {
            return caches.match('/')
          }
        })
      })
  )
})

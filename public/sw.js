/* Easy Visa service worker: caches public pages and assets, never private data. */
const CACHE = 'easy-visa-public-v1'
const FALLBACK_PAGE = '/ar'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(FALLBACK_PAGE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('easy-visa-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/admin') || url.pathname.startsWith('/api') || url.pathname.startsWith('/media')) return

  // Navigation uses the latest page when online and the most recent public
  // response when offline. Images, fonts, and compiled assets are cache-first.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()))
          return response
        })
        .catch(async () => (await caches.match(request)) || (await caches.match(FALLBACK_PAGE)) || Response.error()),
    )
    return
  }

  if (/\.(?:css|js|mjs|woff2?|png|jpe?g|webp|avif|svg|ico)$/i.test(url.pathname) || url.pathname.startsWith('/_next/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()))
            return response
          }),
      ),
    )
  }
})

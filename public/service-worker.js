const CACHE_NAME = 'farm-app-cache-v2'; // Increment cache version
const urlsToCache = [
    '/',
    '/index.html',
    '/static/js/main.js', // **IMPORTANT: ADJUST THIS PATH AFTER BUILD!**
    '/static/css/main.css', // **IMPORTANT: ADJUST THIS PATH AFTER BUILD!**
    '/logo192.png',
    '/logo512.png',
    '/favicon.ico',
    // Add any other static assets your app uses
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Cache-then-network strategy with fallback
            if (response) {
                return response;
            }

            return fetch(event.request)
                .then((networkResponse) => {
                    // Check if we received a valid response
                    if (
                        !networkResponse ||
                        networkResponse.status !== 200 ||
                        networkResponse.type !== 'basic'
                    ) {
                        return networkResponse;
                    }

                    // IMPORTANT: Clone the response. A response can only be consumed once.
                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                })
                .catch(() => {
                    // Return fallback content
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html'); // Or a custom offline page
                    }
                    return null;
                });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); // Clean old caches
                    }
                })
            );
        })
    );
});
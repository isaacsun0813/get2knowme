const CACHE_NAME = 'get2knowme-images-v1';
const IMAGES_TO_CACHE = [
  '/photos/adventure/adventure1.jpg',
  '/photos/adventure/adventure2.jpg',
  '/photos/adventure/adventure3.jpg',
  '/photos/adventure/adventure4.jpg',
  '/photos/adventure/adventure5.jpg',
  '/photos/adventure/adventure6.jpg',
  '/photos/adventure/adventure7.jpg',
  '/photos/adventure/adventure8.jpg',
  '/photos/adventure/adventure9.jpg',
  '/photos/adventure/adventure10.jpg',
  '/photos/adventure/adventure11.jpg',
  '/photos/adventure/adventure12.jpg',
  '/photos/adventure/adventure13.jpg',
  '/photos/adventure/adventure14.jpg',
  '/photos/adventure/adventure15.jpg',
  '/photos/adventure/adventure16.jpg',
  '/photos/adventure/adventure17.jpg',
  '/photos/adventure/aot.gif',
  '/photos/profilePic.jpeg',
  '/photos/projects/Verdra.png',
  '/photos/projects/PrizeSole.png'
];

// Install event - cache all images
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(IMAGES_TO_CACHE);
      })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version if available
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network and cache
          return fetch(event.request)
            .then((response) => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            });
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

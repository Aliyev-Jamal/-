const CACHE_NAME = 'mars-quest-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style/style.css',
    '/js/index.js',
    '/service-worker.js',
    '/icons/game-icon-192.png',
    '/icons/game-icon-512.png',
    '/fonts/NineteenEightySeven.ttf',
    '/audio/bg-music.mp3',
    '/audio/explosion.mp3',
    '/audio/confirm.mp3',
    '/audio/ending-music.mp3',
    '/assets/alien.png',
    '/assets/damaged-rocket.png',
    '/assets/dialog-box.png',
    '/assets/explosion.gif',
    '/assets/flame.gif',
    '/assets/mars-bg.png',
    '/assets/mars-planet.png',
    '/assets/rocket.png',
    '/assets/stars.webp',
    '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
const CACHE_NAME = 'fintrack-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instala o service worker e adiciona os arquivos ao cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  console.log('[ServiceWorker] Instalado e cache criado');
});

// Ativa e limpa versões antigas do cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removendo cache antigo:', key);
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

// Intercepta as requisições e responde com o cache se estiver offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

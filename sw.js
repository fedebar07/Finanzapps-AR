const CACHE = 'finanzas-ar-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js'
];

// Instalar: guardar assets en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activar: limpiar cachés viejas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: primero caché, luego red (cache-first)
self.addEventListener('fetch', e => {
  // Solo interceptar GET
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Guardar en caché solo respuestas válidas
        if (resp && resp.status === 200 && resp.type !== 'opaque') {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      }).catch(() => cached); // Si falla la red, devolver caché si existe
    })
  );
});

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('ge-cache-v1').then(cache =>
      cache.addAll(['/', '/static/manifest.json'])
    )
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

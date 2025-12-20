const CACHE_NAME = "plusopinion-pwa-v1";

const FILES_TO_CACHE = [
  "./",
  "./HOMEPAGE_FINAL.HTML",
  "./CATAGORYPAGE.HTML",
  "./PRIVATE OWNER PROFILE.HTML",
  "./MY SPACE FINAL (USER).HTML",
  "./NOTIFICATION PANEL.HTML",
  "./runtime.js",
  "./bridge.js",
  "./data.seed.js",
  "./global.css",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
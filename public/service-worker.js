const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/index.js",
    "/db.js",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
  ];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE = "data-cache-v1";

  
  self.addEventListener("install", function(e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("Your files were cached successfully.")
        return cache.addAll(FILES_TO_CACHE)
      })
    )
    self.skipWaiting();
  });
  
  self.addEventListener("activate", function(e) {
    e.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(data => {
            if (data !== CACHE_NAME && data !== DATA_CACHE) {
              console.log("Removing old cache data", data);
              return caches.delete(data);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  
  self.addEventListener("fetch", function(e) {
    if (e.request.url.includes("/api/")) {
      e.respondWith(
        caches.open(DATA_CACHE).then(cache => {
          return fetch(e.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(e.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              return cache.match(e.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
  
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  });
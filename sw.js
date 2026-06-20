const CACHE_NAME = "pilingo-v6";

const APP_FILES = [
  "./",
  "./index.html",
  "./engine.html",
  "./lesson.html",
  "./splash.html",
  "./voice.html",
  "./game1.html",
  "./game2.html",
  "./game3.html",
  "./game4.html",
  "./game5.html",
  "./game6.html",
  "./game7.html",
  "./engine-core.js",
  "./pwa.js",
  "./pilingo-sounds.js",
  "./app-ui.js",
  "./app-state.js",
  "./app-polish.js",
  "./app-effects.js",
  "./vocab_a1.js",
  "./manifest.webmanifest",
  "./pilingo-icon.svg",
  "./pilingo-icon-192.png",
  "./pilingo-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if(event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isHtmlRequest =
    event.request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith("/");

  if(isHtmlRequest) {
    event.respondWith(
      fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});

self.addEventListener("message", (event) => {
  if(event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.registration.unregister();

    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    await Promise.all(clients.map((client) => {
      if ("navigate" in client) {
        return client.navigate(client.url);
      }
      return Promise.resolve();
    }));
  })());
});

self.addEventListener("fetch", () => {
  // Leave all requests to the network so the newest app files always load.
});

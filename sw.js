/* Sunnyvale Zion · service worker
   Shows phone/laptop notifications for announcements and assignment reveals,
   and opens the right tab when one is tapped. Keep this file next to index.html. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let m = {};
  try { m = e.data ? e.data.json() : {}; } catch (_) { m = { body: e.data && e.data.text() }; }
  const title = m.title || "Sunnyvale Zion";
  const opts = {
    body: m.body || "",
    icon: "icons/icon-192.png",
    badge: "icons/badge-96.png",
    tag: m.tag || undefined,
    renotify: !!m.tag,
    vibrate: [120, 60, 120],
    timestamp: Date.now(),
    data: { url: m.url || "./", key: m.key || "", kind: m.kind || "" },
  };
  e.waitUntil(
    self.registration.showNotification(title, opts).catch((err) => console.warn(err)).then(() =>
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) =>
        list.forEach((c) => c.postMessage({ type: "sz-push", title, body: opts.body, key: opts.data.key, kind: opts.data.kind, url: opts.data.url }))
      )
    )
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const c = list.find((w) => w.url.startsWith(self.registration.scope));
      if (c) {
        c.postMessage({ type: "sz-open", url });
        return c.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});

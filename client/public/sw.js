// public/sw.js
// Service worker: receives push events from the server (utils/push.js) even
// when the tab is closed/backgrounded, and shows a native browser notification.
// This file is registered by src/utils/pushNotifications.js.

self.addEventListener("push", (event) => {
  let data = { title: "SocialFeed", body: "You have a new notification" };
  try {
    data = event.data.json();
  } catch {
    /* fall back to the default above if the payload isn't JSON */
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/vite.svg",
      badge: "/vite.svg",
    })
  );
});

// Clicking the notification focuses (or opens) the app tab.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});

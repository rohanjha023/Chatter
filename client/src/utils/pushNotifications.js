// src/utils/pushNotifications.js
// Call enablePushNotifications() from a button click (e.g. a "Enable
// notifications" toggle in the UI). It registers the service worker,
// asks the browser for permission, subscribes to Web Push, and sends
// the subscription object to the backend to save on the user's account.
// Safe to call even if VITE_VAPID_PUBLIC_KEY isn't set — it just no-ops.
import api from "../services/api";

// Web Push needs the VAPID public key as a Uint8Array, not a plain string.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function enablePushNotifications() {
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    console.warn("VITE_VAPID_PUBLIC_KEY not set — push notifications are disabled.");
    return false;
  }
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser.");
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const registration = await navigator.serviceWorker.register("/sw.js");
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  await api.post("/users/push/subscribe", { subscription });
  return true;
}

export async function disablePushNotifications() {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();
  await api.post("/users/push/unsubscribe");
}

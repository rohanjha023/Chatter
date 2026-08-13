// utils/push.js
// Sends browser push notifications (likes, replies, follows) using the
// Web Push API + VAPID keys. This is OPTIONAL: if you haven't generated
// VAPID keys yet, sendPushToUser() just logs and does nothing instead of
// crashing — the rest of the app (in-app + Socket.io notifications) works
// perfectly fine without it.
//
// How to generate VAPID keys (one-time):
//   npx web-push generate-vapid-keys
// then paste the output into server/.env as VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY,
// and put the SAME public key into client/.env as VITE_VAPID_PUBLIC_KEY.

const webpush = require("web-push");

const isPushConfigured =
  !!process.env.VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY;

if (isPushConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log("Web Push configured.");
} else {
  console.warn(
    "VAPID keys missing in .env — browser push notifications are disabled (in-app + Socket.io notifications still work)."
  );
}

/**
 * Fire-and-forget a push notification to one user, if they've subscribed.
 * @param {import("../models/User")} user Mongoose User document
 * @param {{title: string, body: string, url?: string}} payload
 */
const sendPushToUser = async (user, payload) => {
  if (!isPushConfigured) return;
  if (!user || !user.pushSubscription || !user.pushSubscription.endpoint) return;

  try {
    await webpush.sendNotification(user.pushSubscription, JSON.stringify(payload));
  } catch (error) {
    // A 410/404 means the subscription expired — clear it so we stop retrying.
    if (error.statusCode === 410 || error.statusCode === 404) {
      user.pushSubscription = undefined;
      await user.save().catch(() => {});
    } else {
      console.error("Push notification failed:", error.message);
    }
  }
};

module.exports = { sendPushToUser, isPushConfigured };

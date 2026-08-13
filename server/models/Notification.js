// models/Notification.js
// In-app notification record. Created by postController.js (on like/reply/
// repost) and userController.js (on follow), then also pushed live over
// Socket.io AND as a browser push notification (utils/push.js) if the
// recipient has an active push subscription.

const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["like", "reply", "repost", "follow", "mention"],
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);

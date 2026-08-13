// models/User.js
// Core user account. Follow/follower lists are stored as ObjectId arrays
// directly on the user document (simple + fast for reads at this scale).
// Payment-related fields (stripeCustomerId etc.) are scaffolded for the
// optional monetization feature but are NOT wired to any route yet —
// see README "Not implemented / future work" section.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^(?=[^@]*[a-zA-Z])[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Email must contain letters before @"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    displayName: {
      type: String,
      required: true,
      minlength: [2, "Full Name must be at least 2 characters long"],
      match: [/^[a-zA-Z\s]+$/, "Full Name can only contain letters and spaces"],
    },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    coverImageUrl: { type: String, default: "" },
    themePreference: { type: String, enum: ["light", "dark"], default: "dark" },

    // Web Push subscription object (browser generates this, we store it
    // and use it in utils/push.js to send notifications).
    pushSubscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String,
      },
    },

    // --- Scaffolded for future monetization work (not implemented) ---
    stripeCustomerId: { type: String },
    stripeConnectAccountId: { type: String },
    isPremiumCreator: { type: Boolean, default: false },
    premiumSubscriptionPrice: { type: Number, default: 0 },
    // -------------------------------------------------------------

    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Hash the password automatically before saving, but only if it changed.
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance helper used during login to compare plaintext vs hashed password.
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);

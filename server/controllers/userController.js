// controllers/userController.js
const User = require("../models/User");
const Notification = require("../models/Notification");
const { uploadImage } = require("../utils/uploadImage");
const { getIO } = require("../socket");
const { sendPushToUser } = require("../utils/push");

// @desc    Get a public profile by username
// @route   GET /api/users/:username
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select(
        "-password -pushSubscription -stripeCustomerId -stripeConnectAccountId"
      )
      .populate("following", "username displayName avatarUrl")
      .populate("followers", "username displayName avatarUrl");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update the logged-in user's profile (name, bio, avatar)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { displayName, bio, themePreference } = req.body;

    if (displayName) {
      if (displayName.trim().length < 2 || !/^[a-zA-Z\s]+$/.test(displayName)) {
        return res.status(400).json({ message: "Full name must be at least 2 letters, letters/spaces only" });
      }
      user.displayName = displayName;
    }

    if (bio !== undefined) user.bio = bio;
    if (themePreference && ["light", "dark"].includes(themePreference)) {
      user.themePreference = themePreference;
    }

    // Optional avatar file, sent as multipart/form-data field "avatar".
    if (req.file) {
      try {
        user.avatarUrl = await uploadImage(req.file.buffer, req.file.originalname, "avatars", req);
      } catch (uploadError) {
        return res.status(500).json({ message: "Failed to upload profile image", error: uploadError.message });
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
      coverImageUrl: updatedUser.coverImageUrl,
      themePreference: updatedUser.themePreference,
      following: updatedUser.following,
      followers: updatedUser.followers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a handful of users to suggest following
// @route   GET /api/users
// @access  Private
const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const excludeIds = [req.user.id, ...(currentUser.following || [])];

    const users = await User.find({ _id: { $nin: excludeIds } })
      .select("displayName username avatarUrl bio")
      .limit(5);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Follow or unfollow a user (toggle)
// @route   PUT /api/users/follow/:id
// @access  Private
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);
    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.some((id) => id.toString() === targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentUserId);
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    // Notify + realtime + push only when it's a fresh follow, not an unfollow.
    if (!isFollowing) {
      const notification = await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: "follow",
      });
      getIO().to(`user:${targetUserId}`).emit("notification:new", {
        _id: notification._id,
        type: "follow",
        sender: { _id: currentUser._id, username: currentUser.username, displayName: currentUser.displayName, avatarUrl: currentUser.avatarUrl },
        createdAt: notification.createdAt,
      });
      sendPushToUser(targetUser, { title: "New follower", body: `${currentUser.displayName} started following you` });
    }

    res.json({
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Save/replace this user's Web Push subscription
// @route   POST /api/users/push/subscribe
// @access  Private
const subscribeToPush = async (req, res) => {
  try {
    const { subscription } = req.body; // { endpoint, keys: { p256dh, auth } }
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription object" });
    }
    await User.findByIdAndUpdate(req.user.id, { pushSubscription: subscription });
    res.json({ message: "Subscribed to push notifications" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Remove this user's Web Push subscription
// @route   POST /api/users/push/unsubscribe
// @access  Private
const unsubscribeFromPush = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $unset: { pushSubscription: 1 } });
    res.json({ message: "Unsubscribed from push notifications" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  getSuggestedUsers,
  followUser,
  subscribeToPush,
  unsubscribeFromPush,
};

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "CHAT_MESSAGE",
        "CONNECTION_REQUEST",
        "CONNECTION_ACCEPTED",
        "LIKE",
        "COMMENT",
      ],
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },

    photoUrl: {
      type: String,
      default: null,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Main notification-history query:
// "Give me this user's newest notifications"
notificationSchema.index({
  recipientId: 1,
  createdAt: -1,
});

// Useful later for unread count
notificationSchema.index({
  recipientId: 1,
  isRead: 1,
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;
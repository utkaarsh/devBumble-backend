const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    lastMessage: {
      text: {
        type: String,
        default: "",
      },

      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      createdAt: {
        type: Date,
      },

      delivered: {
        type: Boolean,
        default: false,
      },

      seen: {
        type: Boolean,
        default: false,
      },
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    }
  },
  {
    timestamps: true,
  }
);

chatSchema.index({
  participants: 1,
  lastMessageAt: -1,
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = { Chat };
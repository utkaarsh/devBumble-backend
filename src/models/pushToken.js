const mongoose = require("mongoose");

const pushTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    platform: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PushToken = mongoose.model("PushToken", pushTokenSchema);

module.exports = PushToken;

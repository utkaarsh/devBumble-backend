const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      default:
        "https://www.shutterstock.com/shutterstock/photos/2247726673/display_1500/stock-vector-user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-neutral-gender-2247726673.jpg",
    },
    skills: {
      type: [String],
    },
    about: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

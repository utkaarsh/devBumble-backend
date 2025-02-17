const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

userSchema.methods.validatePassword = async function (password) {
  const user = this;
  const hashedPassword = user.password;

  const isValidPassword = await bcrypt.compare(password, hashedPassword);
  return isValidPassword;
};

userSchema.methods.getJwt = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, "DEVBUMBLE@utkarsh", {
    expiresIn: "1d",
  });

  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

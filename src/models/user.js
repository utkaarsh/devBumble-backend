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
    },
    photoUrl: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517433_1280.png",
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

//Indexing

userSchema.index({ firstName: 1, lastName: 1 }); //Compound index for name search
userSchema.index({ _id: "hashed" }); // Hashed index for sharding

userSchema.methods.validatePassword = async function (password) {
  const user = this;
  const hashedPassword = user.password;

  const isValidPassword = await bcrypt.compare(password, hashedPassword);
  return isValidPassword;
};

userSchema.methods.getJwt = async function () {
  const user = this;

  const token = await jwt.sign(
    { _id: user._id },
    process.env.JWT_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

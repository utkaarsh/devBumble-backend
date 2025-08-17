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
    location: {
      type: String,
    },
    interests: {
      type: [String],
    },
    experience: {
      type: String,
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
// ✅ Remove sensitive fields automatically when converting to JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

userSchema.methods.getJwt = async function () {
  const user = this;

  // Use toJSON so that password + __v are stripped automatically
  const safeUser = user.toJSON();

  const token = await jwt.sign(
    { user: safeUser },
    process.env.JWT_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

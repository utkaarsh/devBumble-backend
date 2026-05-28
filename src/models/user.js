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
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0],
      },
      updatedAt: Date
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
    lastActive: {
      type: Date,
      default: Date.now,
    },
    profileScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    feedRadius: {
      type: Number,
      default: 50000, // meters (50km)
      min: 1000,      // 1km minimum
      max: 500000,    // 500km maximum
    },
  },
  { timestamps: true }
);

//Indexing

userSchema.index({ firstName: 1, lastName: 1 }); //Compound index for name search
userSchema.index({ _id: "hashed" }); // Hashed index for sharding
userSchema.index({ location: "2dsphere", lastActive: -1 });
userSchema.index({ lastActive: -1 }); // For recency-only queries
userSchema.index(
  { firstName: "text", lastName: "text", skills: "text", interests: "text", about: "text" },
  { weights: { firstName: 10, lastName: 10, skills: 5, interests: 5, about: 1 }, name: "user_search_text" }
);
// Pre-save hook: auto-compute profileScore based on completeness
userSchema.pre("save", function (next) {
  // Only recompute if relevant fields changed
  const fieldsToWatch = ["about", "skills", "interests", "experience", "photoUrl", "age", "gender", "location"];
  const isRelevantChange = this.isNew || fieldsToWatch.some((f) => this.isModified(f));
  if (!isRelevantChange) return next();

  let score = 0;
  if (this.about && this.about.trim().length > 0) score += 20;
  if (this.skills && this.skills.length > 0) score += Math.min(20, this.skills.length * 5);
  if (this.interests && this.interests.length > 0) score += Math.min(15, this.interests.length * 5);
  if (this.experience && this.experience.trim().length > 0) score += 15;
  if (
    this.photoUrl &&
    this.photoUrl !== "https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517433_1280.png"
  )
    score += 15;
  if (this.age) score += 5;
  if (this.gender) score += 5;
  if (
    this.location &&
    this.location.coordinates &&
    (this.location.coordinates[0] !== 0 || this.location.coordinates[1] !== 0)
  )
    score += 5;

  this.profileScore = Math.min(100, score);
  next();
});

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

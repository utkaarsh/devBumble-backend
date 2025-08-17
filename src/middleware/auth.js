const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  try {
    if (!token) {
      return res.status(401).send("Please login");
    }
    const decodedData = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    const { user } = decodedData;

    const userExist = await User.findById(user._id);
    if (!userExist) {
      throw new Error("User not found");
    }

    req.user = userExist;
    next();
  } catch (error) {
    res.status(400).json({ msg: "Error : Invalid token" });
    console.error("Auth Error : " + error.message);
  }
};

module.exports = { userAuth };

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  try {
    if (!token) {
      return res.status(401).send("Please login");
    }
    const decodedData = await jwt.verify(token, "DEVBUMBLE@utkarsh");
    const { _id } = decodedData;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("Error : Invalid token");
    console.error("Auth Error : " + error.message);
  }
};

module.exports = { userAuth };

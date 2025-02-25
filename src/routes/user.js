const express = require("express");
const { userAuth } = require("../middleware/auth");
const {
  getUserPendingRequest,
  getUserConnections,
  getUserFeed,
} = require("../controllers/userController");

const userRouter = express.Router();

//Get all pending connection requests for logged in users
userRouter.get("/user/requests/recieved", userAuth, getUserPendingRequest);

//Get all user connections
userRouter.get("/user/connections", userAuth, getUserConnections);

//Get feed
userRouter.get("/user/feed", userAuth, getUserFeed);
module.exports = userRouter;

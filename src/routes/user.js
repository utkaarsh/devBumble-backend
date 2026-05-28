const express = require("express");
const { userAuth } = require("../middleware/auth");
const {
  getUserPendingRequest,
  getUserConnections,
  getUserFeed,
  getMyUserDetails,
  getOtherUserDetails,
  getUserSentRequest,
  searchUserController,
  updateLocationController,
  blockUserController,
  unblockUserController,
} = require("../controllers/userController");

const userRouter = express.Router();

//Get my user data
userRouter.get("/user/mydetails", userAuth, getMyUserDetails);

//Get other user details
userRouter.get("/user/details/:id", userAuth, getOtherUserDetails);

//Get all pending connection requests for logged in users
userRouter.get("/user/requests/recieved", userAuth, getUserPendingRequest);

//Get all sent connection requests for logged in users
userRouter.get("/user/requests/sent", userAuth, getUserSentRequest);

//Get all user connections
userRouter.get("/user/connections", userAuth, getUserConnections);

//Get feed (nearby developers recommendation)
userRouter.get("/user/feed", userAuth, getUserFeed);

//Search User
userRouter.get("/users/search", userAuth, searchUserController);

//Update Location
userRouter.put("/users/location", userAuth, updateLocationController);

//Block a user
userRouter.post("/user/block/:userId", userAuth, blockUserController);

//Unblock a user
userRouter.delete("/user/block/:userId", userAuth, unblockUserController);

module.exports = userRouter;

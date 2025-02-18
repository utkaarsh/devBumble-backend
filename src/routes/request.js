const express = require("express");
const {
  sendConnectionRequest,
  reviewConnectionRequests,
} = require("../controllers/requestsController");
const { userAuth } = require("../middleware/auth");

const requestRouter = express.Router();

//Send connection request or ignore

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  sendConnectionRequest
);

//Accept connection request or reject

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  reviewConnectionRequests
);

module.exports = requestRouter;

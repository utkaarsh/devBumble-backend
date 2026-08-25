const express = require("express");
const {
  sendConnectionRequest,
  reviewConnectionRequests,
  cancelConnectionRequest,
  removeConnection,
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

requestRouter.delete(
  "/request/cancel/:requestId",
  userAuth,
  cancelConnectionRequest
);

requestRouter.delete(
  "/request/remove/:userId",
  userAuth,
  removeConnection
);

module.exports = requestRouter;

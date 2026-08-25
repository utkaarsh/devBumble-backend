const express = require("express");
const { userAuth } = require("../middleware/auth");
const {
  registerPushToken,
  testSendNotification,
} = require("../controllers/notificationController");

const notificationRouter = express.Router();

notificationRouter.post("/notifications/push-token", userAuth, registerPushToken);
notificationRouter.post("/notifications/test-send", userAuth, testSendNotification);

module.exports = notificationRouter;

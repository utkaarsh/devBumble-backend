const express = require("express");
const { userAuth } = require("../middleware/auth");
const {
  registerPushToken,
  testSendNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const notificationRouter = express.Router();

notificationRouter.post("/notifications/push-token", userAuth, registerPushToken);
notificationRouter.post("/notifications/test-send", userAuth, testSendNotification);
notificationRouter.get(
  "/notifications",
  userAuth,
  getNotifications
);
notificationRouter.patch(
  "/notifications/:notificationId/read",
  userAuth,
  markNotificationAsRead
);

notificationRouter.patch(
  "/notifications/mark-all-read",
  userAuth,
  markAllNotificationsAsRead
);


module.exports = notificationRouter;

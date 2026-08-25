const Notification = require("../models/notifications");

const createNotification = async ({
  recipientId,
  type,
  senderId = null,
  title,
  body,
  photoUrl = null,
  data = {},
}) => {
  try {
    const notification = await Notification.create({
      recipientId,
      type,
      senderId,
      title,
      body,
      photoUrl,
      data,
    });

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    throw error;
  }
};

module.exports = {
  createNotification,
};
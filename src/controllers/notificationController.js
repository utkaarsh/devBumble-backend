const PushToken = require("../models/pushToken");
const sendPushNotification = require("../utility/pushNotifications");
const Notification = require("../models/notifications");


module.exports.registerPushToken = async (req, res) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user._id;

    if (!token || !platform) {
      return res.status(400).json({ error: "Token and platform are required" });
    }

    // Upsert token: if token already exists, associate it with the current logged-in user
    const pushToken = await PushToken.findOneAndUpdate(
      { token },
      { userId, platform },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Push token registered successfully",
      data: pushToken,
    });
  } catch (error) {
    console.error("Error registering push token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.testSendNotification = async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: "userId, title, and body are required" });
    }

    await sendPushNotification(userId, {
      title,
      body,
      data: data || { test: true },
    });

    res.status(200).json({ message: "Test notification trigger dispatched" });
  } catch (error) {
    console.error("Error triggering test notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      50
    );

    const { before } = req.query;

    const query = {
      recipientId: userId,
    };

    // Cursor pagination
    if (before) {
      query._id = {
        $lt: before,
      };
    }

    const notifications = await Notification.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate({
        path: "senderId",
        select: "firstName lastName photoUrl",
      })
      .lean();

    const hasMore = notifications.length > limit;

    if (hasMore) {
      notifications.pop();
    }

    const nextCursor =
      hasMore && notifications.length > 0
        ? notifications[notifications.length - 1]._id
        : null;

    res.status(200).json({
      notifications,
      pagination: {
        hasMore,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};

 //Read notifications

 module.exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipientId: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error
    );

    return res.status(500).json({
      message: "Failed to mark notification as read",
    });
  }
};

module.exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      {
        recipientId: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error
    );

    return res.status(500).json({
      message: "Failed to mark notifications as read",
    });
  }
};

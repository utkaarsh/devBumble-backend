const PushToken = require("../models/pushToken");
const sendPushNotification = require("../utility/pushNotifications");

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

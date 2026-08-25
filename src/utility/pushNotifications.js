const PushToken = require("../models/pushToken");

/**
 * Sends a push notification to all registered tokens for a given user.
 * 
 * @param {string|mongoose.Types.ObjectId} recipientUserId - The ID of the recipient user.
 * @param {Object} payload - Notification payload.
 * @param {string} payload.title - The title of the notification.
 * @param {string} payload.body - The body of the notification message.
 * @param {Object} [payload.data] - Custom data to send with the notification.
 */
const sendPushNotification = async (recipientUserId, { title, body, data }) => {
  try {
    const tokens = await PushToken.find({ userId: recipientUserId });
    if (!tokens || tokens.length === 0) {
      console.log(`No push tokens found for user ${recipientUserId}`);
      return;
    }

    // Expo tokens pattern validation
    const expoTokens = tokens
      .map((t) => t.token)
      .filter((token) => /^Expo(nent)?PushToken\[.*\]$/.test(token));

    if (expoTokens.length === 0) {
      console.log(`No valid Expo push tokens found for user ${recipientUserId}`);
      return;
    }

    const messages = expoTokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: data || {},
    }));

    console.log(`Sending push notification to user ${recipientUserId} (${expoTokens.length} devices)`);

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    
    if (result && Array.isArray(result.data)) {
      for (let i = 0; i < result.data.length; i++) {
        const item = result.data[i];
        if (item.status === "error") {
          console.error(`Expo push error for token ${messages[i].to}: ${item.message}`);
          if (item.details?.error === "DeviceNotRegistered") {
            const badToken = messages[i].to;
            await PushToken.deleteOne({ token: badToken });
            console.log(`Removed unregistered push token from database: ${badToken}`);
          }
        }
      }
    } else {
      console.log("Expo API push result:", result);
    }
  } catch (error) {
    console.error("Error in sendPushNotification utility:", error);
  }
};

module.exports = sendPushNotification;

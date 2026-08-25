const ConnectionRequest = require("../models/connectionRequests");
const User = require("../models/user");
const { createNotification } = require("../services/notificationService");
const sendPushNotification = require("../utility/pushNotifications");
// const sendEmail = require("../utility/sendEmail");

module.exports.sendConnectionRequest = async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;
    const allowedStatus = ["interested", "ignored"];
    const userExists = await User.findById(toUserId);
    const alreadyRequested = await ConnectionRequest.find({
      $or: [
        { toUserId: fromUserId, fromUserId: toUserId },
        { toUserId, fromUserId },
      ],
    });

    if (!allowedStatus.includes(status)) {
      throw new Error("Invalid status type : " + status);
    }
    if (!userExists) {
      return res.status(404).json({ message: "User does not exists!" });
    }
    if (fromUserId == toUserId) {
      return res
        .status(403)
        .json({ message: "Cannot send connection request to self!!" });
    }

    if (alreadyRequested?.length && alreadyRequested?.[0]?.status !== "ignored") {
      return res.status(400).json({
        message: "Already a request action taken!!!",
        status: alreadyRequested[0]?.status,
      });
    }

    const connectionRequestAction = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequestAction.save();

    if (status === "interested") {
      createNotification({
        recipientId: toUserId,
        type: "CONNECTION_REQUEST",
        senderId: fromUserId,
        title: "New Connection Request",
        body: `${req.user.firstName} ${req.user.lastName} sent you a connection request.`,
        photoUrl: req.user.photoUrl,
        data: {
          type: "CONNECTION_REQUEST",
          fromUserId: req.user._id,
        },
      })

      sendPushNotification(toUserId, {
        title: "New Connection Request",
        body: `${req.user.firstName} ${req.user.lastName} sent you a connection request.`,
        data: {
          type: "CONNECTION_REQUEST",
          fromUserId: req.user._id,
        },
      }).catch((err) => console.error("Push notification send error:", err));
    }

    res.json({
      message: "Request sent successfully !!",
      data,
    });
  } catch (error) {
    console.error("Send connection request error : " + error.message);
    res.status(400).send("Send connection request error : " + error.message);
  }
};

module.exports.reviewConnectionRequests = async (req, res) => {
  try {
    const { status, requestId } = req.params;
    const loggedUser = req.user;

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      throw new Error("Invalid status type : " + status);
    }

    const connectionRequest = await ConnectionRequest.findOne({
      fromUserId: requestId,
      toUserId: loggedUser._id,
      status: "interested",
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connectionRequest.status = status;

    const data = await connectionRequest.save();

    if (status === "accepted") {
      createNotification({
        recipientId: requestId,
        type: "CONNECTION_ACCEPTED",
        senderId: loggedUser._id,
        title: "Connection Request Accepted",
        body: `${loggedUser.firstName} ${loggedUser.lastName} accepted your connection request!`,
        photoUrl: loggedUser.photoUrl,
        data: {
          type: "CONNECTION_ACCEPTED",
          acceptedByUserId: loggedUser._id,
        },
      })

      sendPushNotification(requestId, {
        title: "Connection Request Accepted",
        body: `${loggedUser.firstName} ${loggedUser.lastName} accepted your connection request!`,
        data: {
          type: "CONNECTION_ACCEPTED",
          acceptedByUserId: loggedUser._id,
        },
      }).catch((err) => console.error("Push notification send error:", err));
    }

    res.json({ message: "Connection request " + status, data });
  } catch (error) {
    console.error("Review connection request error : " + error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports.cancelConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ConnectionRequest.findOne({
      _id: requestId,
      fromUserId: userId,
      status: "interested",
    });

    if (!request) {
      return res.status(404).json({
        message: "Pending connection request not found",
      });
    }

    await ConnectionRequest.deleteOne({
      _id: request._id,
    });

    return res.status(200).json({
      message: "Connection request cancelled successfully",
    });
  } catch (error) {
    console.error(
      "Cancel connection request error:",
      error
    );

    return res.status(500).json({
      message: "Failed to cancel connection request",
    });
  }
};

module.exports.removeConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const connectionRequest = await ConnectionRequest.findOne({
      status: "accepted",
      $or: [
        {
          fromUserId: currentUserId,
          toUserId: userId,
        },
        {
          fromUserId: userId,
          toUserId: currentUserId,
        },
      ],
    });

    if (!connectionRequest) {
      return res.status(404).json({
        message: "Connection not found",
      });
    }

    await ConnectionRequest.deleteOne({
      _id: connectionRequest._id,
    });

    return res.status(200).json({
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error(
      "Remove connection error:",
      error
    );

    return res.status(500).json({
      message: "Failed to remove connection",
    });
  }
};

const ConnectionRequest = require("../models/connectionRequests");
const User = require("../models/user");
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

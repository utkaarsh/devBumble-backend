const ConnectionRequest = require("../models/connectionRequests");
const User = require("../models/user");
const sendEmail = require("../utility/sendEmail");

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

    if (alreadyRequested?.length) {
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

    try {
      const emailRes = await sendEmail.run(
        "A new connection request from " + req.user.firstName,
        req.user.firstName + " has sent a connection request to someone"
      );
      console.log("Hell yeah email sent ", emailRes);
    } catch (error) {
      console.error("Email issue ", error);
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
      _id: requestId,
      toUserId: loggedUser._id,
      status: "interested",
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connectionRequest.status = status;

    const data = await connectionRequest.save();

    res.json({ message: "Connection request " + status, data });
  } catch (error) {
    console.error("Review connection request error : " + error.message);
    res.status(400).json({ error: error.message });
  }
};

const ConnectionRequest = require("../models/connectionRequests");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender skills about";

module.exports.getUserPendingRequest = async (req, res) => {
  try {
    const loggedUser = req.user;

    if (!loggedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    if (!connectionRequests?.length > 0) {
      return res.status(404).json({ message: "No connection requests" });
    }

    res.json({
      message: "Data fetched successfully!",
      data: connectionRequests,
    });
  } catch (error) {
    console.error("Get pending request error : " + error.message);
    res
      .status(400)
      .json({ error: "Get pending request error : " + error.message });
  }
};
module.exports.getUserConnections = async (req, res) => {
  try {
    const loggedUser = req.user;

    if (!loggedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedUser._id, status: "accepted" },
        {
          fromUserId: loggedUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    if (!connectionRequests?.length > 0) {
      return res.status(404).json({ message: "No connections" });
    }

    const data = connectionRequests?.map((row) => {
      if (row.fromUserId._id.toString() === loggedUser._id.toString()) {
        console.log("connections fetched successfully");

        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({
      message: "Data fetched successfully!",
      data,
    });
  } catch (error) {
    console.error("Get pending request error : " + error.message);
    res
      .status(400)
      .json({ error: "Get pending request error : " + error.message });
  }
};

module.exports.getUserFeed = async (req, res) => {
  try {
    const loggedUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    limit = limit > 30 ? 30 : limit;
    const offsets = (page - 1) * limit;

    //Find all connection requests
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        {
          toUserId: loggedUser._id,
        },
        {
          fromUserId: loggedUser._id,
        },
      ],
    }).select("fromUserId toUserId");

    const hideUsersOnFeed = new Set();

    connectionRequest.forEach((req) => {
      hideUsersOnFeed.add(req.fromUserId.toString());
      hideUsersOnFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        {
          _id: { $nin: Array.from(hideUsersOnFeed) },
        },
        {
          _id: { $ne: loggedUser?._id },
        },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(offsets)
      .limit(limit);

    res.json({ message: "Fetched feed data successfully", data: users });
  } catch (error) {
    console.error("Get Feed Error : " + error.message);
    res.status(400).json({ error: "Get Feed Error : " + error.message });
  }
};

module.exports.getMyUserDetails = (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ user });
  } catch (error) {
    console.error("Failed to get user details", error);
    res.status(400).send("Error fetching my user details");
  }
};

module.exports.getOtherUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).exec();

    if (!user) {
      throw new Error("User not found");
    }

    return res
      .status(200)
      .json({ message: "User fetched successfully! ", user });
  } catch (error) {
    console.error("Error fetching user details");
    res.status(400).send("Error fetching user details");
  }
};

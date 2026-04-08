const ConnectionRequest = require("../models/connectionRequests");
const User = require("../models/user");

const USER_SAFE_DATA =
  "firstName lastName photoUrl age gender skills about interests experience location";

module.exports.getUserPendingRequest = async (req, res) => {
  try {
    console.log("Hitted get pending request controller");
    const loggedUser = req.user;

    if (!loggedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // ✅ query with pagination + sorting
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedUser._id,
      status: "interested",
    })
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit)
      .populate("fromUserId", USER_SAFE_DATA);

    // ✅ map to only user data (clean response)
    const data = connectionRequests.map((req) => req.fromUserId);

    // ❌ don’t throw 404 for empty list (important for pagination)
    res.json({
      message: `Data fetched successfully for ${loggedUser.firstName}  ${loggedUser.lastName} !`,
      data,
      page,
      hasMore: data.length === limit, // ✅ key for infinite scroll
    });
  } catch (error) {
    console.error("Get pending request error:", error.message);
    res.status(400).json({
      error: "Get pending request error: " + error.message,
    });
  }
};

module.exports.getUserSentRequest = async (req, res) => {
  try {
    console.log("Hitted get pending request controller");
    const loggedUser = req.user;

    if (!loggedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // ✅ query with pagination + sorting
    const connectionRequests = await ConnectionRequest.find({
      fromUserId: loggedUser._id,
      status: "interested",
    })
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit)
      .populate("toUserId", USER_SAFE_DATA);

    // ✅ map to only user data (clean response)
    const data = connectionRequests.map((req) => req.toUserId);

    // ❌ don’t throw 404 for empty list (important for pagination)
    res.json({
      message: `Data fetched successfully for ${loggedUser.firstName}  ${loggedUser.lastName} !`,
      data,
      page,
      hasMore: data.length === limit, // ✅ key for infinite scroll
    });
  } catch (error) {
    console.error("Get pending request error:", error.message);
    res.status(400).json({
      error: "Get pending request error: " + error.message,
    });
  }
};

module.exports.getUserConnections = async (req, res) => {
  try {
    const loggedUser = req.user;

    if (!loggedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedUser._id, status: "accepted" },
        { fromUserId: loggedUser._id, status: "accepted" },
      ],
    })
      .sort({ createdAt: -1 }) // ✅ latest first
      .skip(skip)
      .limit(limit)
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((row) => {
      return row.fromUserId._id.toString() === loggedUser._id.toString()
        ? row.toUserId
        : row.fromUserId;
    });

    res.json({
      message: "Data fetched successfully!",
      data,
      page,
      hasMore: data.length === limit, // ✅ important
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
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

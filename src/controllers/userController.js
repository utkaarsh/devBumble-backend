const ConnectionRequest = require("../models/connectionRequests");
const User = require("../models/user");
const {
  buildExclusionSet,
  buildFeedPipeline,
} = require("../utility/feedPipeline");

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
    res.json({
      error: "Get pending request error: " + error.message,
    });
  }
};

module.exports.getUserSentRequest = async (req, res) => {
  try {
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

// ────────────────────────────────────────────────────────────────
// Nearby Developers Feed
// $geoNear → nearest first → exclusion → paginate
// ────────────────────────────────────────────────────────────────
module.exports.getUserFeed = async (req, res) => {
  try {
    const loggedUser = req.user;

    let limit = parseInt(req.query.limit) || 10;
    limit = Math.min(limit, 30);

    const lastSeenId = req.query.lastSeenId || null;
    const maxDistance =
      parseInt(req.query.maxDistance) || loggedUser.feedRadius || 50000;

    // Build exclusion set
    const excludeIds = await buildExclusionSet(loggedUser._id);

    // User's location
    const userLocation =
      loggedUser.location && loggedUser.location.coordinates
        ? loggedUser.location.coordinates
        : null;

    if (!userLocation || (userLocation[0] === 0 && userLocation[1] === 0)) {
      return res.status(400).json({
        error:
          "Location not set. Update your location first via PUT /users/location",
      });
    }

    // Build & run pipeline
    const pipeline = buildFeedPipeline({
      userLocation,
      excludeIds,
      maxDistance,
      limit,
      lastSeenId,
    });

    const results = await User.aggregate(pipeline);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    // Next page cursor = last item's _id
    const nextLastSeenId =
      data.length > 0 ? data[data.length - 1]._id.toString() : null;

    res.json({
      message: "Feed fetched successfully",
      data,
      hasMore,
      nextLastSeenId,
      meta: {
        maxDistance,
        count: data.length,
      },
    });
  } catch (error) {
    console.error("Get Feed Error:", error.message);
    res.status(400).json({ error: "Get Feed Error: " + error.message });
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

//Search users controller

module.exports.searchUserController = async (req, res) => {
  try {
    const loggedUser = req.user;
    const query = req.query?.q?.trim();

    if (!query || query.length < 2) {
      return res
        .status(400)
        .json({ error: "Search query must be at least 2 characters" });
    }

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = Math.min(limit, 30);
    const skip = (page - 1) * limit;

    let results;
    let totalCount;

    // Try $text search first (works for full words, uses text index with relevance scoring)
    const textSearchQuery = {
      $text: { $search: query },
      _id: { $ne: loggedUser._id },
    };

    totalCount = await User.countDocuments(textSearchQuery);

    if (totalCount > 0) {
      results = await User.find(textSearchQuery, {
        score: { $meta: "textScore" },
      })
        .select(USER_SAFE_DATA)
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)
        .lean();
    } else {
      // Fallback: regex search for partial matches (autocomplete)
      const regex = new RegExp(query, "i");

      const regexQuery = {
        _id: { $ne: loggedUser._id },
        $or: [
          { firstName: regex },
          { lastName: regex },
          { skills: regex },
          { interests: regex },
        ],
      };

      totalCount = await User.countDocuments(regexQuery);
      results = await User.find(regexQuery)
        .select(USER_SAFE_DATA)
        .sort({ firstName: 1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    res.json({
      message: "Search results fetched successfully",
      data: results,
      page,
      hasMore: skip + results.length < totalCount,
      totalCount,
    });
  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(400).json({ error: "Search Error: " + error.message });
  }
};

module.exports.updateLocationController = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
        updatedAt: new Date(),
      },
    });

    res.send({ success: true });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

// ────────────────────────────────────────────────────────────────
// Block / Unblock User
// ────────────────────────────────────────────────────────────────

module.exports.blockUserController = async (req, res) => {
  try {
    const loggedUser = req.user;
    const { userId } = req.params;

    if (loggedUser._id.toString() === userId) {
      return res.status(400).json({ error: "Cannot block yourself" });
    }

    // Verify target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already blocked
    const existingBlock = await ConnectionRequest.findOne({
      fromUserId: loggedUser._id,
      toUserId: userId,
      status: "blocked",
    });

    if (existingBlock) {
      return res.status(400).json({ error: "User is already blocked" });
    }

    // Remove any existing connection request between the two users (in either direction)
    await ConnectionRequest.deleteMany({
      $or: [
        { fromUserId: loggedUser._id, toUserId: userId },
        { fromUserId: userId, toUserId: loggedUser._id },
      ],
    });

    // Create a block record
    const blockRequest = new ConnectionRequest({
      fromUserId: loggedUser._id,
      toUserId: userId,
      status: "blocked",
    });

    await blockRequest.save();

    res.json({ message: `${targetUser.firstName} has been blocked` });
  } catch (error) {
    console.error("Block User Error:", error.message);
    res.status(400).json({ error: "Block User Error: " + error.message });
  }
};

module.exports.unblockUserController = async (req, res) => {
  try {
    const loggedUser = req.user;
    const { userId } = req.params;

    const result = await ConnectionRequest.findOneAndDelete({
      fromUserId: loggedUser._id,
      toUserId: userId,
      status: "blocked",
    });

    if (!result) {
      return res.status(404).json({ error: "Block record not found" });
    }

    res.json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("Unblock User Error:", error.message);
    res.status(400).json({ error: "Unblock User Error: " + error.message });
  }
};

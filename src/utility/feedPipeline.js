const mongoose = require("mongoose");
const ConnectionRequest = require("../models/connectionRequests");

/**
 * Build the exclusion set for a user's feed.
 * Uses two targeted indexed queries instead of loading all connection requests.
 *
 * @param {ObjectId} userId - The logged-in user's ID
 * @returns {Promise<Set<string>>} - Set of user ID strings to exclude from feed
 */
async function buildExclusionSet(userId) {
  const [sentRequests, receivedRequests] = await Promise.all([
    ConnectionRequest.find({ fromUserId: userId })
      .select("toUserId")
      .lean(),
    ConnectionRequest.find({ toUserId: userId })
      .select("fromUserId")
      .lean(),
  ]);

  const excludeIds = new Set();
  excludeIds.add(userId.toString());

  sentRequests.forEach((req) => excludeIds.add(req.toUserId.toString()));
  receivedRequests.forEach((req) => excludeIds.add(req.fromUserId.toString()));

  return excludeIds;
}

/**
 * Build a simple nearby-first feed pipeline.
 * $geoNear → exclude → sort by distance → paginate → project safe fields
 *
 * @param {Object} options
 * @param {number[]} options.userLocation  - [longitude, latitude]
 * @param {Set<string>} options.excludeIds - User IDs to exclude
 * @param {number} options.maxDistance     - Max distance in meters
 * @param {number} options.limit          - Page size
 * @param {string|null} options.lastSeenId - Last document _id for cursor pagination
 * @returns {Object[]} - MongoDB aggregation pipeline stages
 */
function buildFeedPipeline(options) {
  const {
    userLocation,
    excludeIds,
    maxDistance = 50000,
    limit = 10,
    lastSeenId = null,
  } = options;

  const excludeObjectIds = Array.from(excludeIds).map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  // If cursor provided, also exclude everything up to and including lastSeenId
  if (lastSeenId) {
    excludeObjectIds.push(new mongoose.Types.ObjectId(lastSeenId));
  }

  const pipeline = [];

  // ── Stage 1: $geoNear — nearest first ──
  pipeline.push({
    $geoNear: {
      near: {
        type: "Point",
        coordinates: userLocation,
      },
      distanceField: "distance", // meters
      maxDistance: maxDistance,
      spherical: true,
      key: "location", // explicitly specify which 2dsphere index to use
      query: {
        _id: { $nin: excludeObjectIds },
      },
    },
  });

  // ── Stage 2: $limit — fetch one extra to know if there's more ──
  pipeline.push({ $limit: limit + 1 });

  // ── Stage 3: $project — safe fields + distance in km ──
  pipeline.push({
    $project: {
      firstName: 1,
      lastName: 1,
      photoUrl: 1,
      age: 1,
      gender: 1,
      skills: 1,
      about: 1,
      interests: 1,
      experience: 1,
      location: 1,
      lastActive: 1,
      distance: 1,
      distanceInKm: {
        $round: [{ $divide: ["$distance", 1000] }, 1],
      },
    },
  });

  return pipeline;
}

module.exports = {
  buildExclusionSet,
  buildFeedPipeline,
};

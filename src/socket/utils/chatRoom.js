const crypto = require("crypto");

const getChatRoomId = (userId, otherUserId) => {
  return crypto
    .createHash("sha256")
    .update(
      [userId.toString(), otherUserId.toString()]
        .sort()
        .join("_")
    )
    .digest("hex");
};

const getUserRoomId = (userId) => {
  return `user:${userId}`;
};

module.exports = {
  getChatRoomId,
  getUserRoomId,
};
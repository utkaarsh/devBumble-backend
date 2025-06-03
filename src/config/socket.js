const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getSecretRoomId = (userId, otherUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, otherUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    // handle any event
    socket.on("join-chat", ({ userId, otherUserId, firstName }) => {
      const roomId = [userId, otherUserId].sort().join("_");
      socket.join(roomId);
      console.log(firstName, "joined the room:", roomId);
    });

    socket.on(
      "send-message",
      async ({ userId, otherUserId, firstName, lastName, text, photoUrl }) => {
        try {
          const roomId = [userId, otherUserId].sort().join("_");
          // TODO: Check if userId & targetUserId are friends

          let chat = await Chat.findOne({
            participants: { $all: [userId, otherUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, otherUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();

          io.to(roomId).emit("messageRecieved", {
            firstName,
            lastName,
            text,
            photoUrl,
          });
        } catch (error) {
          console.error("Send message to user error ", error);
        }
      }
    );
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;

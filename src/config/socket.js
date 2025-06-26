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
      const roomId = getSecretRoomId(userId, otherUserId);
      socket.join(roomId);
      console.log(firstName, "joined the room:", roomId);
    });

    socket.on(
      "send-message",
      async ({
        userId,
        otherUserId,
        firstName,
        lastName,
        text,
        photoUrl,
        createdAt,
      }) => {
        try {
          const roomId = getSecretRoomId(userId, otherUserId);
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
            delivered: true, // Mark as delivered on send
          });

          await chat.save();

          io.to(roomId).emit("messageRecieved", {
            firstName,
            lastName,
            text,
            photoUrl,
            createdAt,
          });
        } catch (error) {
          console.error("Send message to user error ", error);
        }
      }
    );

    socket.on("mark-as-seen", async ({ userId, otherUserId }) => {
      const chat = await Chat.findOne({
        participants: { $all: [userId, otherUserId] },
      });

      if (chat) {
        let updated = false;
        chat.messages.forEach((msg) => {
          if (msg.senderId.toString() === otherUserId && !msg.seen) {
            msg.seen = true;
            updated = true;
          }
        });
        if (updated) await chat.save();
        const roomId = getSecretRoomId(userId, otherUserId);
        socket.to(roomId).emit("messagesSeen", { seenBy: userId });
      }
    });
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;

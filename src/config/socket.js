const { Server } = require("socket.io");
const registerChatHandlers = require("../socket/handlers/chat.socket");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = initializeSocket;
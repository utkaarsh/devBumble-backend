const express = require("express");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middleware/auth");
const { getChatList, deleteChat, getChatMessages } = require("../controllers/chatContoller");

const chatRouter = express.Router();

// ==================================================
// CHAT LIST
// ==================================================

chatRouter.get(
  "/chats",
  userAuth,
  getChatList
);


// ==================================================
// CHAT MESSAGES
// ==================================================

chatRouter.get(
  "/chat/:otherUserId/messages",
  userAuth,
  getChatMessages
);


// ==================================================
// DELETE CHAT
// ==================================================

chatRouter.delete(
  "/chat/delete/:chatId",
  userAuth,
  deleteChat
);

module.exports = chatRouter;

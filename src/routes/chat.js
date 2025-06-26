const express = require("express");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middleware/auth");

const chatRouter = express.Router();

chatRouter.get("/chat/:otherUserId", userAuth, async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, otherUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName photoUrl",
    });
    if (!chat) {
      chat = new Chat({
        participants: [userId, otherUserId],
        messages: [],
      });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    console.error(err);
  }
});

module.exports = chatRouter;

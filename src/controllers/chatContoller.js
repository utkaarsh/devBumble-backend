const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequests");
const { Message } = require("../models/message");
const User = require("../models/user");
const mongoose = require("mongoose");
const { timeAgo } = require("../utility/helpers");



// ==================================================
// GET CHAT LIST
// GET /chats
// ==================================================

module.exports.getChatList = async (req, res) => {
  try {
    const userId = req.user._id;

    // -----------------------------------------------
    // Get existing chats
    // -----------------------------------------------

    const chats = await Chat.find({
      participants: userId,
      lastMessageAt: { $ne: null },
    })
      .sort({ lastMessageAt: -1 })
      .populate({
        path: "participants",
        select: "firstName lastName photoUrl",
      })
      .lean();

    const chatList = chats
      .map((chat) => {
        const otherParticipant = chat.participants.find(
          (participant) =>
            participant._id.toString() !== userId.toString()
        );

        if (!otherParticipant) {
          return null;
        }

        const lastMessage = chat.lastMessage;

        let lastMessageText = lastMessage?.text || "";

        // ---------------------------------------------
        // If the last message was sent by us
        // ---------------------------------------------

        if (
          lastMessage?.senderId?.toString() ===
          userId.toString()
        ) {
          if (lastMessage.seen) {
            lastMessageText = "Seen";
          } else {
            lastMessageText = `Sent ${timeAgo(
              lastMessage.createdAt
            )}`;
          }
        }

        return {
          chatId: chat._id,
          userId: otherParticipant._id,
          firstName: otherParticipant.firstName,
          lastName: otherParticipant.lastName,
          photoUrl: otherParticipant.photoUrl,
          unreadCount: chat.unreadCounts?.[userId.toString()] ?? 0,
          lastMessage: {
            ...lastMessage,

            text: lastMessageText,
          },

          lastMessageAt: chat.lastMessageAt,
        };
      })
      .filter(Boolean);


    // -----------------------------------------------
    // Get users who don't have a chat yet
    // -----------------------------------------------

    const chattedUserIds = chats.flatMap(
      (chat) =>
        chat.participants.map(
          (participant) => participant._id
        )
    );


    // -----------------------------------------------
    // Get accepted connections
    // -----------------------------------------------

    const connectionRequests =
      await ConnectionRequest.find({
        $or: [
          {
            toUserId: userId,
            status: "accepted",
          },
          {
            fromUserId: userId,
            status: "accepted",
          },
        ],
      });


    // -----------------------------------------------
    // Get suggestions
    // -----------------------------------------------

    const connectedUserIds = connectionRequests.flatMap(
      (request) => [
        request.toUserId,
        request.fromUserId,
      ]
    );

    const suggestions = await User.find({
      _id: {
        $nin: [
          userId,
          ...chattedUserIds,
        ],

        $in: connectedUserIds,
      },
    })
      .select(
        "firstName lastName photoUrl about"
      )
      .limit(7)
      .lean();


    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    return res.status(200).json({
      message: "Chat list fetched successfully",

      data: chatList,

      suggestions,
    });

  } catch (error) {
    console.error(
      "Get chat list error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch chat list",
    });
  }
};


// ==================================================
// GET CHAT MESSAGES
// GET /chat/:chatId/messages
// ==================================================

module.exports.getChatMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user._id;

    // -----------------------------------------------
    // Validate otherUserId
    // -----------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // -----------------------------------------------
    // Find chat between current user and other user
    // -----------------------------------------------

    const chat = await Chat.findOne({
      participants: {
        $all: [userId, otherUserId],
      },
    }).lean();

    // -----------------------------------------------
    // Chat doesn't exist yet
    // -----------------------------------------------

    if (!chat) {
      return res.status(200).json({
        message: "Chat found",
        data: [],
      });
    }

    // -----------------------------------------------
    // Get messages using Chat._id
    // -----------------------------------------------

    const messages = await Message.find({
      chatId: chat._id,
    })
      .sort({ createdAt: 1 })
      .populate({
        path: "senderId",
        select: "firstName lastName photoUrl",
      })
      .lean();

    // -----------------------------------------------
    // Return messages
    // -----------------------------------------------

    return res.status(200).json({
      message: "Messages fetched successfully",
      data: messages,
    });

  } catch (error) {
    console.error(
      "Get chat messages error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};
// ==================================================
// DELETE CHAT
// DELETE /chat/delete/:chatId
// ==================================================

module.exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // -----------------------------------------------
    // Find chat + verify participant
    // -----------------------------------------------

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    // -----------------------------------------------
    // Delete messages
    // -----------------------------------------------

    await Message.deleteMany({
      chatId: chat._id,
    });

    // -----------------------------------------------
    // Delete chat
    // -----------------------------------------------

    await Chat.deleteOne({
      _id: chat._id,
    });

    return res.status(200).json({
      message: "Chat deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete chat error:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete chat",
    });
  }
};
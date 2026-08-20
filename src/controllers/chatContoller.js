const { Chat } = require("../models/chat");
const User = require("../models/user");

module.exports.getChatList = async (req, res) => {
  const userId = req.user._id;

  try {
    // --------------------------------
    // 1. Get existing chats
    // --------------------------------

    const chats = await Chat.find({
      participants: userId,
      messages: {
        $exists: true,
        $not: { $size: 0 },
      },
    }).populate({
      path: "participants",
      select: "firstName lastName photoUrl",
    });

    // --------------------------------
    // 2. Build chat list
    // --------------------------------

    const chatList = chats
      .map((chat) => {
        const otherParticipant = chat.participants.find(
          (p) => p._id.toString() !== userId.toString()
        );

        if (!otherParticipant) return null;

        const lastMessage =
          chat.messages[chat.messages.length - 1];

        return {
          chatId: chat._id,
          userId: otherParticipant._id,
          firstName: otherParticipant.firstName,
          lastName: otherParticipant.lastName,
          photoUrl: otherParticipant.photoUrl,

          lastMessage: {
            text: lastMessage.text,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt,
            delivered: lastMessage.delivered,
            seen: lastMessage.seen,
          },
        };
      })
      .filter(Boolean);

    // --------------------------------
    // 3. Sort chat list
    // --------------------------------

    chatList.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) -
        new Date(a.lastMessage.createdAt)
    );

    // --------------------------------
    // 4. Get IDs of people already
    //    present in chat list
    // --------------------------------

    const chattedUserIds = chatList.map(
      (chat) => chat.userId
    );

    // --------------------------------
    // 5. Find 5 suggested users
    // --------------------------------

    const suggestedUsers = await User.find({
      _id: {
        $nin: [
          userId,
          ...chattedUserIds,
        ],
      },
    })
      .select(
        "firstName lastName photoUrl age skills interests experience about profileScore"
      )
      .sort({
        lastActive: -1,
        profileScore: -1,
      })
      .limit(5);

    // --------------------------------
    // 6. Return both
    // --------------------------------

    res.json({
      message: "Chat list fetched successfully",
      data: chatList,
      suggestions: suggestedUsers,
    });

  } catch (err) {
    console.error(
      "Error fetching chat list: ",
      err
    );

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
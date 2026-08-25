const { Chat } = require("../models/chat");

module.exports.getChatList= async (req, res) => {
  const userId = req.user._id;

  try {
    const chats = await Chat.find({
      participants: userId,
      messages: { $exists: true, $not: { $size: 0 } },
    }).populate({
      path: "participants",
      select: "firstName lastName photoUrl",
    });

    const chatList = chats
      .map((chat) => {
        const otherParticipant = chat.participants.find(
          (p) => p._id.toString() !== userId.toString()
        );

        if (!otherParticipant) return null;

        const lastMessage = chat.messages[chat.messages.length - 1];

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
      .filter((item) => item !== null);

    chatList.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.json({
      message: "Chatted users list fetched successfully",
      data: chatList,
    });
  } catch (err) {
    console.error("Error fetching chat list: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports.deleteChat = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      participants: {
        $all: [userId, otherUserId],
      },
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    // Extra security check
    const isParticipant = chat.participants.some(
      (participantId) =>
        participantId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not a participant in this chat",
      });
    }

    await Chat.deleteOne({
      _id: chat._id,
    });

    return res.status(200).json({
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Delete chat error:", error);

    return res.status(500).json({
      message: "Failed to delete chat",
    });
  }
};
const { Chat } = require("../models/chat");
const { Message } = require("../models/message");
const User = require("../models/user");


// --------------------------------------------------
// Find or create chat
// --------------------------------------------------

const findOrCreateChat = async (userId, otherUserId) => {
    let chat = await Chat.findOne({
        participants: {
            $all: [userId, otherUserId],
        },
    });

    if (!chat) {
        chat = await Chat.create({
            participants: [
                userId,
                otherUserId,
            ],
        });
    }

    return chat;
};


// --------------------------------------------------
// Create message + update chat preview
// --------------------------------------------------

const createMessage = async ({
    chatId,
    senderId,
    recipientId,
    text,
}) => {
    const message = await Message.create({
        chatId,
        senderId,
        recipientId,
        text: text.trim(),
    });

    const updatedChat = await Chat.updateOne(
        {
            _id: chatId,
        },
        {
            $set: {
                lastMessage: {
                    text: message.text,
                    senderId: message.senderId,
                    createdAt: message.createdAt,
                    delivered: false,
                    seen: false,
                },

                lastMessageAt: message.createdAt,
            },
            $inc: {
                [`unreadCounts.${recipientId}`]: 1,
            },
        },
        { new: true }
    );

    return {
        message,
        // Map fields come back as a Map instance from Mongoose —
        // .get() is the correct way to read a dynamic key.
        unreadCount: updatedChat.unreadCounts?.get(recipientId.toString()) ?? 0,
    };
};


// --------------------------------------------------
// Mark message delivered
// --------------------------------------------------

const markMessageDelivered = async (messageId) => {
    const message =
        await Message.findOneAndUpdate(
            {
                _id: messageId,
                delivered: false,
            },
            {
                $set: {
                    delivered: true,
                },
            },
            {
                new: true,
            }
        );

    if (!message) {
        return null;
    }

    await Chat.updateOne(
        {
            _id: message.chatId,

            "lastMessage.senderId":
                message.senderId,

            "lastMessage.createdAt":
                message.createdAt,
        },
        {
            $set: {
                "lastMessage.delivered":
                    true,
            },
        }
    );

    return message;
};


// --------------------------------------------------
// Mark messages seen
// --------------------------------------------------

const markMessagesSeen = async ({ chatId, userId }) => {
    await Message.updateMany(
        { chatId, senderId: { $ne: userId }, seen: false },
        { $set: { seen: true } }
    );

    // Reset MY OWN unread counter for this chat to 0
    await Chat.updateOne(
        { _id: chatId },
        {
            $set: {
                "lastMessage.seen": true,
                [`unreadCounts.${userId}`]: 0,
            },
        }
    );
};

const getUserProfile = async (userId) => {
    return User.findById(userId)
        .select("firstName lastName photoUrl")
        .lean();
};

module.exports = {
    findOrCreateChat,
    createMessage,
    markMessageDelivered,
    markMessagesSeen,
    getUserProfile
};
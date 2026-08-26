const {
    getChatRoomId,
    getUserRoomId,
} = require("../utils/chatRoom");

const {
    findOrCreateChat,
    createMessage,
    markMessageDelivered,
    markMessagesSeen,
    getUserProfile,
} = require("../../services/chatServices");

const sendPushNotification = require("../../utility/pushNotifications");

const {
    createNotification,
} = require("../../services/notificationService");


const registerChatHandlers = (io, socket) => {

    // ==================================================
    // REGISTER USER
    // ==================================================

    socket.on("register-user", ({ userId }) => {
        if (!userId) return;

        socket.userId = userId;

        socket.join(
            getUserRoomId(userId)
        );

        console.log(
            `User ${userId} registered`
        );
    });


    // ==================================================
    // JOIN CHAT
    // ==================================================

    socket.on(
        "join-chat",
        ({ userId, otherUserId }) => {

            if (!userId || !otherUserId) {
                return;
            }

            const roomId =
                getChatRoomId(
                    userId,
                    otherUserId
                );

            socket.join(roomId);

            console.log(
                `Joined chat ${roomId}`
            );
        }
    );


    // ==================================================
    // LEAVE CHAT
    // ==================================================

    socket.on(
        "leave-chat",
        ({ userId, otherUserId }) => {

            if (!userId || !otherUserId) {
                return;
            }

            const roomId =
                getChatRoomId(
                    userId,
                    otherUserId
                );

            socket.leave(roomId);
        }
    );


    // ==================================================
    // SEND MESSAGE
    // ==================================================

    socket.on(
        "send-message",
        async ({
            userId,
            otherUserId,
            firstName,
            lastName,
            photoUrl,
            text,
        }) => {
            console.log("Message received");

            try {

                if (
                    !userId ||
                    !otherUserId ||
                    !text?.trim()
                ) {
                    console.log(
                        "Invalid message"
                    );
                    throw new Error(
                        "Invalid message"
                    );
                }


                // --------------------------------------------
                // Find/create chat
                // (now returns populated participants —
                // see chatServices.js update below)
                // --------------------------------------------

                const chat =
                    await findOrCreateChat(
                        userId,
                        otherUserId
                    );


                // --------------------------------------------
                // Create message
                // --------------------------------------------

                const message =
                    await createMessage({
                        chatId: chat._id,
                        senderId: userId,
                        text,
                    });


                // --------------------------------------------
                // Send message to chat
                // --------------------------------------------

                const chatRoom =
                    getChatRoomId(
                        userId,
                        otherUserId
                    );

                io.to(chatRoom).emit("messageReceived", {
                    _id: message._id,
                    chatId: chat._id,
                    senderId: userId,
                    firstName,
                    lastName,
                    photoUrl,
                    text: message.text,
                    createdAt: message.createdAt,
                    delivered: message.delivered,
                    seen: message.seen,
                });
                console.log("Message emitted!");

                // --------------------------------------------
                // Fetch the OTHER participant's profile directly
                // (no longer dependent on chat.participants being
                // populated correctly)
                // --------------------------------------------

                const otherProfile = await getUserProfile(otherUserId);

                if (!otherProfile) {
                    console.warn(
                        `Could not find profile for otherUserId ${otherUserId}`
                    );
                }

                // --------------------------------------------
                // Update recipient chat list (sender's info)
                // --------------------------------------------

                io.to(getUserRoomId(otherUserId)).emit("chatUpdated", {
                    chatId: chat._id,
                    userId,
                    firstName,
                    lastName,
                    photoUrl,
                    lastMessage: {
                        text: message.text,
                        senderId: userId,
                        createdAt: message.createdAt,
                        delivered: false,
                        seen: false,
                    },
                    lastMessageAt: message.createdAt,
                });

                // --------------------------------------------
                // Update sender chat list (recipient's info)
                // --------------------------------------------

                io.to(getUserRoomId(userId)).emit("chatUpdated", {
                    chatId: chat._id,
                    userId: otherUserId,
                    firstName: otherProfile?.firstName ?? "",
                    lastName: otherProfile?.lastName ?? "",
                    photoUrl: otherProfile?.photoUrl ?? null,
                    lastMessage: {
                        text: message.text,
                        senderId: userId,
                        createdAt: message.createdAt,
                        delivered: false,
                        seen: false,
                    },
                    lastMessageAt: message.createdAt,
                });
                // --------------------------------------------
                // In-app notification
                // --------------------------------------------

                createNotification({
                    recipientId: otherUserId,

                    type: "CHAT_MESSAGE",

                    senderId: userId,

                    title:
                        `${firstName} ${lastName}`,

                    body: message.text,

                    photoUrl,

                    data: {
                        chatId:
                            chat._id.toString(),
                    },
                }).catch((error) => {
                    console.error(
                        "Notification error:",
                        error
                    );
                });


                // --------------------------------------------
                // Push notification
                // --------------------------------------------

                sendPushNotification(
                    otherUserId,
                    {
                        title:
                            `${firstName} ${lastName}`,

                        body: message.text,

                        data: {
                            type: "CHAT_MESSAGE",

                            senderId:
                                userId.toString(),

                            chatId:
                                chat._id.toString(),
                        },
                    }
                ).catch((error) => {
                    console.error(
                        "Push notification error:",
                        error
                    );
                });

            } catch (error) {

                console.error(
                    "Send message error:",
                    error
                );

            }

        }
    );


    // ==================================================
    // MESSAGE DELIVERED
    // ==================================================

    socket.on(
        "message-delivered",
        async ({
            messageId,
            userId,
            otherUserId,
        }) => {

            try {

                const message =
                    await markMessageDelivered(
                        messageId
                    );

                if (!message) {
                    return;
                }


                const roomId =
                    getChatRoomId(
                        userId,
                        otherUserId
                    );


                io.to(roomId).emit(
                    "messageDelivered",
                    {
                        messageId,
                        chatId:
                            message.chatId,
                    }
                );

            } catch (error) {

                console.error(
                    "Message delivered error:",
                    error
                );

            }

        }
    );


    // ==================================================
    // MARK AS SEEN
    // ==================================================

    socket.on(
        "mark-as-seen",
        async ({
            userId,
            otherUserId,
            chatId,
        }) => {

            try {

                await markMessagesSeen({
                    chatId,
                    userId,
                });


                const roomId =
                    getChatRoomId(
                        userId,
                        otherUserId
                    );


                io.to(roomId).emit(
                    "messagesSeen",
                    {
                        chatId,

                        seenBy:
                            userId,
                    }
                );

            } catch (error) {

                console.error(
                    "Mark seen error:",
                    error
                );

            }

        }
    );
};


module.exports = registerChatHandlers;
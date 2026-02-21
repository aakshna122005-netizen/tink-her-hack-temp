const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const onlineUsers = new Map(); // userId -> socketId

function setupChatHandlers(io) {
    // Auth middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.userId;
        onlineUsers.set(userId, socket.id);

        console.log(`User connected: ${userId}`);

        // Broadcast online status
        io.emit('user_online', { userId });

        // Send message
        socket.on('send_message', async (data) => {
            try {
                const { receiverId, content } = data;

                const message = await prisma.message.create({
                    data: {
                        senderId: userId,
                        receiverId,
                        content,
                    },
                    include: {
                        sender: { select: { id: true, name: true, avatar: true } },
                        receiver: { select: { id: true, name: true, avatar: true } },
                    },
                });

                // Send to receiver if online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', message);
                }

                // Send confirmation back to sender
                socket.emit('message_sent', message);

                // Create notification
                await prisma.notification.create({
                    data: {
                        userId: receiverId,
                        type: 'NEW_MESSAGE',
                        title: 'New Message',
                        message: `${message.sender.name} sent you a message`,
                        link: '/messages',
                    },
                });

                // Emit notification
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('new_notification', {
                        type: 'NEW_MESSAGE',
                        title: 'New Message',
                        message: `${message.sender.name} sent you a message`,
                    });
                }
            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { receiverId } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_typing', { userId });
            }
        });

        socket.on('stop_typing', (data) => {
            const { receiverId } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_stop_typing', { userId });
            }
        });

        // Mark messages as read
        socket.on('mark_read', async (data) => {
            try {
                const { senderId } = data;
                await prisma.message.updateMany({
                    where: { senderId, receiverId: userId, read: false },
                    data: { read: true },
                });

                const senderSocketId = onlineUsers.get(senderId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('messages_read', { readBy: userId });
                }
            } catch (error) {
                console.error('Mark read error:', error);
            }
        });

        // Get online users
        socket.on('get_online_users', () => {
            socket.emit('online_users', Array.from(onlineUsers.keys()));
        });

        // Disconnect
        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            io.emit('user_offline', { userId });
            console.log(`User disconnected: ${userId}`);
        });
    });
}

module.exports = { setupChatHandlers };

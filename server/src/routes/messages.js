const router = require('express').Router();
const prisma = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/messages/threads — Get all message threads for a user
router.get('/threads', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get distinct conversation partners
        const sentTo = await prisma.message.findMany({
            where: { senderId: userId },
            select: { receiverId: true },
            distinct: ['receiverId'],
        });

        const receivedFrom = await prisma.message.findMany({
            where: { receiverId: userId },
            select: { senderId: true },
            distinct: ['senderId'],
        });

        const partnerIds = [
            ...new Set([
                ...sentTo.map((m) => m.receiverId),
                ...receivedFrom.map((m) => m.senderId),
            ]),
        ];

        const threads = await Promise.all(
            partnerIds.map(async (partnerId) => {
                const partner = await prisma.user.findUnique({
                    where: { id: partnerId },
                    select: { id: true, name: true, avatar: true, role: true },
                });

                const lastMessage = await prisma.message.findFirst({
                    where: {
                        OR: [
                            { senderId: userId, receiverId: partnerId },
                            { senderId: partnerId, receiverId: userId },
                        ],
                    },
                    orderBy: { createdAt: 'desc' },
                });

                const unreadCount = await prisma.message.count({
                    where: { senderId: partnerId, receiverId: userId, read: false },
                });

                return { partner, lastMessage, unreadCount };
            })
        );

        // Sort by last message time
        threads.sort((a, b) => new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt));

        res.json({ threads });
    } catch (error) {
        console.error('Threads error:', error);
        res.status(500).json({ error: 'Failed to fetch threads' });
    }
});

// GET /api/messages/:userId — Get messages with a specific user
router.get('/:userId', auth, async (req, res) => {
    try {
        const partnerId = req.params.userId;
        const userId = req.user.id;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                receiver: { select: { id: true, name: true, avatar: true } },
            },
        });

        // Mark received messages as read
        await prisma.message.updateMany({
            where: { senderId: partnerId, receiverId: userId, read: false },
            data: { read: true },
        });

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /api/messages — Send a message (fallback for non-socket)
router.post('/', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Receiver and content required' });
        }

        const message = await prisma.message.create({
            data: {
                senderId: req.user.id,
                receiverId,
                content,
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                receiver: { select: { id: true, name: true, avatar: true } },
            },
        });

        // Create notification
        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: 'NEW_MESSAGE',
                title: 'New Message',
                message: `${req.user.name} sent you a message`,
                link: `/messages`,
            },
        });

        res.status(201).json({ message });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;

const router = require('express').Router();
const prisma = require('../config/db');
const auth = require('../middleware/auth');
const { adminCheck } = require('../middleware/roleCheck');

// GET /api/admin/stats
router.get('/stats', auth, adminCheck, async (req, res) => {
    try {
        const [totalUsers, founders, jobSeekers, investors, pendingScreening, totalJobs, totalApplications] =
            await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { role: 'FOUNDER' } }),
                prisma.user.count({ where: { role: 'JOB_SEEKER' } }),
                prisma.user.count({ where: { role: 'INVESTOR' } }),
                prisma.startup.count({ where: { screeningStatus: 'PENDING' } }),
                prisma.job.count(),
                prisma.application.count(),
            ]);

        res.json({
            stats: {
                totalUsers,
                founders,
                jobSeekers,
                investors,
                pendingScreening,
                totalJobs,
                totalApplications,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/admin/users
router.get('/users', auth, adminCheck, async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (role) where.role = role;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true, email: true, name: true, role: true, avatar: true,
                    isAdmin: true, onboarded: true, createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.user.count({ where }),
        ]);

        res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/admin/screening — Get startups pending review
router.get('/screening', auth, adminCheck, async (req, res) => {
    try {
        const { status = 'PENDING' } = req.query;

        const startups = await prisma.startup.findMany({
            where: { screeningStatus: status },
            include: {
                founder: { include: { user: { select: { name: true, email: true, avatar: true } } } },
            },
            orderBy: { submittedAt: 'desc' },
        });

        res.json({ startups });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch screening queue' });
    }
});

// PUT /api/admin/screening/:id — Approve/reject a startup
router.put('/screening/:id', auth, adminCheck, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
        }

        const startup = await prisma.startup.update({
            where: { id: req.params.id },
            data: { screeningStatus: status },
            include: { founder: { include: { user: true } } },
        });

        // Notify the founder
        await prisma.notification.create({
            data: {
                userId: startup.founder.userId,
                type: 'SCREENING_RESULT',
                title: `Startup ${status.toLowerCase()}`,
                message: `Your startup "${startup.name}" has been ${status.toLowerCase()} by our review team.`,
                link: `/ideahub`,
            },
        });

        res.json({ startup });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update screening status' });
    }
});

// DELETE /api/admin/users/:id — Remove a user
router.delete('/users/:id', auth, adminCheck, async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;

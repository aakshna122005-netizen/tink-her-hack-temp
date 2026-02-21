const router = require('express').Router();
const prisma = require('../config/db');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { scoreStartup, getRecommendations } = require('../services/llmService');

// POST /api/ideahub — Submit startup to Idea Hub (founders only)
router.post('/', auth, roleCheck('FOUNDER'), async (req, res) => {
    try {
        const { name, sector, stage, problem, solution, traction, marketSize, fundingAsk } = req.body;

        if (!req.user.founderProfile) {
            return res.status(400).json({ error: 'Complete your founder profile first' });
        }

        // Check if already submitted
        const existing = await prisma.startup.findUnique({
            where: { founderId: req.user.founderProfile.id },
        });
        if (existing) {
            return res.status(400).json({ error: 'You already submitted a startup. Edit it instead.' });
        }

        const startup = await prisma.startup.create({
            data: {
                founderId: req.user.founderProfile.id,
                name,
                sector,
                stage,
                problem,
                solution,
                traction,
                marketSize,
                fundingAsk: parseFloat(fundingAsk),
            },
        });

        // Trigger LLM scoring (async, don't block response)
        scoreStartup(startup).catch((err) => console.error('LLM scoring failed:', err));

        res.status(201).json({ startup });
    } catch (error) {
        console.error('Submit to Idea Hub error:', error);
        res.status(500).json({ error: 'Failed to submit to Idea Hub' });
    }
});

// GET /api/ideahub — Browse all startups in the Idea Hub
router.get('/', async (req, res) => {
    try {
        const { search, sector, stage, page = 1, limit = 12 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { problem: { contains: search, mode: 'insensitive' } },
                { solution: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (sector) where.sector = { contains: sector, mode: 'insensitive' };
        if (stage) where.stage = stage;

        const [startups, total] = await Promise.all([
            prisma.startup.findMany({
                where,
                include: {
                    founder: { include: { user: { select: { id: true, name: true, avatar: true } } } },
                },
                orderBy: { submittedAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.startup.count({ where }),
        ]);

        res.json({ startups, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch startups' });
    }
});

// GET /api/ideahub/recommended — AI-curated feed for investors
router.get('/recommended', auth, roleCheck('INVESTOR'), async (req, res) => {
    try {
        if (!req.user.investorProfile) {
            return res.json({ startups: [] });
        }

        // Only show approved startups that match investor's criteria
        const startups = await prisma.startup.findMany({
            where: { screeningStatus: 'APPROVED' },
            include: {
                founder: { include: { user: { select: { id: true, name: true, avatar: true } } } },
            },
            orderBy: { llmScore: 'desc' },
        });

        // Use LLM to rank for this investor
        let recommended = startups;
        try {
            recommended = await getRecommendations(req.user.investorProfile, startups);
        } catch (err) {
            console.error('LLM recommendation error:', err);
        }

        res.json({ startups: recommended });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// GET /api/ideahub/:id — Startup detail
router.get('/:id', async (req, res) => {
    try {
        const startup = await prisma.startup.findUnique({
            where: { id: req.params.id },
            include: {
                founder: { include: { user: { select: { id: true, name: true, avatar: true } } } },
            },
        });

        if (!startup) return res.status(404).json({ error: 'Startup not found' });
        res.json({ startup });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch startup' });
    }
});

// PUT /api/ideahub/:id — Update startup submission
router.put('/:id', auth, roleCheck('FOUNDER'), async (req, res) => {
    try {
        const startup = await prisma.startup.findUnique({ where: { id: req.params.id } });
        if (!startup || startup.founderId !== req.user.founderProfile?.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updated = await prisma.startup.update({
            where: { id: req.params.id },
            data: {
                ...req.body,
                fundingAsk: req.body.fundingAsk ? parseFloat(req.body.fundingAsk) : undefined,
                screeningStatus: 'PENDING', // Reset screening on edit
            },
        });

        // Re-score with LLM
        scoreStartup(updated).catch((err) => console.error('LLM re-scoring failed:', err));

        res.json({ startup: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update startup' });
    }
});

module.exports = router;

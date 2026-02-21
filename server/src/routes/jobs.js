const router = require('express').Router();
const prisma = require('../config/db');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// POST /api/jobs — Create a job listing (founders only)
router.post('/', auth, roleCheck('FOUNDER'), async (req, res) => {
    try {
        const { title, description, skills, type, salaryMin, salaryMax, equity, remote, location } = req.body;

        if (!req.user.founderProfile) {
            return res.status(400).json({ error: 'Complete your founder profile first' });
        }

        const job = await prisma.job.create({
            data: {
                founderId: req.user.founderProfile.id,
                title,
                description,
                skills: skills || [],
                type: type || 'FULL_TIME',
                salaryMin: salaryMin ? parseFloat(salaryMin) : null,
                salaryMax: salaryMax ? parseFloat(salaryMax) : null,
                equity,
                remote: remote || false,
                location,
            },
            include: { founder: { include: { user: { select: { id: true, name: true, avatar: true } } } } },
        });

        res.status(201).json({ job });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
});

// GET /api/jobs — Browse all active job listings with filters
router.get('/', async (req, res) => {
    try {
        const { search, sector, type, remote, minSalary, maxSalary, page = 1, limit = 12 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { active: true };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (type) where.type = type;
        if (remote === 'true') where.remote = true;
        if (minSalary) where.salaryMin = { gte: parseFloat(minSalary) };
        if (maxSalary) where.salaryMax = { lte: parseFloat(maxSalary) };
        if (sector) {
            where.founder = { sector: { contains: sector, mode: 'insensitive' } };
        }

        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                include: {
                    founder: { include: { user: { select: { id: true, name: true, avatar: true } } } },
                    _count: { select: { applications: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.job.count({ where }),
        ]);

        res.json({ jobs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('Fetch jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// GET /api/jobs/my — Get founder's own job listings
router.get('/my', auth, roleCheck('FOUNDER'), async (req, res) => {
    try {
        if (!req.user.founderProfile) {
            return res.json({ jobs: [] });
        }

        const jobs = await prisma.job.findMany({
            where: { founderId: req.user.founderProfile.id },
            include: { _count: { select: { applications: true } } },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ jobs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your jobs' });
    }
});

// GET /api/jobs/:id — Get job detail
router.get('/:id', async (req, res) => {
    try {
        const job = await prisma.job.findUnique({
            where: { id: req.params.id },
            include: {
                founder: { include: { user: { select: { id: true, name: true, avatar: true } } } },
                _count: { select: { applications: true } },
            },
        });

        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json({ job });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});

// PUT /api/jobs/:id — Update job listing
router.put('/:id', auth, roleCheck('FOUNDER'), async (req, res) => {
    try {
        const job = await prisma.job.findUnique({ where: { id: req.params.id } });
        if (!job || job.founderId !== req.user.founderProfile?.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updated = await prisma.job.update({
            where: { id: req.params.id },
            data: req.body,
        });

        res.json({ job: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// DELETE /api/jobs/:id
router.delete('/:id', auth, roleCheck('FOUNDER'), async (req, res) => {
    try {
        const job = await prisma.job.findUnique({ where: { id: req.params.id } });
        if (!job || job.founderId !== req.user.founderProfile?.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await prisma.job.delete({ where: { id: req.params.id } });
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

module.exports = router;

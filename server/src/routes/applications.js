const router = require('express').Router();
const prisma = require('../config/db');
const auth = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const upload = require('../middleware/upload');

// POST /api/applications — Apply to a job
router.post('/', auth, roleCheck('JOB_SEEKER'), upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'idProof', maxCount: 1 }
]), async (req, res) => {
    try {
        const { jobId, coverNote, fullName, dob, contactNumber, email, experience } = req.body;

        if (!req.user.jobSeekerProfile) {
            return res.status(400).json({ error: 'Complete your profile first' });
        }

        // Check if already applied
        const existing = await prisma.application.findFirst({
            where: { jobId, seekerId: req.user.jobSeekerProfile.id },
        });
        if (existing) {
            return res.status(400).json({ error: 'Already applied to this job' });
        }

        const resumeUrl = req.files['resume'] ? `/uploads/${req.files['resume'][0].filename}` : null;
        const idProofUrl = req.files['idProof'] ? `/uploads/${req.files['idProof'][0].filename}` : null;

        const application = await prisma.application.create({
            data: {
                jobId,
                seekerId: req.user.jobSeekerProfile.id,
                coverNote,
                fullName,
                dob: dob ? new Date(dob) : null,
                contactNumber,
                email,
                experience,
                resumeUrl,
                idProofUrl,
            },
            include: {
                job: { include: { founder: { include: { user: true } } } },
                seeker: { include: { user: true } },
            },
        });

        // Create notification for founder
        await prisma.notification.create({
            data: {
                userId: application.job.founder.userId,
                type: 'JOB_APPLICATION',
                title: 'New Job Application',
                message: `${fullName || req.user.name} applied for ${application.job.title}`,
                link: `/dashboard/founder`,
            },
        });

        res.status(201).json({ application });
    } catch (error) {
        console.error('Apply error:', error);
        res.status(500).json({ error: 'Failed to apply' });
    }
});

// GET /api/applications/my — Get job seeker's applications
router.get('/my', auth, roleCheck('JOB_SEEKER'), async (req, res) => {
    try {
        if (!req.user.jobSeekerProfile) {
            return res.json({ applications: [] });
        }

        const applications = await prisma.application.findMany({
            where: { seekerId: req.user.jobSeekerProfile.id },
            include: {
                job: { include: { founder: { include: { user: { select: { id: true, name: true, avatar: true } } } } } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ applications });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// GET /api/applications/job/:jobId — Get applications for a job (founder)
router.get('/job/:jobId', auth, roleCheck('FOUNDER'), async (req, res) => {
    try {
        const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
        if (!job || job.founderId !== req.user.founderProfile?.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const applications = await prisma.application.findMany({
            where: { jobId: req.params.jobId },
            include: {
                seeker: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ applications });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// PUT /api/applications/:id/status — Update application status (founder)
router.put('/:id/status', auth, roleCheck('FOUNDER'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['PENDING', 'VIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const application = await prisma.application.findUnique({
            where: { id: req.params.id },
            include: { job: true, seeker: true },
        });

        if (!application || application.job.founderId !== req.user.founderProfile?.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updated = await prisma.application.update({
            where: { id: req.params.id },
            data: { status },
            include: { job: true, seeker: { include: { user: true } } },
        });

        // Notify the job seeker
        await prisma.notification.create({
            data: {
                userId: updated.seeker.userId,
                type: 'APP_STATUS',
                title: 'Application Update',
                message: `Your application for "${updated.job.title}" was ${status.toLowerCase()}`,
                link: `/dashboard/jobseeker`,
            },
        });

        res.json({ application: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

module.exports = router;

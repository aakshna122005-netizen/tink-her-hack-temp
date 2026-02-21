const router = require('express').Router();
const prisma = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                founderProfile: true,
                jobSeekerProfile: true,
                investorProfile: true,
            },
        });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/users/profile/founder
router.put('/profile/founder', auth, async (req, res) => {
    try {
        const { startupName, sector, stage, description, teamSize, fundingRaised, website } = req.body;

        const profile = await prisma.founderProfile.upsert({
            where: { userId: req.user.id },
            update: { startupName, sector, stage, description, teamSize: parseInt(teamSize), fundingRaised: parseFloat(fundingRaised) || 0, website },
            create: {
                userId: req.user.id,
                startupName,
                sector,
                stage,
                description,
                teamSize: parseInt(teamSize) || 1,
                fundingRaised: parseFloat(fundingRaised) || 0,
                website,
            },
        });

        await prisma.user.update({
            where: { id: req.user.id },
            data: { onboarded: true },
        });

        res.json({ profile });
    } catch (error) {
        console.error('Founder profile error:', error);
        res.status(500).json({ error: 'Failed to update founder profile' });
    }
});

// PUT /api/users/profile/jobseeker
router.put('/profile/jobseeker', auth, async (req, res) => {
    try {
        const { headline, skills, experience, resumeUrl, preferredRoles, bio } = req.body;

        const profile = await prisma.jobSeekerProfile.upsert({
            where: { userId: req.user.id },
            update: { headline, skills, experience, resumeUrl, preferredRoles, bio },
            create: {
                userId: req.user.id,
                headline,
                skills: skills || [],
                experience,
                resumeUrl,
                preferredRoles: preferredRoles || [],
                bio,
            },
        });

        await prisma.user.update({
            where: { id: req.user.id },
            data: { onboarded: true },
        });

        res.json({ profile });
    } catch (error) {
        console.error('JobSeeker profile error:', error);
        res.status(500).json({ error: 'Failed to update job seeker profile' });
    }
});

// PUT /api/users/profile/investor
router.put('/profile/investor', auth, async (req, res) => {
    try {
        const { firmName, investmentThesis, preferredSectors, ticketSizeMin, ticketSizeMax, bio, portfolio } = req.body;

        const profile = await prisma.investorProfile.upsert({
            where: { userId: req.user.id },
            update: {
                firmName,
                investmentThesis,
                preferredSectors,
                ticketSizeMin: parseFloat(ticketSizeMin) || 0,
                ticketSizeMax: parseFloat(ticketSizeMax) || 0,
                bio,
                portfolio,
            },
            create: {
                userId: req.user.id,
                firmName,
                investmentThesis,
                preferredSectors: preferredSectors || [],
                ticketSizeMin: parseFloat(ticketSizeMin) || 0,
                ticketSizeMax: parseFloat(ticketSizeMax) || 0,
                bio,
                portfolio,
            },
        });

        await prisma.user.update({
            where: { id: req.user.id },
            data: { onboarded: true },
        });

        res.json({ profile });
    } catch (error) {
        console.error('Investor profile error:', error);
        res.status(500).json({ error: 'Failed to update investor profile' });
    }
});

// GET /api/users/:id (public profile)
router.get('/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                founderProfile: true,
                jobSeekerProfile: true,
                investorProfile: true,
            },
        });

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

module.exports = router;

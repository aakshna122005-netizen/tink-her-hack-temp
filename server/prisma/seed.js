const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@pitchbridge.com' },
        update: {},
        create: {
            email: 'admin@pitchbridge.com',
            password: adminPassword,
            name: 'Admin',
            role: 'FOUNDER',
            isAdmin: true,
            onboarded: true,
        },
    });
    console.log('✅ Admin user created: admin@pitchbridge.com / admin123');

    // Create sample Founder
    const founderPassword = await bcrypt.hash('password123', 12);
    const founderUser = await prisma.user.upsert({
        where: { email: 'founder@example.com' },
        update: {},
        create: {
            email: 'founder@example.com',
            password: founderPassword,
            name: 'Sarah Chen',
            role: 'FOUNDER',
            onboarded: true,
        },
    });

    const founderProfile = await prisma.founderProfile.upsert({
        where: { userId: founderUser.id },
        update: {},
        create: {
            userId: founderUser.id,
            startupName: 'NeuralPay',
            sector: 'FinTech',
            stage: 'seed',
            description: 'AI-powered payment infrastructure for emerging markets',
            teamSize: 8,
            fundingRaised: 500000,
            website: 'https://neuralpay.io',
        },
    });

    // Create a Job
    await prisma.job.upsert({
        where: { id: 'seed-job-1' },
        update: {},
        create: {
            id: 'seed-job-1',
            founderId: founderProfile.id,
            title: 'Senior Full-Stack Engineer',
            description: 'Join our growing team to build the next generation of payment infrastructure. You will work on our core API, web dashboard, and integrations with regional payment providers.',
            skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
            type: 'FULL_TIME',
            salaryMin: 80000,
            salaryMax: 120000,
            equity: '0.5-1%',
            remote: true,
        },
    });

    // Create a Startup in Idea Hub
    await prisma.startup.upsert({
        where: { founderId: founderProfile.id },
        update: {},
        create: {
            founderId: founderProfile.id,
            name: 'NeuralPay',
            sector: 'FinTech',
            stage: 'seed',
            problem: 'Over 1.4 billion adults remain unbanked globally, with traditional payment rails being too slow, expensive, and inaccessible for emerging markets.',
            solution: 'NeuralPay provides AI-powered payment infrastructure with real-time fraud detection, multi-currency support, and embedded finance APIs that work on feature phones.',
            traction: '12,000 monthly active users, $2M GMV processed, partnerships with 3 telcos in Nigeria and Kenya',
            marketSize: '$120B TAM in African fintech by 2025',
            fundingAsk: 2000000,
            llmScore: 82,
            llmTags: ['FinTech', 'AI', 'Emerging Markets', 'B2B', 'Infrastructure'],
            llmSummary: 'NeuralPay addresses a massive pain point in emerging market payments with an AI-first approach. Strong traction signals and clear market need.',
            screeningStatus: 'APPROVED',
        },
    });

    // Create sample Investor
    const investorPassword = await bcrypt.hash('password123', 12);
    const investorUser = await prisma.user.upsert({
        where: { email: 'investor@example.com' },
        update: {},
        create: {
            email: 'investor@example.com',
            password: investorPassword,
            name: 'Raj Mehta',
            role: 'INVESTOR',
            onboarded: true,
        },
    });

    await prisma.investorProfile.upsert({
        where: { userId: investorUser.id },
        update: {},
        create: {
            userId: investorUser.id,
            firmName: 'Horizon Ventures',
            investmentThesis: 'We invest in early-stage B2B SaaS and FinTech startups solving financial inclusion problems in emerging markets.',
            preferredSectors: ['FinTech', 'SaaS', 'AI/ML'],
            ticketSizeMin: 500000,
            ticketSizeMax: 3000000,
            bio: 'Former Goldman Sachs MD, now backing the next generation of fintech founders.',
        },
    });
    console.log('✅ Sample Investor: investor@example.com / password123');

    // Create sample Job Seeker
    const seekerPassword = await bcrypt.hash('password123', 12);
    const seekerUser = await prisma.user.upsert({
        where: { email: 'seeker@example.com' },
        update: {},
        create: {
            email: 'seeker@example.com',
            password: seekerPassword,
            name: 'Alex Kim',
            role: 'JOB_SEEKER',
            onboarded: true,
        },
    });

    await prisma.jobSeekerProfile.upsert({
        where: { userId: seekerUser.id },
        update: {},
        create: {
            userId: seekerUser.id,
            headline: 'Full-Stack Developer | 5 years exp | Open to startup roles',
            skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Python'],
            experience: '5 years building web applications at startups and scale-ups.',
            preferredRoles: ['Full-Stack Engineer', 'Frontend Engineer', 'Tech Lead'],
            bio: 'Passionate about building products that matter. Looking for my next adventure at a seed/series-A startup.',
        },
    });
    console.log('✅ Sample Job Seeker: seeker@example.com / password123');
    console.log('✅ Sample Founder: founder@example.com / password123');
    console.log('\n🎉 Seed complete!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());

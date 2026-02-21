const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/db');

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

/**
 * Score a startup using Gemini LLM
 * Stores score, tags, and summary back to the database
 */
async function scoreStartup(startup) {
    if (!genAI) {
        console.log('GEMINI_API_KEY not set — skipping LLM scoring');
        return startup;
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a startup analyst. Analyze this startup and provide:
1. A viability score from 0 to 100
2. Up to 5 relevant tags (e.g., "AI", "B2B", "SaaS", "FinTech", "HealthTech")  
3. A 2-3 sentence summary of the startup's potential

Startup Details:
- Name: ${startup.name}
- Sector: ${startup.sector}
- Stage: ${startup.stage}
- Problem: ${startup.problem}
- Solution: ${startup.solution}
- Traction: ${startup.traction || 'Not specified'}
- Market Size: ${startup.marketSize || 'Not specified'}
- Funding Ask: $${startup.fundingAsk}

Respond in this exact JSON format (no markdown, no code blocks):
{"score": 75, "tags": ["Tag1", "Tag2"], "summary": "Summary text here."}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('LLM did not return valid JSON:', text);
            return startup;
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Update the startup in the database
        const updated = await prisma.startup.update({
            where: { id: startup.id },
            data: {
                llmScore: parsed.score,
                llmTags: parsed.tags || [],
                llmSummary: parsed.summary || '',
            },
        });

        return updated;
    } catch (error) {
        console.error('LLM scoring error:', error);
        return startup;
    }
}

/**
 * Get AI-curated recommendations for an investor
 * Ranks startups based on investor preferences
 */
async function getRecommendations(investorProfile, startups) {
    if (!genAI || startups.length === 0) {
        return startups;
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const startupSummaries = startups.map((s, i) =>
            `${i}: ${s.name} | Sector: ${s.sector} | Stage: ${s.stage} | Ask: $${s.fundingAsk} | Score: ${s.llmScore || 'N/A'} | ${s.llmSummary || s.problem}`
        ).join('\n');

        const prompt = `You are an investment advisor. Rank these startups for an investor with these preferences:
- Preferred Sectors: ${investorProfile.preferredSectors.join(', ') || 'Any'}
- Investment Thesis: ${investorProfile.investmentThesis || 'Not specified'}
- Ticket Size: $${investorProfile.ticketSizeMin} - $${investorProfile.ticketSizeMax}

Startups:
${startupSummaries}

Return ONLY a JSON array of startup indices in order of best match to worst match.
Example: [2, 0, 4, 1, 3]
No explanation, just the array.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (!arrayMatch) return startups;

        const indices = JSON.parse(arrayMatch[0]);
        const ranked = indices
            .filter((i) => i >= 0 && i < startups.length)
            .map((i) => startups[i]);

        // Add any startups not included in ranking
        const rankedIds = new Set(ranked.map((s) => s.id));
        const remaining = startups.filter((s) => !rankedIds.has(s.id));

        return [...ranked, ...remaining];
    } catch (error) {
        console.error('LLM recommendation error:', error);
        return startups;
    }
}

module.exports = { scoreStartup, getRecommendations };

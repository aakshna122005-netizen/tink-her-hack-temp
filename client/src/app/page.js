'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
    const roles = [
        {
            icon: '💼',
            title: 'Job Seekers',
            desc: 'Discover opportunities at the world\'s fastest-growing startups. Connect directly with visionary founders.',
            color: '#3B82F6',
            link: '/auth/register',
            action: 'Apply to Startups'
        },
        {
            icon: '💡',
            title: 'Founders',
            desc: 'Build your dream team and pitch your idea. Find your next co-founder, early employee, or seed investor.',
            color: '#8B5CF6',
            link: '/auth/register',
            action: 'Post & Pitch'
        },
        {
            icon: '📈',
            title: 'Investors',
            desc: 'Get an AI-curated flow of high-potential startups matching your thesis. Discover the next decacorn.',
            color: '#10B981',
            link: '/auth/register',
            action: 'Discover Startups'
        },
    ];

    const stats = [
        { value: '500+', label: 'Startups' },
        { value: '2,000+', label: 'Job Seekers' },
        { value: '150+', label: 'Investors' },
        { value: '$10M+', label: 'Funded' },
    ];

    return (
        <>
            <Navbar />
            <main style={{ position: 'relative', overflowX: 'hidden' }}>
                <div className="hero-glow" />

                {/* Hero Section */}
                <section style={{
                    minHeight: '80vh', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    padding: '100px 24px 60px', position: 'relative', zIndex: 1
                }}>
                    <div className="animate-fade-in" style={{ maxWidth: 900 }}>
                        <h1 style={{
                            fontSize: 'clamp(48px, 8vw, 96px)',
                            fontWeight: 900,
                            lineHeight: 1.1,
                            marginBottom: 32,
                            letterSpacing: '-0.02em'
                        }}>
                            Connect. Build. <span className="gradient-text">Scale.</span>
                        </h1>
                        <p style={{
                            fontSize: 'clamp(16px, 2vw, 20px)',
                            color: '#94A3B8',
                            lineHeight: 1.6,
                            marginBottom: 48,
                            maxWidth: 650,
                            margin: '0 auto 48px'
                        }}>
                            Join the premier platform where startup founders, forward-thinking investors, and ambitious builders meet.
                        </p>
                        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/auth/register">
                                <button className="btn-primary" style={{ padding: '16px 40px', fontSize: 17 }}>
                                    Join Pitchbridge
                                </button>
                            </Link>
                            <Link href="/auth/login">
                                <button className="btn-secondary" style={{ padding: '16px 40px', fontSize: 17 }}>
                                    Sign In
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Roles Section (Matches Reference Layout) */}
                <section style={{ padding: '40px 24px 100px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
                        {roles.map((role, i) => (
                            <div key={i} className="glass-card" style={{
                                padding: '40px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                gap: '16px'
                            }}>
                                <div style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 28,
                                    marginBottom: 8,
                                    border: '1px solid rgba(59, 130, 246, 0.1)'
                                }}>
                                    {role.icon}
                                </div>
                                <h3 style={{ fontSize: 24, fontWeight: 700 }}>{role.title}</h3>
                                <p style={{ color: '#94A3B8', lineHeight: 1.6, fontSize: 15 }}>{role.desc}</p>
                                <Link href={role.link} style={{
                                    color: role.color,
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    marginTop: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}>
                                    {role.action} →
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Data/Stats Section */}
                <section style={{ padding: '60px 24px', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 40,
                        maxWidth: 900, width: '100%', margin: '0 auto'
                    }}>
                        {stats.map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 36, fontWeight: 800 }} className="gradient-text">{s.value}</div>
                                <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer style={{
                    padding: '80px 24px 40px', textAlign: 'center',
                    color: '#475569', fontSize: 14,
                    position: 'relative', zIndex: 1
                }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 40 }}>
                        <p>© 2026 PitchBridge. The ecosystem of intelligence.</p>
                    </div>
                </footer>
            </main>
        </>
    );
}

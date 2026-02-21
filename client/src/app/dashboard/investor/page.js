'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function InvestorDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [recommended, setRecommended] = useState([]);
    const [allStartups, setAllStartups] = useState([]);
    const [tab, setTab] = useState('recommended');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { router.push('/auth/login'); return; }
        if (user.role !== 'INVESTOR') { router.push('/'); return; }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [recRes, allRes] = await Promise.all([
                api.get('/ideahub/recommended').catch(() => ({ data: { startups: [] } })),
                api.get('/ideahub'),
            ]);
            setRecommended(recRes.data.startups || []);
            setAllStartups(allRes.data.startups || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    if (loading) return <><Navbar /><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div></>;

    const startups = tab === 'recommended' ? recommended : allStartups;

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Welcome back, {user?.name} 💰</h1>
                    <p style={{ color: '#94A3B8', fontSize: 14 }}>Discover AI-curated startups matching your investment thesis</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {[
                        { label: 'AI Recommended', value: recommended.length, icon: '🤖', color: '#3B82F6' },
                        { label: 'Total Startups', value: allStartups.length, icon: '🚀', color: '#10B981' },
                        { label: 'Messages', value: '—', icon: '💬', color: '#8B5CF6' },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ fontSize: 28 }}>{stat.icon}</div>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: 12, color: '#94A3B8' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {[{ key: 'recommended', label: '🤖 Recommended for You' }, { key: 'browse', label: '🌐 Browse All' }].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: tab === t.key ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'var(--bg-secondary)',
                            color: tab === t.key ? 'white' : '#94A3B8', fontWeight: 600, fontSize: 14,
                        }}>{t.label}</button>
                    ))}
                    <Link href="/messages" style={{ marginLeft: 'auto' }}><button className="btn-secondary">💬 Messages</button></Link>
                </div>

                {/* Startup Grid */}
                {startups.length === 0 ? (
                    <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>{tab === 'recommended' ? '🤖' : '🔍'}</div>
                        <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{tab === 'recommended' ? 'No AI recommendations yet' : 'No startups in the hub yet'}</h3>
                        <p style={{ color: '#94A3B8', fontSize: 14 }}>{tab === 'recommended' ? 'Recommendations appear after admin review of AI matches' : 'Check back soon for new submissions'}</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                        {startups.map(s => (
                            <div key={s.id} className="glass-card" style={{ padding: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                                    <div>
                                        <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{s.name}</h3>
                                        <p style={{ fontSize: 13, color: '#94A3B8' }}>{s.founder?.user?.name}</p>
                                    </div>
                                    {s.llmScore && (
                                        <div style={{ padding: '4px 12px', borderRadius: 12, background: s.llmScore >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: s.llmScore >= 70 ? '#10B981' : '#F59E0B', fontSize: 12, fontWeight: 700 }}>
                                            {s.llmScore}/100
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                    <span style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: 11 }}>{s.sector}</span>
                                    <span style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontSize: 11 }}>{s.stage}</span>
                                </div>
                                <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, marginBottom: 8 }}><strong style={{ color: '#F8FAFC' }}>Problem:</strong> {s.problem?.slice(0, 100)}...</p>
                                <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12 }}><strong style={{ color: '#F8FAFC' }}>Funding Ask:</strong> <span style={{ color: '#10B981', fontWeight: 600 }}>${s.fundingAsk?.toLocaleString()}</span></p>
                                {s.llmTags?.length > 0 && (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                        {s.llmTags.map((tag, i) => (
                                            <span key={i} style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(148,163,184,0.1)', color: '#94A3B8', fontSize: 10 }}>#{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <Link href={`/ideahub/${s.id}`}><button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px 0', fontSize: 13 }}>View Details</button></Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

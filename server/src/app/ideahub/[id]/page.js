'use client';
import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function StartupDetailPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [startup, setStartup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/ideahub/${id}`).then(({ data }) => setStartup(data.startup)).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <><Navbar /><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div></>;
    if (!startup) return <><Navbar /><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Startup not found</div></>;

    return (
        <><Navbar />
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
                <Link href="/ideahub" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>← Back to Idea Hub</Link>
                <div className="glass-card" style={{ padding: 32, marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{startup.name}</h1>
                            <p style={{ fontSize: 14, color: '#94A3B8' }}>by {startup.founder?.user?.name}</p>
                        </div>
                        {startup.llmScore != null && (
                            <div style={{ textAlign: 'center', padding: '8px 20px', borderRadius: 16, background: startup.llmScore >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: startup.llmScore >= 70 ? '#10B981' : '#F59E0B' }}>
                                <div style={{ fontSize: 24, fontWeight: 800 }}>{startup.llmScore}</div>
                                <div style={{ fontSize: 10, textTransform: 'uppercase' }}>AI Score</div>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                        <span style={{ padding: '4px 14px', borderRadius: 12, background: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: 12, fontWeight: 600 }}>{startup.sector}</span>
                        <span style={{ padding: '4px 14px', borderRadius: 12, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontSize: 12, fontWeight: 600 }}>{startup.stage}</span>
                        <span className={`badge badge-${startup.screeningStatus?.toLowerCase()}`}>{startup.screeningStatus}</span>
                    </div>
                    {startup.llmSummary && <div style={{ padding: 16, borderRadius: 12, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', marginBottom: 24, fontSize: 14, color: '#94A3B8', lineHeight: 1.6 }}>🤖 <strong style={{ color: '#3B82F6' }}>AI Summary:</strong> {startup.llmSummary}</div>}
                    {[
                        { label: 'Problem', value: startup.problem },
                        { label: 'Solution', value: startup.solution },
                        { label: 'Traction', value: startup.traction },
                        { label: 'Market Size', value: startup.marketSize },
                    ].map((field, i) => field.value && (
                        <div key={i} style={{ marginBottom: 20 }}>
                            <h3 style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>{field.label}</h3>
                            <p style={{ color: '#94A3B8', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{field.value}</p>
                        </div>
                    ))}
                    <div style={{ padding: 16, borderRadius: 12, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <span style={{ color: '#94A3B8', fontSize: 14 }}>Funding Ask: </span>
                        <span style={{ fontSize: 24, fontWeight: 800, color: '#10B981' }}>${startup.fundingAsk?.toLocaleString()}</span>
                    </div>
                    {startup.llmTags?.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 20 }}>
                            {startup.llmTags.map((tag, i) => <span key={i} style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(148,163,184,0.1)', color: '#94A3B8', fontSize: 12 }}>#{tag}</span>)}
                        </div>
                    )}
                    {user && startup.founder?.user?.id !== user.id && (
                        <Link href={`/messages?to=${startup.founder?.user?.id}`}>
                            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 0', marginTop: 24 }}>💬 Message Founder</button>
                        </Link>
                    )}
                </div>
            </div></>
    );
}

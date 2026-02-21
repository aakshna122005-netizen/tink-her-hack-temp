'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { IS_DEMO_MODE, DEMO_STARTUPS } from '@/lib/demo-data';

export default function IdeaHubPage() {
    const { user } = useAuth();
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sector, setSector] = useState('');

    useEffect(() => { fetchStartups(); }, []);

    const fetchStartups = async () => {
        setLoading(true);
        if (IS_DEMO_MODE) {
            let results = DEMO_STARTUPS;
            if (search) results = results.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.sector.toLowerCase().includes(search.toLowerCase()));
            if (sector) results = results.filter(s => s.sector === sector);
            setStartups(results);
            setLoading(false);
            return;
        }
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (sector) params.append('sector', sector);
            const { data } = await api.get(`/ideahub?${params}`);
            setStartups(data.startups);
        } catch (err) {
            console.warn('API unavailable, loading demo startups:', err.message);
            setStartups(DEMO_STARTUPS);
        }
        setLoading(false);
    };

    const handleSearch = (e) => { e.preventDefault(); fetchStartups(); };

    return (
        <><Navbar />
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>💡 Idea Hub</h1>
                        <p style={{ color: '#94A3B8', fontSize: 14 }}>Discover innovative startups and breakthrough ideas</p>
                    </div>
                    {user?.role === 'FOUNDER' && <Link href="/ideahub/submit"><button className="btn-primary">📤 Submit Your Startup</button></Link>}
                </div>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <input className="input-field" style={{ flex: 1 }} placeholder="Search startups..." value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="input-field" style={{ width: 160 }} value={sector} onChange={e => setSector(e.target.value)}>
                        <option value="">All Sectors</option>
                        {['AI/ML', 'FinTech', 'HealthTech', 'EdTech', 'SaaS', 'E-Commerce', 'CleanTech', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button type="submit" className="btn-primary" style={{ padding: '12px 20px' }}>Search</button>
                </form>

                {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Loading...</div> : startups.length === 0 ? (
                    <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>💡</div>
                        <p style={{ color: '#94A3B8' }}>No startups found</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                        {startups.map(s => (
                            <div key={s.id} className="glass-card" style={{ padding: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                                    <div>
                                        <h3 style={{ fontWeight: 700, fontSize: 18 }}>{s.name}</h3>
                                        <p style={{ fontSize: 12, color: '#94A3B8' }}>{s.founder?.user?.name}</p>
                                    </div>
                                    {s.llmScore != null && (
                                        <div style={{ padding: '4px 12px', borderRadius: 12, background: s.llmScore >= 70 ? 'rgba(16,185,129,0.15)' : s.llmScore >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)', color: s.llmScore >= 70 ? '#10B981' : s.llmScore >= 40 ? '#F59E0B' : '#F43F5E', fontSize: 12, fontWeight: 700 }}>
                                            Score: {s.llmScore}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                    <span style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: 11 }}>{s.sector}</span>
                                    <span style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontSize: 11 }}>{s.stage}</span>
                                    <span className={`badge badge-${s.screeningStatus?.toLowerCase()}`} style={{ fontSize: 10 }}>{s.screeningStatus}</span>
                                </div>
                                <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, marginBottom: 8 }}><strong style={{ color: '#F8FAFC' }}>Problem:</strong> {s.problem?.slice(0, 80)}...</p>
                                <p style={{ fontSize: 13, color: '#10B981', fontWeight: 600, marginBottom: 12 }}>Funding Ask: ${s.fundingAsk?.toLocaleString()}</p>
                                <Link href={`/ideahub/${s.id}`}><button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px 0', fontSize: 13 }}>View Details</button></Link>
                            </div>
                        ))}
                    </div>
                )}
            </div></>
    );
}

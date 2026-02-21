'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [tab, setTab] = useState('stats');
    const [users, setUsers] = useState([]);
    const [screening, setScreening] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchRole, setSearchRole] = useState('');

    useEffect(() => {
        if (!user) { router.push('/auth/login'); return; }
        if (!user.isAdmin) { router.push('/'); return; }
        fetchAll();
    }, [user]);

    const fetchAll = async () => {
        try {
            const [statsRes, usersRes, screenRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/screening'),
            ]);
            setStats(statsRes.data.stats);
            setUsers(usersRes.data.users);
            setScreening(screenRes.data.startups);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleScreening = async (id, status) => {
        try {
            await api.put(`/admin/screening/${id}`, { status });
            setScreening(prev => prev.filter(s => s.id !== id));
        } catch (err) { alert('Failed to update'); }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) { alert('Failed to delete'); }
    };

    if (loading) return <><Navbar /><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div></>;

    const statCards = stats ? [
        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3B82F6' },
        { label: 'Founders', value: stats.founders, icon: '🚀', color: '#F59E0B' },
        { label: 'Job Seekers', value: stats.jobSeekers, icon: '💼', color: '#10B981' },
        { label: 'Investors', value: stats.investors, icon: '💰', color: '#8B5CF6' },
        { label: 'Pending Review', value: stats.pendingScreening, icon: '🛡️', color: '#F43F5E' },
        { label: 'Total Jobs', value: stats.totalJobs, icon: '📋', color: '#0EA5E9' },
    ] : [];

    const filteredUsers = searchRole ? users.filter(u => u.role === searchRole) : users;

    return (
        <><Navbar />
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>⚡ Admin Panel</h1>
                    <p style={{ color: '#94A3B8', fontSize: 14 }}>Manage users, review AI matches, and moderate content</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                    {[{ key: 'stats', label: '📊 Overview' }, { key: 'screening', label: `🛡️ Screening (${screening.length})` }, { key: 'users', label: '👥 Users' }].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: tab === t.key ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'rgba(30,41,59,0.8)',
                            color: tab === t.key ? 'white' : '#94A3B8', fontWeight: 600, fontSize: 14,
                        }}>{t.label}</button>
                    ))}
                </div>

                {/* Overview Tab */}
                {tab === 'stats' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        {statCards.map((s, i) => (
                            <div key={i} className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
                                <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Screening Tab */}
                {tab === 'screening' && (
                    <>
                        <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#3B82F6' }}>
                            🤖 These startups have been scored by AI. Review and approve or reject before they appear in investor feeds.
                        </div>
                        {screening.length === 0 ? (
                            <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>✅ No pending startups to review</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {screening.map(s => (
                                    <div key={s.id} className="glass-card" style={{ padding: 24 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                                            <div>
                                                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{s.name}</h3>
                                                <p style={{ fontSize: 13, color: '#94A3B8' }}>by {s.founder?.user?.name} ({s.founder?.user?.email})</p>
                                            </div>
                                            {s.llmScore != null && (
                                                <div style={{ padding: '6px 16px', borderRadius: 12, background: s.llmScore >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: s.llmScore >= 70 ? '#10B981' : '#F59E0B', fontWeight: 700, fontSize: 14 }}>
                                                    AI Score: {s.llmScore}/100
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                            <span style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: 11 }}>{s.sector}</span>
                                            <span style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontSize: 11 }}>{s.stage}</span>
                                            <span style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: 11 }}>Ask: ${s.fundingAsk?.toLocaleString()}</span>
                                        </div>
                                        {s.llmSummary && <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8, padding: 10, background: 'rgba(148,163,184,0.05)', borderRadius: 8, lineHeight: 1.5 }}>🤖 {s.llmSummary}</p>}
                                        <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12, lineHeight: 1.5 }}><strong style={{ color: '#F8FAFC' }}>Problem:</strong> {s.problem?.slice(0, 150)}...</p>
                                        {s.llmTags?.length > 0 && (
                                            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                                                {s.llmTags.map((t, i) => <span key={i} style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(148,163,184,0.1)', color: '#94A3B8', fontSize: 11 }}>#{t}</span>)}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button onClick={() => handleScreening(s.id, 'APPROVED')} className="btn-success" style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14 }}>✅ Approve — Release to Investors</button>
                                            <button onClick={() => handleScreening(s.id, 'REJECTED')} className="btn-danger" style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14 }}>✕ Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Users Tab */}
                {tab === 'users' && (
                    <>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                            <select className="input-field" style={{ width: 180 }} value={searchRole} onChange={e => setSearchRole(e.target.value)}>
                                <option value="">All Roles</option>
                                <option value="FOUNDER">Founders</option>
                                <option value="JOB_SEEKER">Job Seekers</option>
                                <option value="INVESTOR">Investors</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {filteredUsers.map(u => (
                                <div key={u.id} className="glass-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{u.name?.[0]}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name} {u.isAdmin && <span style={{ color: '#F59E0B', fontSize: 11 }}>⚡ Admin</span>}</div>
                                        <div style={{ fontSize: 12, color: '#94A3B8' }}>{u.email}</div>
                                    </div>
                                    <span className={`badge badge-${u.role?.toLowerCase().replace('_', '-') || 'pending'}`} style={{ fontSize: 11 }}>{u.role?.replace('_', ' ') || 'No role'}</span>
                                    <span style={{ fontSize: 12, color: '#64748B' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                                    {!u.isAdmin && (
                                        <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F43F5E', fontSize: 18, padding: 4 }}>🗑</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div></>
    );
}

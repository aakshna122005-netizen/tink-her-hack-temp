'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function JobSeekerDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { router.push('/auth/login'); return; }
        if (user.role !== 'JOB_SEEKER') { router.push('/'); return; }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [appsRes, jobsRes] = await Promise.all([
                api.get('/applications/my'),
                api.get('/jobs?limit=6'),
            ]);
            setApplications(appsRes.data.applications || []);
            setRecentJobs(jobsRes.data.jobs || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const statusColor = { PENDING: '#F59E0B', VIEWED: '#3B82F6', SHORTLISTED: '#8B5CF6', REJECTED: '#F43F5E', ACCEPTED: '#10B981' };

    if (loading) return <><Navbar /><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div></>;

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Welcome back, {user?.name} 👋</h1>
                    <p style={{ color: '#94A3B8', fontSize: 14 }}>Find your next opportunity at a startup</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {[
                        { label: 'Applications', value: applications.length, icon: '📋', color: '#3B82F6' },
                        { label: 'Shortlisted', value: applications.filter(a => a.status === 'SHORTLISTED').length, icon: '⭐', color: '#8B5CF6' },
                        { label: 'Accepted', value: applications.filter(a => a.status === 'ACCEPTED').length, icon: '✅', color: '#10B981' },
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

                <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                    <Link href="/jobs"><button className="btn-primary">🔍 Browse All Jobs</button></Link>
                    <Link href="/messages"><button className="btn-secondary">💬 Messages</button></Link>
                </div>

                {/* Applications */}
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Your Applications</h2>
                {applications.length === 0 ? (
                    <div className="glass-card" style={{ padding: 40, textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                        <p style={{ color: '#94A3B8', marginBottom: 16 }}>No applications yet</p>
                        <Link href="/jobs"><button className="btn-primary">Browse Jobs</button></Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
                        {applications.map(app => (
                            <div key={app.id} className="glass-card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{app.job?.title}</h3>
                                    <div style={{ fontSize: 13, color: '#94A3B8' }}>{app.job?.founder?.user?.name} • {new Date(app.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <span className="badge" style={{ background: `${statusColor[app.status]}20`, color: statusColor[app.status] }}>{app.status}</span>
                                    <Link href={`/messages?to=${app.job?.founder?.user?.id}`}><button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>💬 Message</button></Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recent Jobs */}
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Recent Opportunities</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                    {recentJobs.map(job => (
                        <div key={job.id} className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                                <div>
                                    <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{job.title}</h3>
                                    <p style={{ fontSize: 13, color: '#94A3B8' }}>{job.founder?.user?.name}</p>
                                </div>
                                <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: 11 }}>{job.type?.replace('_', ' ')}</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12, lineHeight: 1.5 }}>{job.description?.slice(0, 100)}...</p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                {job.skills?.slice(0, 3).map((s, i) => (
                                    <span key={i} style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: 11 }}>{s}</span>
                                ))}
                            </div>
                            <Link href={`/jobs/${job.id}`}><button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px 0', fontSize: 13 }}>View Details</button></Link>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

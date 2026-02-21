'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { IS_DEMO_MODE, DEMO_FOUNDER_STATS } from '@/lib/demo-data';

export default function FounderDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [startup, setStartup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { router.push('/auth/login'); return; }
        if (user.role !== 'FOUNDER') { router.push('/'); return; }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (IS_DEMO_MODE) {
            setJobs(DEMO_FOUNDER_STATS.jobs);
            setStartup(DEMO_FOUNDER_STATS.startup);
            setLoading(false);
            return;
        }
        try {
            const [jobsRes, startupRes] = await Promise.all([
                api.get('/jobs/my'),
                api.get('/ideahub').then(r => r.data.startups.find(s => s.founder?.userId === user.id) || null).catch(() => null),
            ]);
            setJobs(jobsRes.data.jobs || []);
            setStartup(startupRes);
        } catch (err) {
            console.warn('API unavailable, loading demo data:', err.message);
            setJobs(DEMO_FOUNDER_STATS.jobs);
            setStartup(DEMO_FOUNDER_STATS.startup);
        }
        setLoading(false);
    };

    if (loading) return <><Navbar /><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div></>;

    const totalApps = jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0);

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Welcome back, {user?.name} 👋</h1>
                    <p style={{ color: '#94A3B8', fontSize: 14 }}>Manage your startup, jobs, and connections</p>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {[
                        { label: 'Active Jobs', value: jobs.filter(j => j.active).length, icon: '💼', color: '#3B82F6' },
                        { label: 'Total Applications', value: totalApps, icon: '📋', color: '#10B981' },
                        { label: 'Idea Hub', value: startup ? 'Submitted' : 'Not Yet', icon: '💡', color: '#F59E0B' },
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

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
                    <Link href="/jobs/create"><button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>+ Post New Job</button></Link>
                    <Link href="/ideahub/submit"><button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>📤 Submit to Idea Hub</button></Link>
                    <Link href="/messages"><button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>💬 Messages</button></Link>
                </div>

                {/* Job Listings */}
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Your Job Listings</h2>
                {jobs.length === 0 ? (
                    <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
                        <p style={{ color: '#94A3B8', marginBottom: 16 }}>No jobs posted yet</p>
                        <Link href="/jobs/create"><button className="btn-primary">Post Your First Job</button></Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {jobs.map(job => (
                            <div key={job.id} className="glass-card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{job.title}</h3>
                                    <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#94A3B8' }}>
                                        <span>{job.type?.replace('_', ' ')}</span>
                                        <span>•</span>
                                        <span>{job.remote ? '🌍 Remote' : '🏢 On-site'}</span>
                                        <span>•</span>
                                        <span>{job._count?.applications || 0} applicants</span>
                                    </div>
                                </div>
                                <Link href={`/jobs/${job.id}`}><button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>View</button></Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

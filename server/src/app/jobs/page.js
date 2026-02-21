'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function JobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [remote, setRemote] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => { fetchJobs(); }, [page, type, remote]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 12 });
            if (search) params.append('search', search);
            if (type) params.append('type', type);
            if (remote) params.append('remote', remote);
            const { data } = await api.get(`/jobs?${params}`);
            setJobs(data.jobs);
            setTotalPages(data.pages);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchJobs(); };

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Startup Jobs</h1>
                        <p style={{ color: '#94A3B8', fontSize: 14 }}>Discover opportunities at innovative startups</p>
                    </div>
                    {user?.role === 'FOUNDER' && <Link href="/jobs/create"><button className="btn-primary">+ Post Job</button></Link>}
                </div>

                {/* Filters */}
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <input className="input-field" style={{ flex: 1, minWidth: 200 }} placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="input-field" style={{ width: 160 }} value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
                        <option value="">All Types</option>
                        <option value="FULL_TIME">Full-Time</option>
                        <option value="PART_TIME">Part-Time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                    </select>
                    <select className="input-field" style={{ width: 140 }} value={remote} onChange={e => { setRemote(e.target.value); setPage(1); }}>
                        <option value="">All Locations</option>
                        <option value="true">Remote Only</option>
                    </select>
                    <button type="submit" className="btn-primary" style={{ padding: '12px 20px' }}>Search</button>
                </form>

                {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Loading...</div> : jobs.length === 0 ? (
                    <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                        <p style={{ color: '#94A3B8' }}>No jobs found matching your criteria</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                            {jobs.map(job => (
                                <div key={job.id} className="glass-card" style={{ padding: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <div>
                                            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{job.title}</h3>
                                            <p style={{ fontSize: 13, color: '#94A3B8' }}>{job.founder?.user?.name} • {job.founder?.startupName}</p>
                                        </div>
                                        <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', height: 'fit-content' }}>{job.type?.replace('_', ' ')}</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, marginBottom: 12 }}>{job.description?.slice(0, 120)}...</p>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                        {job.skills?.slice(0, 4).map((s, i) => (
                                            <span key={i} style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: 11 }}>{s}</span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: 12, color: '#64748B' }}>
                                            {job.remote && '🌍 Remote'} {job.salaryMin && `· $${(job.salaryMin / 1000).toFixed(0)}k-$${(job.salaryMax / 1000).toFixed(0)}k`}
                                        </div>
                                        <Link href={`/jobs/${job.id}`}><button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>View</button></Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i} onClick={() => setPage(i + 1)} style={{
                                        width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                                        background: page === i + 1 ? '#3B82F6' : 'var(--bg-secondary)', color: page === i + 1 ? 'white' : '#94A3B8',
                                        fontWeight: 600, fontSize: 14,
                                    }}>{i + 1}</button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

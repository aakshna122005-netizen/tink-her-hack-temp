'use client';
import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function JobDetailPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [showApply, setShowApply] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        contactNumber: '',
        email: '',
        experience: '',
        coverNote: ''
    });
    const [resume, setResume] = useState(null);
    const [idProof, setIdProof] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                email: user.email || ''
            }));
        }
        fetchJob();
    }, [id, user]);

    const fetchJob = async () => {
        try {
            const { data } = await api.get(`/jobs/${id}`);
            setJob(data.job);

            if (user?.role === 'JOB_SEEKER') {
                try {
                    const appsRes = await api.get('/applications/my');
                    setApplied(appsRes.data.applications?.some(a => a.jobId === id));
                } catch { }
            }

            if (user?.role === 'FOUNDER' && user?.founderProfile?.id === data.job.founderId) {
                try {
                    const appsRes = await api.get(`/applications/job/${id}`);
                    setApplications(appsRes.data.applications || []);
                } catch { }
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setApplying(true);
        try {
            const fd = new FormData();
            fd.append('jobId', id);
            Object.keys(formData).forEach(key => fd.append(key, formData[key]));
            if (resume) fd.append('resume', resume);
            if (idProof) fd.append('idProof', idProof);

            await api.post('/applications', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setApplied(true);
            setShowApply(false);
        } catch (err) { alert(err.response?.data?.error || 'Failed to apply'); }
        setApplying(false);
    };

    const handleStatusUpdate = async (appId, status) => {
        try {
            await api.put(`/applications/${appId}/status`, { status });
            setApplications(apps => apps.map(a => a.id === appId ? { ...a, status } : a));
        } catch (err) { alert('Failed to update status'); }
    };

    const statusColor = { PENDING: '#F59E0B', VIEWED: '#3B82F6', SHORTLISTED: '#8B5CF6', REJECTED: '#F43F5E', ACCEPTED: '#10B981' };

    if (loading) return <><Navbar /><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div></>;
    if (!job) return <><Navbar /><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Job not found</div></>;

    const isOwner = user?.role === 'FOUNDER' && user?.founderProfile?.id === job.founderId;

    return (
        <><Navbar />
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
                <Link href="/jobs" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>← Back to Jobs</Link>

                <div className="glass-card" style={{ padding: 32, marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                        <div>
                            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{job.title}</h1>
                            <p style={{ color: '#94A3B8', fontSize: 14 }}>{job.founder?.user?.name} • {job.founder?.startupName}</p>
                        </div>
                        <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>{job.type?.replace('_', ' ')}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                        {job.remote && <span style={{ fontSize: 13, color: '#10B981' }}>🌍 Remote</span>}
                        {job.location && <span style={{ fontSize: 13, color: '#94A3B8' }}>📍 {job.location}</span>}
                        {job.salaryMin && <span style={{ fontSize: 13, color: '#F59E0B' }}>💰 ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k</span>}
                        {job.equity && <span style={{ fontSize: 13, color: '#8B5CF6' }}>📊 {job.equity} equity</span>}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                        {job.skills?.map((s, i) => (
                            <span key={i} style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: 12 }}>{s}</span>
                        ))}
                    </div>

                    <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Description</h3>
                    <p style={{ color: '#94A3B8', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 24 }}>{job.description}</p>

                    {/* Apply section for job seekers */}
                    {user?.role === 'JOB_SEEKER' && !isOwner && (
                        applied ? (
                            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
                                <span style={{ color: '#10B981', fontWeight: 600 }}>✅ You have applied to this job</span>
                            </div>
                        ) : showApply ? (
                            <div style={{ padding: 24, background: 'rgba(30, 41, 59, 0.4)', borderRadius: 16, marginTop: 8 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>Job Application Form</h3>
                                <form onSubmit={handleApply} style={{ display: 'grid', gap: 16 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>FULL NAME</label>
                                            <input className="input-field" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>DATE OF BIRTH</label>
                                            <input type="date" className="input-field" required value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>CONTACT NUMBER</label>
                                            <input type="tel" className="input-field" required value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>EMAIL</label>
                                            <input type="email" className="input-field" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>EXPERIENCE (Years/Details)</label>
                                        <input className="input-field" required placeholder="e.g. 5 years in React" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>UPLOAD RESUME</label>
                                            <input type="file" required accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])} style={{ fontSize: 12 }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>UPLOAD ID PROOF</label>
                                            <input type="file" required accept="image/*,.pdf" onChange={e => setIdProof(e.target.files[0])} style={{ fontSize: 12 }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>COVER NOTE (OPTIONAL)</label>
                                        <textarea className="input-field" placeholder="Why are you a good fit?" value={formData.coverNote} onChange={e => setFormData({ ...formData, coverNote: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                        <button type="submit" className="btn-primary" disabled={applying} style={{ flex: 1, justifyContent: 'center' }}>
                                            {applying ? 'Applying...' : 'Submit Application'}
                                        </button>
                                        <button type="button" className="btn-secondary" onClick={() => setShowApply(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <button className="btn-primary" onClick={() => setShowApply(true)} style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 15 }}>Apply Now</button>
                        )
                    )}
                </div>

                {/* Applications section for founder */}
                {isOwner && (
                    <div style={{ marginTop: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Applications ({applications.length})</h2>
                        {applications.length === 0 ? (
                            <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>No applications yet</div>
                        ) : (
                            <div style={{ display: 'grid', gap: 12 }}>
                                {applications.map(app => (
                                    <div key={app.id} className="glass-card" style={{ padding: 24 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                                            <div style={{ display: 'flex', gap: 16 }}>
                                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                    {app.fullName?.[0] || app.seeker?.user?.name?.[0]}
                                                </div>
                                                <div>
                                                    <h4 style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>{app.fullName || app.seeker?.user?.name}</h4>
                                                    <p style={{ fontSize: 13, color: '#94A3B8' }}>{app.email || app.seeker?.user?.email} • {app.contactNumber || 'No phone'}</p>
                                                </div>
                                            </div>
                                            <span className="badge" style={{ background: `${statusColor[app.status]}20`, color: statusColor[app.status] }}>{app.status}</span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                                            <div>
                                                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>Experience</div>
                                                <div style={{ fontSize: 14 }}>{app.experience || 'Not specified'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>Date of Birth</div>
                                                <div style={{ fontSize: 14 }}>{app.dob ? new Date(app.dob).toLocaleDateString() : 'Not specified'}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                {app.resumeUrl && <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${app.resumeUrl}`} target="_blank" style={{ color: '#3B82F6', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>📄 Resume</a>}
                                                {app.idProofUrl && <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${app.idProofUrl}`} target="_blank" style={{ color: '#10B981', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>🆔 ID Proof</a>}
                                            </div>
                                        </div>

                                        {app.coverNote && (
                                            <div style={{ marginBottom: 20 }}>
                                                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', marginBottom: 6 }}>Cover Note</div>
                                                <p style={{ fontSize: 14, color: '#F8FAFC', lineHeight: 1.6, padding: 12, background: 'rgba(59,130,246,0.05)', borderRadius: 8 }}>{app.coverNote}</p>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                                            <button onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>⭐ Shortlist</button>
                                            <button onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')} className="btn-success" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>✅ Accept</button>
                                            <button onClick={() => handleStatusUpdate(app.id, 'REJECTED')} className="btn-danger" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>✕ Reject</button>
                                            <Link href={`/messages?to=${app.seeker?.user?.id}`} style={{ marginLeft: 'auto' }}><button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>💬 Message</button></Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div></>
    );
}

'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function CreateJobPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ title: '', description: '', skills: '', type: 'FULL_TIME', salaryMin: '', salaryMax: '', equity: '', remote: false, location: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await api.post('/jobs', { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : null, salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : null });
            router.push('/dashboard/founder');
        } catch (err) { setError(err.response?.data?.error || 'Failed to create job'); }
        setLoading(false);
    };

    const ls = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#94A3B8' };

    return (
        <><Navbar />
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Post a Job</h1>
                <p style={{ color: '#94A3B8', marginBottom: 32, fontSize: 14 }}>Find top talent for your startup</p>
                {error && <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(244,63,94,0.1)', color: '#F43F5E', fontSize: 13, marginBottom: 20 }}>{error}</div>}
                <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 32 }}>
                    <div style={{ marginBottom: 16 }}><label style={ls}>Job Title *</label><input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Senior Frontend Developer" /></div>
                    <div style={{ marginBottom: 16 }}><label style={ls}>Description *</label><textarea className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Describe the role, responsibilities, and requirements..." /></div>
                    <div style={{ marginBottom: 16 }}><label style={ls}>Skills (comma-separated) *</label><input className="input-field" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} required placeholder="React, TypeScript, Node.js..." /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div><label style={ls}>Job Type</label><select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option value="FULL_TIME">Full-Time</option><option value="PART_TIME">Part-Time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option>
                        </select></div>
                        <div><label style={ls}>Equity</label><input className="input-field" value={form.equity} onChange={e => setForm({ ...form, equity: e.target.value })} placeholder="e.g. 0.5-1%" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div><label style={ls}>Min Salary ($)</label><input type="number" className="input-field" value={form.salaryMin} onChange={e => setForm({ ...form, salaryMin: e.target.value })} placeholder="50000" /></div>
                        <div><label style={ls}>Max Salary ($)</label><input type="number" className="input-field" value={form.salaryMax} onChange={e => setForm({ ...form, salaryMax: e.target.value })} placeholder="120000" /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'end' }}>
                        <div style={{ flex: 1 }}><label style={ls}>Location</label><input className="input-field" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, Country" /></div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid rgba(148,163,184,0.1)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            <input type="checkbox" checked={form.remote} onChange={e => setForm({ ...form, remote: e.target.checked })} />
                            <span style={{ fontSize: 14, color: '#94A3B8' }}>🌍 Remote</span>
                        </label>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 15, marginTop: 8 }}>
                        {loading ? 'Publishing...' : 'Publish Job'}
                    </button>
                </form>
            </div></>
    );
}

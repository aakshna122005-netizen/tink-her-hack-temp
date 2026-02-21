'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function SubmitIdeaPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', sector: '', stage: 'pre-seed', problem: '', solution: '', traction: '', marketSize: '', fundingAsk: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await api.post('/ideahub', form);
            router.push('/ideahub');
        } catch (err) { setError(err.response?.data?.error || 'Failed to submit'); }
        setLoading(false);
    };

    const ls = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#94A3B8' };

    return (
        <><Navbar />
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Submit to Idea Hub</h1>
                <p style={{ color: '#94A3B8', marginBottom: 24, fontSize: 14 }}>Share your startup with investors. Our AI will score and tag your submission.</p>
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', fontSize: 13, color: '#3B82F6', marginBottom: 24 }}>
                    🤖 After submission, our AI analyzes your startup and an admin reviews it before it appears in investor feeds.
                </div>
                {error && <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(244,63,94,0.1)', color: '#F43F5E', fontSize: 13, marginBottom: 20 }}>{error}</div>}
                <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 32 }}>
                    <div style={{ marginBottom: 16 }}><label style={ls}>Startup Name *</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div><label style={ls}>Sector *</label><select className="input-field" value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} required>
                            <option value="">Select</option>{['AI/ML', 'FinTech', 'HealthTech', 'EdTech', 'SaaS', 'E-Commerce', 'CleanTech', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select></div>
                        <div><label style={ls}>Stage *</label><select className="input-field" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
                            {['pre-seed', 'seed', 'series-a', 'series-b', 'growth'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select></div>
                    </div>
                    <div style={{ marginBottom: 16 }}><label style={ls}>Problem Statement *</label><textarea className="input-field" value={form.problem} onChange={e => setForm({ ...form, problem: e.target.value })} required placeholder="What problem are you solving?" /></div>
                    <div style={{ marginBottom: 16 }}><label style={ls}>Solution *</label><textarea className="input-field" value={form.solution} onChange={e => setForm({ ...form, solution: e.target.value })} required placeholder="How does your startup solve this?" /></div>
                    <div style={{ marginBottom: 16 }}><label style={ls}>Traction</label><textarea className="input-field" value={form.traction} onChange={e => setForm({ ...form, traction: e.target.value })} placeholder="Users, revenue, growth metrics..." style={{ minHeight: 60 }} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div><label style={ls}>Market Size</label><input className="input-field" value={form.marketSize} onChange={e => setForm({ ...form, marketSize: e.target.value })} placeholder="e.g. $5B TAM" /></div>
                        <div><label style={ls}>Funding Ask ($) *</label><input type="number" className="input-field" value={form.fundingAsk} onChange={e => setForm({ ...form, fundingAsk: e.target.value })} required placeholder="500000" /></div>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 15, marginTop: 8 }}>
                        {loading ? 'Submitting...' : '🚀 Submit to Idea Hub'}
                    </button>
                </form>
            </div></>
    );
}

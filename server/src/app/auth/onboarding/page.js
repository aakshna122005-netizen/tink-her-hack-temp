'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function OnboardingPage() {
    const { user, selectRole, updateUser } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(user?.role ? 2 : 1);
    const [selectedRole, setSelectedRole] = useState(user?.role || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Founder fields
    const [founder, setFounder] = useState({ startupName: '', sector: '', stage: 'pre-seed', description: '', teamSize: 1, fundingRaised: 0, website: '' });
    // Job Seeker fields
    const [seeker, setSeeker] = useState({ headline: '', skills: '', experience: '', preferredRoles: '', bio: '' });
    // Investor fields
    const [investor, setInvestor] = useState({ firmName: '', investmentThesis: '', preferredSectors: '', ticketSizeMin: 0, ticketSizeMax: 0, bio: '' });

    const roles = [
        { value: 'FOUNDER', icon: '🚀', title: 'Startup Founder', desc: 'I\'m building a startup', color: '#3B82F6' },
        { value: 'JOB_SEEKER', icon: '💼', title: 'Job Seeker', desc: 'I\'m looking for opportunities', color: '#10B981' },
        { value: 'INVESTOR', icon: '💰', title: 'Investor', desc: 'I\'m looking to invest', color: '#8B5CF6' },
    ];

    const handleRoleSelect = async (role) => {
        setSelectedRole(role);
        try {
            await selectRole(role);
            setStep(2);
        } catch (err) {
            setError('Failed to set role');
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (selectedRole === 'FOUNDER') {
                await api.put('/users/profile/founder', founder);
            } else if (selectedRole === 'JOB_SEEKER') {
                await api.put('/users/profile/jobseeker', {
                    ...seeker,
                    skills: seeker.skills.split(',').map(s => s.trim()).filter(Boolean),
                    preferredRoles: seeker.preferredRoles.split(',').map(s => s.trim()).filter(Boolean),
                });
            } else if (selectedRole === 'INVESTOR') {
                await api.put('/users/profile/investor', {
                    ...investor,
                    preferredSectors: investor.preferredSectors.split(',').map(s => s.trim()).filter(Boolean),
                });
            }
            updateUser({ onboarded: true });
            const map = { FOUNDER: '/dashboard/founder', JOB_SEEKER: '/dashboard/jobseeker', INVESTOR: '/dashboard/investor' };
            router.push(map[selectedRole]);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { marginBottom: 16 };
    const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#94A3B8' };

    return (
        <>
            <Navbar />
            <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div className="glass-card animate-fade-in" style={{ padding: 40, width: '100%', maxWidth: 520 }}>
                    {/* Progress indicator */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'rgba(148,163,184,0.15)' }} />
                        ))}
                    </div>

                    {step === 1 && (
                        <>
                            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>What brings you here?</h1>
                            <p style={{ color: '#94A3B8', marginBottom: 32, fontSize: 14 }}>Select your role to get started</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {roles.map(role => (
                                    <button key={role.value} onClick={() => handleRoleSelect(role.value)} style={{
                                        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                                        background: selectedRole === role.value ? `rgba(${role.color === '#3B82F6' ? '59,130,246' : role.color === '#10B981' ? '16,185,129' : '139,92,246'},0.1)` : 'var(--bg-secondary)',
                                        border: `1px solid ${selectedRole === role.value ? role.color : 'rgba(148,163,184,0.1)'}`,
                                        borderRadius: 12, cursor: 'pointer', color: '#F8FAFC', textAlign: 'left', width: '100%',
                                        transition: 'all 0.2s ease',
                                    }}>
                                        <span style={{ fontSize: 32 }}>{role.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{role.title}</div>
                                            <div style={{ fontSize: 13, color: '#94A3B8' }}>{role.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Complete Your Profile</h1>
                            <p style={{ color: '#94A3B8', marginBottom: 32, fontSize: 14 }}>Tell us more about yourself</p>
                            {error && <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(244,63,94,0.1)', color: '#F43F5E', fontSize: 13, marginBottom: 20 }}>{error}</div>}
                            <form onSubmit={handleProfileSubmit}>
                                {selectedRole === 'FOUNDER' && (
                                    <>
                                        <div style={inputStyle}><label style={labelStyle}>Startup Name *</label><input className="input-field" value={founder.startupName} onChange={e => setFounder({ ...founder, startupName: e.target.value })} required /></div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, ...inputStyle }}>
                                            <div><label style={labelStyle}>Sector *</label><select className="input-field" value={founder.sector} onChange={e => setFounder({ ...founder, sector: e.target.value })} required>
                                                <option value="">Select</option>{['AI/ML', 'FinTech', 'HealthTech', 'EdTech', 'SaaS', 'E-Commerce', 'CleanTech', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select></div>
                                            <div><label style={labelStyle}>Stage *</label><select className="input-field" value={founder.stage} onChange={e => setFounder({ ...founder, stage: e.target.value })}>
                                                {['pre-seed', 'seed', 'series-a', 'series-b', 'growth'].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select></div>
                                        </div>
                                        <div style={inputStyle}><label style={labelStyle}>Description *</label><textarea className="input-field" value={founder.description} onChange={e => setFounder({ ...founder, description: e.target.value })} required placeholder="What does your startup do?" /></div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, ...inputStyle }}>
                                            <div><label style={labelStyle}>Team Size</label><input type="number" className="input-field" value={founder.teamSize} onChange={e => setFounder({ ...founder, teamSize: e.target.value })} min="1" /></div>
                                            <div><label style={labelStyle}>Funding Raised ($)</label><input type="number" className="input-field" value={founder.fundingRaised} onChange={e => setFounder({ ...founder, fundingRaised: e.target.value })} min="0" /></div>
                                        </div>
                                        <div style={inputStyle}><label style={labelStyle}>Website</label><input className="input-field" value={founder.website} onChange={e => setFounder({ ...founder, website: e.target.value })} placeholder="https://..." /></div>
                                    </>
                                )}
                                {selectedRole === 'JOB_SEEKER' && (
                                    <>
                                        <div style={inputStyle}><label style={labelStyle}>Headline</label><input className="input-field" value={seeker.headline} onChange={e => setSeeker({ ...seeker, headline: e.target.value })} placeholder="e.g. Full Stack Developer" /></div>
                                        <div style={inputStyle}><label style={labelStyle}>Skills (comma-separated) *</label><input className="input-field" value={seeker.skills} onChange={e => setSeeker({ ...seeker, skills: e.target.value })} required placeholder="React, Node.js, Python..." /></div>
                                        <div style={inputStyle}><label style={labelStyle}>Experience</label><textarea className="input-field" value={seeker.experience} onChange={e => setSeeker({ ...seeker, experience: e.target.value })} placeholder="Brief summary of your experience" /></div>
                                        <div style={inputStyle}><label style={labelStyle}>Preferred Roles (comma-separated)</label><input className="input-field" value={seeker.preferredRoles} onChange={e => setSeeker({ ...seeker, preferredRoles: e.target.value })} placeholder="Frontend, Backend, Product Manager..." /></div>
                                        <div style={inputStyle}><label style={labelStyle}>Bio</label><textarea className="input-field" value={seeker.bio} onChange={e => setSeeker({ ...seeker, bio: e.target.value })} placeholder="Tell founders about yourself" /></div>
                                    </>
                                )}
                                {selectedRole === 'INVESTOR' && (
                                    <>
                                        <div style={inputStyle}><label style={labelStyle}>Firm Name</label><input className="input-field" value={investor.firmName} onChange={e => setInvestor({ ...investor, firmName: e.target.value })} placeholder="Your fund or firm" /></div>
                                        <div style={inputStyle}><label style={labelStyle}>Investment Thesis</label><textarea className="input-field" value={investor.investmentThesis} onChange={e => setInvestor({ ...investor, investmentThesis: e.target.value })} placeholder="What kind of startups do you invest in?" /></div>
                                        <div style={inputStyle}><label style={labelStyle}>Preferred Sectors (comma-separated)</label><input className="input-field" value={investor.preferredSectors} onChange={e => setInvestor({ ...investor, preferredSectors: e.target.value })} placeholder="AI/ML, FinTech, SaaS..." /></div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, ...inputStyle }}>
                                            <div><label style={labelStyle}>Min Ticket Size ($)</label><input type="number" className="input-field" value={investor.ticketSizeMin} onChange={e => setInvestor({ ...investor, ticketSizeMin: e.target.value })} min="0" /></div>
                                            <div><label style={labelStyle}>Max Ticket Size ($)</label><input type="number" className="input-field" value={investor.ticketSizeMax} onChange={e => setInvestor({ ...investor, ticketSizeMax: e.target.value })} min="0" /></div>
                                        </div>
                                        <div style={inputStyle}><label style={labelStyle}>Bio</label><textarea className="input-field" value={investor.bio} onChange={e => setInvestor({ ...investor, bio: e.target.value })} placeholder="About you and your investment approach" /></div>
                                    </>
                                )}
                                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 15, marginTop: 8 }}>
                                    {loading ? 'Saving...' : 'Complete Setup →'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

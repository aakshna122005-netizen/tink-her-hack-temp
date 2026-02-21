'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (!user.role || !user.onboarded) {
                router.push('/auth/onboarding');
            } else {
                const map = { FOUNDER: '/dashboard/founder', JOB_SEEKER: '/dashboard/jobseeker', INVESTOR: '/dashboard/investor' };
                router.push(map[user.role]);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    return (
        <>
            <Navbar />
            <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div className="glass-card animate-fade-in" style={{ padding: 40, width: '100%', maxWidth: 440 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome Back</h1>
                    <p style={{ color: '#94A3B8', marginBottom: 32, fontSize: 14 }}>Sign in to your PitchBridge account</p>

                    {error && <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#F43F5E', fontSize: 13, marginBottom: 20 }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#94A3B8' }}>Email</label>
                            <input type="email" className="input-field" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#94A3B8' }}>Password</label>
                            <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 15 }}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.15)' }} />
                        <span style={{ fontSize: 12, color: '#64748B' }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.15)' }} />
                    </div>

                    <a href={`${API_URL}/auth/google`}>
                        <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}>
                            🔵 Continue with Google
                        </button>
                    </a>

                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#94A3B8' }}>
                        Don&apos;t have an account? <Link href="/auth/register" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

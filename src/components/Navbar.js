'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [unread, setUnread] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (user) {
            api.get('/notifications').then(({ data }) => setUnread(data.unreadCount)).catch(() => { });
        }
    }, [user]);

    const getDashboardLink = () => {
        if (!user?.role) return '/auth/onboarding';
        const map = { FOUNDER: '/dashboard/founder', JOB_SEEKER: '/dashboard/jobseeker', INVESTOR: '/dashboard/investor' };
        return map[user.role] || '/';
    };

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '0 24px', height: '64px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 18, color: 'white',
                }}>P</div>
                <span style={{ fontWeight: 700, fontSize: 20, color: '#F8FAFC' }}>PitchBridge</span>
            </Link>

            {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href={getDashboardLink()} style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Dashboard</Link>
                    <Link href="/jobs" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Jobs</Link>
                    <Link href="/ideahub" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Idea Hub</Link>
                    <Link href="/messages" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Messages</Link>
                    <Link href="/notifications" style={{ position: 'relative', color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                        🔔 {unread > 0 && (
                            <span style={{
                                position: 'absolute', top: -8, right: -12,
                                background: '#F43F5E', borderRadius: '50%',
                                width: 18, height: 18, fontSize: 10,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700,
                            }}>{unread}</span>
                        )}
                    </Link>
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setMenuOpen(!menuOpen)} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'none', border: 'none', cursor: 'pointer', color: '#F8FAFC',
                        }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 600,
                            }}>{user.name?.[0]?.toUpperCase()}</div>
                        </button>
                        {menuOpen && (
                            <div style={{
                                position: 'absolute', top: '120%', right: 0, minWidth: 200,
                                background: '#1E293B', border: '1px solid rgba(148,163,184,0.15)',
                                borderRadius: 12, padding: 8, zIndex: 100,
                            }}>
                                <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(148,163,184,0.1)', marginBottom: 4 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{user.role?.replace('_', ' ')}</div>
                                </div>
                                {user.isAdmin && (
                                    <button onClick={() => { router.push('/admin'); setMenuOpen(false); }} style={{
                                        width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none',
                                        border: 'none', color: '#F59E0B', cursor: 'pointer', borderRadius: 8, fontSize: 14,
                                    }}>⚡ Admin Panel</button>
                                )}
                                <button onClick={() => { logout(); router.push('/'); setMenuOpen(false); }} style={{
                                    width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none',
                                    border: 'none', color: '#F43F5E', cursor: 'pointer', borderRadius: 8, fontSize: 14,
                                }}>Sign Out</button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/auth/login"><button className="btn-secondary" style={{ padding: '8px 20px' }}>Login</button></Link>
                    <Link href="/auth/register"><button className="btn-primary" style={{ padding: '8px 20px' }}>Get Started</button></Link>
                </div>
            )}
        </nav>
    );
}

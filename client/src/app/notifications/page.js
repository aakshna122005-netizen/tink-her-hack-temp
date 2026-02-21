'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { router.push('/auth/login'); return; }
        fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.notifications || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) { console.error(err); }
    };

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) { console.error(err); }
    };

    const typeIcon = {
        JOB_APPLICATION: '📋', APP_STATUS: '📬', NEW_MESSAGE: '💬',
        INVESTOR_INTEREST: '💰', AI_MATCH: '🤖', SCREENING_RESULT: '🛡️',
    };

    if (loading) return <><Navbar /><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div></>;

    const unread = notifications.filter(n => !n.read).length;

    return (
        <><Navbar />
            <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Notifications</h1>
                        <p style={{ color: '#94A3B8', fontSize: 14 }}>{unread} unread</p>
                    </div>
                    {unread > 0 && <button className="btn-secondary" onClick={markAllRead} style={{ padding: '8px 16px', fontSize: 13 }}>Mark all read</button>}
                </div>

                {notifications.length === 0 ? (
                    <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
                        <p style={{ color: '#94A3B8' }}>No notifications yet</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {notifications.map(n => (
                            <div key={n.id} onClick={() => { if (!n.read) markRead(n.id); if (n.link) router.push(n.link); }} className="glass-card" style={{
                                padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'start',
                                cursor: n.link ? 'pointer' : 'default',
                                borderLeft: n.read ? '3px solid transparent' : '3px solid #3B82F6',
                                background: n.read ? 'rgba(15,23,42,0.5)' : 'rgba(59,130,246,0.05)',
                            }}>
                                <div style={{ fontSize: 24, flexShrink: 0 }}>{typeIcon[n.type] || '🔔'}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{n.title}</div>
                                    <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.4 }}>{n.message}</p>
                                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>{new Date(n.createdAt).toLocaleString()}</div>
                                </div>
                                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', flexShrink: 0, marginTop: 4 }} />}
                            </div>
                        ))}
                    </div>
                )}
            </div></>
    );
}

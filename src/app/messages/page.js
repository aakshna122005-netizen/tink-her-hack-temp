'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import Navbar from '@/components/Navbar';
import { Suspense } from 'react';

function MessagesContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [threads, setThreads] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activePartner, setActivePartner] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const socket = user ? getSocket(typeof window !== 'undefined' ? localStorage.getItem('token') : null) : null;

    useEffect(() => {
        if (!user) { router.push('/auth/login'); return; }
        fetchThreads();

        // Handle ?to= query param
        const toParam = searchParams.get('to');
        if (toParam) openConversation({ id: toParam, name: 'User', avatar: null });
    }, [user]);

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (msg) => {
                if (activePartner && (msg.senderId === activePartner.id || msg.receiverId === activePartner.id)) {
                    setMessages(prev => [...prev, msg]);
                }
                fetchThreads();
            });
            socket.on('message_sent', (msg) => {
                if (activePartner && (msg.receiverId === activePartner.id)) {
                    setMessages(prev => [...prev, msg]);
                }
                fetchThreads();
            });
            socket.on('user_typing', ({ userId }) => {
                if (activePartner?.id === userId) setTyping(true);
            });
            socket.on('user_stop_typing', () => setTyping(false));
        }
        return () => {
            socket?.off('receive_message');
            socket?.off('message_sent');
            socket?.off('user_typing');
            socket?.off('user_stop_typing');
        };
    }, [socket, activePartner]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchThreads = async () => {
        try {
            const { data } = await api.get('/messages/threads');
            setThreads(data.threads || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const openConversation = async (partner) => {
        setActivePartner(partner);
        try {
            const { data } = await api.get(`/messages/${partner.id}`);
            setMessages(data.messages || []);
            socket?.emit('mark_read', { senderId: partner.id });
        } catch (err) { console.error(err); }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activePartner) return;
        const content = newMessage.trim();
        setNewMessage('');
        socket?.emit('stop_typing', { receiverId: activePartner.id });

        if (socket?.connected) {
            socket.emit('send_message', { receiverId: activePartner.id, content });
        } else {
            try {
                const { data } = await api.post('/messages', { receiverId: activePartner.id, content });
                setMessages(prev => [...prev, data.message]);
            } catch (err) { console.error(err); }
        }
        fetchThreads();
    };

    let typingTimeout;
    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (activePartner) {
            socket?.emit('typing', { receiverId: activePartner.id });
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => socket?.emit('stop_typing', { receiverId: activePartner.id }), 1500);
        }
    };

    if (loading) return <><Navbar /><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div></>;

    return (
        <><Navbar />
            <div style={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
                {/* Thread Sidebar */}
                <div style={{ width: 320, borderRight: '1px solid rgba(148,163,184,0.1)', display: 'flex', flexDirection: 'column', background: 'rgba(15,23,42,0.5)' }}>
                    <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Messages</h2>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {threads.length === 0 ? (
                            <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>No conversations yet</div>
                        ) : threads.map((t, i) => (
                            <button key={i} onClick={() => openConversation(t.partner)} style={{
                                width: '100%', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center',
                                background: activePartner?.id === t.partner?.id ? 'rgba(59,130,246,0.1)' : 'none',
                                border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(148,163,184,0.05)',
                                borderLeft: activePartner?.id === t.partner?.id ? '3px solid #3B82F6' : '3px solid transparent',
                            }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{t.partner?.name?.[0]?.toUpperCase()}</div>
                                <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: '#F8FAFC' }}>{t.partner?.name}</span>
                                        {t.unreadCount > 0 && <span style={{ background: '#3B82F6', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{t.unreadCount}</span>}
                                    </div>
                                    <p style={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{t.lastMessage?.content?.slice(0, 40)}...</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {!activePartner ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#94A3B8' }}>
                            <div style={{ fontSize: 48 }}>💬</div>
                            <p style={{ fontSize: 16 }}>Select a conversation to start messaging</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(148,163,184,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{activePartner.name?.[0]?.toUpperCase()}</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>{activePartner.name}</div>
                                    {typing && <div style={{ fontSize: 12, color: '#94A3B8' }}>typing...</div>}
                                </div>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {messages.map((msg, i) => {
                                    const isMine = msg.senderId === user?.id;
                                    return (
                                        <div key={i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                                            <div style={{
                                                maxWidth: '68%', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                background: isMine ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'rgba(30,41,59,0.8)',
                                                fontSize: 14, lineHeight: 1.5, color: '#F8FAFC',
                                            }}>
                                                {msg.content}
                                                <div style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.6)' : '#64748B', marginTop: 4, textAlign: 'right' }}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(148,163,184,0.1)', display: 'flex', gap: 12 }}>
                                <input className="input-field" placeholder="Type a message..." value={newMessage} onChange={handleTyping}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                    style={{ flex: 1 }} />
                                <button className="btn-primary" onClick={sendMessage} style={{ padding: '12px 20px' }}>Send →</button>
                            </div>
                        </>
                    )}
                </div>
            </div></>
    );
}

export default function MessagesPage() {
    return <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Loading...</div>}><MessagesContent /></Suspense>;
}

import { demoUsers } from './demo-data.js';
import { showToast } from './ui.js';

const SESSION_KEY = 'pb_session';

export function getCurrentUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

export function login(email, password) {
    const user = demoUsers.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, error: 'Invalid credentials. Use a demo account.' };
    const session = { ...user };
    delete session.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: session };
}

export function demoLogin(role) {
    const map = { founder: 'founder@demo.com', investor: 'investor@demo.com', seeker: 'seeker@demo.com' };
    return login(map[role], 'demo123');
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
}

export function register(name, email, password, role) {
    if (!name || !email || !password || !role) return { ok: false, error: 'All fields required.' };
    const exists = demoUsers.find(u => u.email === email);
    if (exists) return { ok: false, error: 'Email already registered. Try demo login.' };
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const newUser = { id: 99, name, email, role, avatar: initials, bio: '', tagline: '', location: '', connections: 0, company: '' };
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    showToast('Account created! Welcome to PitchBridge 🎉', 'success');
    return { ok: true, user: newUser };
}

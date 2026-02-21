import { getCurrentUser } from '../auth.js';
import { showToast } from '../ui.js';

export function renderProfile() {
    const user = getCurrentUser();
    if (!user) return '';
    const roleLabel = user.role === 'founder' ? '🚀 Founder' : user.role === 'investor' ? '💼 Investor' : '🎯 Job Seeker';
    return `
  <div class="container" style="max-width:800px">
    <div class="profile-header glass-card">
      <div class="profile-avatar">${user.avatar}</div>
      <div style="flex:1">
        <h1 class="profile-name">${user.name}</h1>
        <p class="profile-role">${roleLabel}</p>
        <p class="profile-tagline">${user.tagline || 'Building something great on PitchBridge.'}</p>
        <div class="profile-stats">
          <div class="profile-stat"><span class="pstat-val">${user.connections}</span><span class="pstat-label">Connections</span></div>
          <div class="profile-stat"><span class="pstat-val">${user.location || 'India'}</span><span class="pstat-label">Location</span></div>
          ${user.company ? `<div class="profile-stat"><span class="pstat-val">${user.company}</span><span class="pstat-label">Company</span></div>` : ''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-primary btn-sm" onclick="window._editProfile()">✏️ Edit Profile</button>
        <button class="btn btn-secondary btn-sm" onclick="window._shareProfile()">🔗 Share</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px">
      <div class="glass-card" style="padding:24px">
        <h3 style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">About</h3>
        <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7">${user.bio || 'Building connections in the startup ecosystem. Passionate about innovation, technology, and entrepreneurship.'}</p>
      </div>
      <div class="glass-card" style="padding:24px">
        <h3 style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">Account Details</h3>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;justify-content:space-between;font-size:0.85rem">
            <span style="color:var(--text-muted)">Email</span>
            <span style="font-weight:500">${user.email}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.85rem">
            <span style="color:var(--text-muted)">Role</span>
            <span style="font-weight:500;color:var(--blue)">${user.role}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.85rem">
            <span style="color:var(--text-muted)">Member Since</span>
            <span style="font-weight:500">Feb 2025</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.85rem">
            <span style="color:var(--text-muted)">Status</span>
            <span class="tag tag-emerald">Active</span>
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card" style="padding:24px;margin-top:16px">
      <h3 style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px">Skills & Interests</h3>
      <div class="chip-row">
        ${['Startups', 'Technology', 'AI/ML', 'Fintech', 'Product Strategy', 'Venture Capital', 'Growth Hacking', 'Data Science'].map(t => `<span class="tag tag-blue">${t}</span>`).join('')}
      </div>
    </div>

    <div style="margin-top:24px;padding:20px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:var(--radius)">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <p style="font-weight:600;font-size:0.9rem">Danger Zone</p>
          <p style="font-size:0.8rem;color:var(--text-muted)">Sign out of your PitchBridge account.</p>
        </div>
        <button class="btn btn-ghost btn-sm" style="color:#EF4444;border-color:rgba(239,68,68,0.3)" onclick="window._logout()">Sign Out</button>
      </div>
    </div>
  </div>`;
}

export function bindProfileEvents() {
    window._editProfile = () => showToast('Profile editing coming soon!', 'info');
    window._shareProfile = () => {
        navigator.clipboard?.writeText(window.location.href).catch(() => { });
        showToast('Profile link copied to clipboard!', 'success');
    };
}

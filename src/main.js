import './style.css';
import { navigate, getParams } from './router.js';
import { getCurrentUser, logout } from './auth.js';
import { showToast } from './ui.js';

// Views
import { renderAuthPage, bindAuthEvents } from './views/auth-view.js';
import { renderIdeaHub, renderStartupDetail, bindIdeaHubEvents } from './views/idea-hub-view.js';
import { renderJobBoard, bindJobBoardEvents } from './views/jobs-view.js';
import { renderDashboard, bindDashboardEvents } from './views/dashboard-view.js';
import { renderMessages, renderNotifications, bindMessagesEvents } from './views/messages-view.js';
import { renderProfile, bindProfileEvents } from './views/profile-view.js';

const app = document.getElementById('app');

function renderLanding() {
  return `
  <div style="min-height:100vh">
    <section class="hero">
      <div class="hero-eyebrow">🚀 Launching in India — Private Beta</div>
      <h1>Where Startups Meet<br>Capital & Talent</h1>
      <p>PitchBridge is the AI-powered networking platform connecting visionary founders, smart investors, and exceptional builders — all in one premium ecosystem.</p>
      <div class="hero-btns">
        <button class="btn btn-primary" style="font-size:1rem;padding:14px 28px" onclick="navigate('auth')">Get Started Free →</button>
        <button class="btn btn-secondary" style="font-size:1rem;padding:14px 28px" onclick="navigate('idea-hub')">Browse Idea Hub</button>
      </div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hero-stat-num">50+</div><div class="hero-stat-label">AI-Vetted Startups</div></div>
        <div class="hero-stat"><div class="hero-stat-num">₹12Cr+</div><div class="hero-stat-label">Capital Seeking</div></div>
        <div class="hero-stat"><div class="hero-stat-num">200+</div><div class="hero-stat-label">Open Roles</div></div>
        <div class="hero-stat"><div class="hero-stat-num">95%</div><div class="hero-stat-label">Match Accuracy</div></div>
      </div>
    </section>

    <section style="padding:40px 24px 80px;max-width:1200px;margin:0 auto">
      <h2 style="font-size:1.6rem;font-weight:800;text-align:center;margin-bottom:8px">Built for Three Pillars</h2>
      <p style="text-align:center;color:var(--text-muted);margin-bottom:40px">Every role gets a tailored, purpose-built experience.</p>
      <div class="grid-3">
        ${[
      { icon: '🚀', role: 'Founders', color: 'var(--blue)', features: ['AI Startup Screening', 'Investor Discovery', 'One-Click Hiring', 'Deal Room Analytics'] },
      { icon: '💼', role: 'Investors', color: 'var(--emerald)', features: ['AI Score Filtering', 'Curated Deal Flow', 'Direct Founder Messaging', 'Portfolio Tracking'] },
      { icon: '🎯', role: 'Job Seekers', color: 'var(--purple)', features: ['Startup-Focused Roles', 'Equity-First Jobs', 'Real-time Application Updates', 'Founder Direct Apply'] },
    ].map(p => `
          <div class="glass-card" style="padding:28px">
            <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,${p.color}22,${p.color}44);display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin-bottom:16px;border:1px solid ${p.color}33">${p.icon}</div>
            <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:12px;color:${p.color}">${p.role}</h3>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:8px">
              ${p.features.map(f => `<li style="font-size:0.85rem;color:var(--text-secondary);display:flex;align-items:center;gap:8px"><span style="color:${p.color}">✓</span>${f}</li>`).join('')}
            </ul>
            <button class="btn btn-secondary btn-sm" style="margin-top:20px;width:100%;justify-content:center" onclick="navigate('auth')">Join as ${p.role.slice(0, -1)} →</button>
          </div>`).join('')}
      </div>
    </section>

    <section style="padding:40px 24px 80px;background:rgba(59,130,246,0.04);border-top:1px solid var(--glass-border)">
      <div style="max-width:700px;margin:0 auto;text-align:center">
        <h2 style="font-size:1.8rem;font-weight:800;margin-bottom:12px">AI-Powered Screening</h2>
        <p style="color:var(--text-secondary);margin-bottom:32px">Every startup on PitchBridge is analyzed by our Gemini AI engine, generating a quality score and insights so investors can find the best deals instantly.</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
          ${[['92', 'NeuralNest AI', 'var(--emerald)'], ['85', 'GreenGrid Energy', 'var(--blue)'], ['96', 'MediScan Pro', 'var(--purple)']].map(([score, name, color]) => `
            <div class="glass-card" style="padding:20px;text-align:center">
              <div style="font-size:2rem;font-weight:800;color:${color}">${score}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">AI Score</div>
              <div style="font-size:0.85rem;font-weight:600;margin-top:8px">${name}</div>
            </div>`).join('')}
        </div>
        <button class="btn btn-primary" style="margin-top:28px" onclick="navigate('idea-hub')">Explore Idea Hub →</button>
      </div>
    </section>

    <footer style="padding:40px 24px;border-top:1px solid var(--glass-border);text-align:center;color:var(--text-muted);font-size:0.82rem">
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:12px">
        <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--blue),var(--emerald));display:flex;align-items:center;justify-content:center">🌉</div>
        <span style="font-weight:700;font-size:1.1rem;background:linear-gradient(135deg,var(--blue),var(--emerald));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">PitchBridge</span>
      </div>
      <p>Built by <strong style="color:var(--text-secondary)">Aakshna</strong> &amp; <strong style="color:var(--text-secondary)">Aarcha</strong> · Connect. Pitch. Build the Future.</p>
      <p style="margin-top:4px">© 2025 PitchBridge. Demo Mode Active.</p>
    </footer>
  </div>`;
}

function renderTopNav(view) {
  const user = getCurrentUser();
  const publicViews = ['landing', 'auth'];
  if (publicViews.includes(view)) return '';

  const links = [
    { id: 'landing', label: 'Home', icon: '🏠' },
    { id: 'idea-hub', label: 'Idea Hub', icon: '💡' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  ];

  return `
  <nav class="topnav">
    <div class="nav-brand" onclick="navigate('landing')">
      <div class="logo-icon">🌉</div>
      PitchBridge
    </div>
    <div class="nav-links">
      ${links.map(l => `<button class="nav-link ${view === l.id ? 'active' : ''}" onclick="navigate('${l.id}')">${l.label}</button>`).join('')}
    </div>
    <div class="nav-actions">
      <button class="icon-btn" onclick="navigate('notifications')" title="Notifications">
        🔔 <span class="badge">2</span>
      </button>
      <button class="icon-btn" onclick="navigate('messages')" title="Messages">
        💬 <span class="badge">2</span>
      </button>
      ${user ? `<div class="avatar-btn" onclick="navigate('profile')" title="${user.name}">${user.avatar}</div>` : `<button class="btn btn-primary btn-sm" onclick="navigate('auth')">Sign In</button>`}
    </div>
  </nav>`;
}

function render(view, params = {}) {
  let content = '';
  let afterRender = () => { };

  switch (view) {
    case 'landing':
      content = renderLanding();
      break;
    case 'auth':
      content = renderAuthPage();
      afterRender = bindAuthEvents;
      break;
    case 'idea-hub':
      content = renderIdeaHub();
      afterRender = bindIdeaHubEvents;
      break;
    case 'startup':
      content = renderStartupDetail(params.id);
      afterRender = bindIdeaHubEvents;
      break;
    case 'jobs':
      content = renderJobBoard();
      afterRender = bindJobBoardEvents;
      break;
    case 'dashboard':
      content = renderDashboard();
      afterRender = bindDashboardEvents;
      break;
    case 'messages':
      content = renderMessages();
      afterRender = bindMessagesEvents;
      break;
    case 'notifications':
      content = renderNotifications();
      afterRender = bindMessagesEvents;
      break;
    case 'profile':
      content = renderProfile();
      afterRender = bindProfileEvents;
      break;
    default:
      content = renderLanding();
  }

  const nav = renderTopNav(view);
  app.innerHTML = `
    ${nav}
    <main>${content}</main>
    <div class="toast-container" id="toast-container"></div>`;

  afterRender();
  window.scrollTo(0, 0);
}

// Listen for navigation events
window.addEventListener('pb-navigate', (e) => {
  render(e.detail.view, e.detail.params);
});

// Global helpers used in HTML strings
window.showToast = showToast;
window._logout = () => {
  logout();
  showToast('Signed out successfully.', 'info');
  navigate('landing');
};
window._viewStartup = (id) => navigate('startup', { id });

// Boot
navigate(getCurrentUser() ? 'dashboard' : 'landing');

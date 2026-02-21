import { demoStartups } from '../demo-data.js';
import { scoreRing, tagColors, showToast } from '../ui.js';
import { getCurrentUser } from '../auth.js';
import { navigate } from '../router.js';

export function renderIdeaHub() {
  return `
  <div class="container">
    <div class="section-header">
      <div>
        <h2 class="section-title">💡 Idea Hub</h2>
        <p class="section-sub">AI-vetted startups seeking investment</p>
      </div>
      <div id="hub-actions"></div>
    </div>
    <div class="filters-bar">
      <input class="filter-search" placeholder="🔍 Search startups..." id="hub-search" oninput="window._hubFilter()">
      <button class="filter-btn active" data-filter="all" onclick="window._hubSector(this,'all')">All</button>
      <button class="filter-btn" data-filter="AI/ML" onclick="window._hubSector(this,'AI/ML')">🤖 AI/ML</button>
      <button class="filter-btn" data-filter="SaaS" onclick="window._hubSector(this,'SaaS')">☁️ SaaS</button>
      <button class="filter-btn" data-filter="HealthTech" onclick="window._hubSector(this,'HealthTech')">🏥 HealthTech</button>
      <button class="filter-btn" data-filter="CleanTech" onclick="window._hubSector(this,'CleanTech')">⚡ CleanTech</button>
      <button class="filter-btn" data-filter="EdTech" onclick="window._hubSector(this,'EdTech')">📚 EdTech</button>
    </div>
    <div class="grid-3" id="hub-grid">
      ${demoStartups.map(s => startupCard(s)).join('')}
    </div>
  </div>`;
}

function startupCard(s) {
  return `
  <div class="glass-card startup-card" onclick="window._viewStartup(${s.id})">
    <div class="startup-card-top">
      <div class="startup-logo" style="background:linear-gradient(135deg,${s.color}22,${s.color}44);border:1px solid ${s.color}33">${s.logo}</div>
      <div style="flex:1;min-width:0">
        <h3>${s.name}</h3>
        <p>${s.tagline}</p>
      </div>
      ${scoreRing(s.aiScore)}
    </div>
    <div class="startup-card-tags">${tagColors(s.sector)}</div>
    <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.55;margin-top:8px">${s.aiSummary.slice(0, 120)}...</p>
    <div class="startup-card-footer">
      <span class="ask-amount">Ask: ${s.askAmount}</span>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="stage-badge">${s.stage}</span>
        <span class="tag tag-blue" style="cursor:pointer">View →</span>
      </div>
    </div>
  </div>`;
}

export function renderStartupDetail(id) {
  const s = demoStartups.find(x => x.id === Number(id));
  if (!s) return `<div class="container"><div class="empty-state"><div class="empty-icon">🔍</div><p>Startup not found.</p></div></div>`;
  const user = getCurrentUser();
  return `
  <div class="container">
    <button class="btn btn-ghost btn-sm mb-24" onclick="window._goBack()">← Back to Idea Hub</button>
    <div class="detail-header glass-card" style="display:flex;align-items:flex-start;gap:24px;padding:32px">
      <div class="detail-logo" style="background:linear-gradient(135deg,${s.color}22,${s.color}44);border:1px solid ${s.color}33">${s.logo}</div>
      <div style="flex:1">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
          <div>
            <h1 class="detail-title">${s.name}</h1>
            <p class="detail-subtitle">by ${s.founder} · ${s.stage}</p>
            <div class="detail-tags">${tagColors(s.sector)}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
            ${scoreRing(s.aiScore)}
            <span style="font-size:0.72rem;color:var(--text-muted)">AI Score</span>
          </div>
        </div>
        <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap">
          ${user?.role === 'investor' ? `<button class="btn btn-primary" onclick="window._contactFounder()">💬 Message Founder</button>` : ''}
          <button class="btn btn-secondary" onclick="window._bookmarkStartup(${s.id})">🔖 Save</button>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-top:20px" class="detail-grid">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="glass-card" style="padding:24px">
          <h3 style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">🤖 AI Analysis</h3>
          <p style="color:var(--text-secondary);line-height:1.7;font-size:0.9rem">${s.aiSummary}</p>
        </div>
        <div class="glass-card" style="padding:24px">
          <div class="detail-section"><h4>❓ The Problem</h4><p>${s.problem}</p></div>
          <hr class="divider-line">
          <div class="detail-section"><h4>💡 The Solution</h4><p>${s.solution}</p></div>
          <hr class="divider-line">
          <div class="detail-section"><h4>📈 Traction</h4><p>${s.traction}</p></div>
          <hr class="divider-line">
          <div class="detail-section"><h4>🌐 Market Size</h4><p>${s.market}</p></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="glass-card" style="padding:24px">
          <h3 style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px">Deal Info</h3>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div><p style="font-size:0.75rem;color:var(--text-muted)">RAISE ASK</p><p style="font-weight:700;font-size:1.2rem;color:var(--emerald)">${s.askAmount}</p></div>
            <div><p style="font-size:0.75rem;color:var(--text-muted)">STAGE</p><p style="font-weight:600">${s.stage}</p></div>
            <div><p style="font-size:0.75rem;color:var(--text-muted)">SECTORS</p><div class="chip-row" style="margin-top:4px">${tagColors(s.sector)}</div></div>
          </div>
        </div>
        <div class="glass-card" style="padding:24px">
          <h3 style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px">Founder</h3>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:700">${s.founder.split(' ').map(w => w[0]).join('')}</div>
            <div><p style="font-weight:600;font-size:0.9rem">${s.founder}</p><p style="font-size:0.78rem;color:var(--text-muted)">${s.name}</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export function bindIdeaHubEvents() {
  let sectorFilter = 'all';

  window._hubSector = (el, sector) => {
    sectorFilter = sector;
    document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    window._hubFilter();
  };

  window._hubFilter = () => {
    const q = (document.getElementById('hub-search')?.value || '').toLowerCase();
    const grid = document.getElementById('hub-grid');
    if (!grid) return;
    const filtered = demoStartups.filter(s => {
      const matchSector = sectorFilter === 'all' || s.sector.includes(sectorFilter);
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q);
      return matchSector && matchQ;
    });
    grid.innerHTML = filtered.length ? filtered.map(s => startupCard(s)).join('') : `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><p>No startups match your filter.</p></div>`;
  };

  window._viewStartup = (id) => navigate('startup', { id });
  window._goBack = () => navigate('idea-hub');
  window._bookmarkStartup = (id) => showToast('Startup saved to your watchlist!', 'success');
  window._contactFounder = () => navigate('messages');
}

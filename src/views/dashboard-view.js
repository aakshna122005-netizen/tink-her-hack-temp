import { getCurrentUser } from '../auth.js';
import { demoStartups, demoJobs } from '../demo-data.js';
import { navigate } from '../router.js';
import { showToast } from '../ui.js';

export function renderDashboard() {
    const user = getCurrentUser();
    if (!user) return `<div class="container"><p>Not logged in.</p></div>`;
    const role = user.role;

    return `
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-user">
        <div class="sidebar-avatar">${user.avatar}</div>
        <div>
          <div class="sidebar-user-name">${user.name}</div>
          <div class="sidebar-user-role">${role === 'founder' ? '🚀 Founder' : role === 'investor' ? '💼 Investor' : '🎯 Job Seeker'}</div>
        </div>
      </div>
      <span class="sidebar-section-label">Main</span>
      <button class="sidebar-link active" onclick="window._dashTab(this,'overview')"><span class="icon">📊</span> Overview</button>
      ${role === 'founder' ? `
        <button class="sidebar-link" onclick="window._dashTab(this,'startup')"><span class="icon">🚀</span> My Startup</button>
        <button class="sidebar-link" onclick="window._dashTab(this,'jobs')"><span class="icon">💼</span> Manage Jobs</button>
        <button class="sidebar-link" onclick="window._dashTab(this,'applicants')"><span class="icon">👥</span> Applicants</button>
      ` : ''}
      ${role === 'investor' ? `
        <button class="sidebar-link" onclick="window._dashTab(this,'watchlist')"><span class="icon">🔖</span> Watchlist</button>
        <button class="sidebar-link" onclick="window._dashTab(this,'portfolio')"><span class="icon">📈</span> Portfolio</button>
      ` : ''}
      ${role === 'seeker' ? `
        <button class="sidebar-link" onclick="window._dashTab(this,'applications')"><span class="icon">📋</span> My Applications</button>
        <button class="sidebar-link" onclick="window._dashTab(this,'saved')"><span class="icon">🔖</span> Saved Jobs</button>
      ` : ''}
      <span class="sidebar-section-label">Explore</span>
      <button class="sidebar-link" onclick="navigate('idea-hub')"><span class="icon">💡</span> Idea Hub</button>
      <button class="sidebar-link" onclick="navigate('jobs')"><span class="icon">💼</span> Job Board</button>
      <button class="sidebar-link" onclick="navigate('messages')"><span class="icon">💬</span> Messages</button>
      <button class="sidebar-link" onclick="navigate('profile')"><span class="icon">👤</span> Profile</button>
    </aside>
    <div class="main-content" id="dash-content">
      ${getDashTab('overview', role, user)}
    </div>
  </div>`;
}

function getDashTab(tab, role, user) {
    if (tab === 'overview') return overviewTab(role, user);
    if (tab === 'startup') return startupTab(user);
    if (tab === 'jobs') return founderJobsTab();
    if (tab === 'applicants') return applicantsTab();
    if (tab === 'watchlist') return watchlistTab();
    if (tab === 'portfolio') return portfolioTab();
    if (tab === 'applications') return applicationsTab();
    if (tab === 'saved') return savedTab();
    return `<div class="empty-state"><div class="empty-icon">🔧</div><p>Coming soon.</p></div>`;
}

function overviewTab(role, user) {
    const stats = {
        founder: [
            { label: 'AI Score', value: '92', change: '↑ 4 this week', color: 'var(--emerald)' },
            { label: 'Profile Views', value: '248', change: '↑ 18% vs last week', color: 'var(--blue)' },
            { label: 'Investor Connects', value: '7', change: '3 new this week', color: 'var(--purple)' },
            { label: 'Open Roles', value: '2', change: '1 offer pending', color: 'var(--amber)' },
        ],
        investor: [
            { label: 'Deals Reviewed', value: '34', change: 'This month', color: 'var(--blue)' },
            { label: 'Watchlist', value: '12', change: '3 added this week', color: 'var(--emerald)' },
            { label: 'Messages Sent', value: '9', change: '5 replies received', color: 'var(--purple)' },
            { label: 'Portfolio Value', value: '$2.4M', change: '+12% this quarter', color: 'var(--amber)' },
        ],
        seeker: [
            { label: 'Applications', value: '6', change: '2 shortlisted', color: 'var(--blue)' },
            { label: 'Profile Views', value: '31', change: '↑ 8 this week', color: 'var(--emerald)' },
            { label: 'Saved Jobs', value: '14', change: '3 expiring soon', color: 'var(--amber)' },
            { label: 'Interviews', value: '2', change: 'Upcoming', color: 'var(--purple)' },
        ],
    };
    return `
    <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">👋 Welcome back, ${user.name.split(' ')[0]}!</h2>
    <div class="stats-row">
      ${(stats[role] || []).map(s => `
        <div class="stat-card">
          <span class="stat-card-label">${s.label}</span>
          <span class="stat-card-value" style="color:${s.color}">${s.value}</span>
          <span class="stat-card-change">${s.change}</span>
        </div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="glass-card" style="padding:24px">
        <h3 style="font-size:0.85rem;font-weight:700;margin-bottom:16px;color:var(--text-secondary)">TOP STARTUPS THIS WEEK</h3>
        ${demoStartups.slice(0, 3).map(s => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--glass-border);cursor:pointer" onclick="window._viewStartup(${s.id})">
            <span style="font-size:1.4rem">${s.logo}</span>
            <div style="flex:1">
              <p style="font-size:0.875rem;font-weight:600">${s.name}</p>
              <p style="font-size:0.78rem;color:var(--text-muted)">${s.stage} · ${s.askAmount}</p>
            </div>
            <span style="font-size:0.85rem;font-weight:700;color:${s.aiScore >= 85 ? 'var(--emerald)' : 'var(--blue)'}">${s.aiScore}</span>
          </div>`).join('')}
        <button class="btn btn-ghost btn-sm" style="margin-top:12px;width:100%;justify-content:center" onclick="navigate('idea-hub')">View All →</button>
      </div>
      <div class="glass-card" style="padding:24px">
        <h3 style="font-size:0.85rem;font-weight:700;margin-bottom:16px;color:var(--text-secondary)">LATEST JOBS</h3>
        ${demoJobs.slice(0, 3).map(j => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--glass-border)">
            <span style="font-size:1.4rem">${j.logo}</span>
            <div style="flex:1">
              <p style="font-size:0.875rem;font-weight:600">${j.title}</p>
              <p style="font-size:0.78rem;color:var(--text-muted)">${j.company} · ${j.salary}</p>
            </div>
          </div>`).join('')}
        <button class="btn btn-ghost btn-sm" style="margin-top:12px;width:100%;justify-content:center" onclick="navigate('jobs')">Browse All Jobs →</button>
      </div>
    </div>`;
}

function startupTab(user) {
    const s = demoStartups.find(x => x.founderId === user.id) || demoStartups[0];
    return `
    <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">🚀 My Startup</h2>
    <div class="glass-card" style="padding:28px;margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:20px;margin-bottom:20px">
        <div style="font-size:2rem;width:60px;height:60px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${s.color}22,${s.color}44);border:1px solid ${s.color}33">${s.logo}</div>
        <div>
          <h3 style="font-size:1.2rem;font-weight:700">${s.name}</h3>
          <p style="color:var(--text-secondary);font-size:0.85rem">${s.tagline}</p>
        </div>
        <div style="margin-left:auto;text-align:center">
          <div style="font-size:2rem;font-weight:800;color:var(--emerald)">${s.aiScore}</div>
          <div style="font-size:0.72rem;color:var(--text-muted)">AI Score</div>
        </div>
      </div>
      <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.7;padding:16px;background:rgba(59,130,246,0.06);border-radius:10px;border:1px solid rgba(59,130,246,0.15)">${s.aiSummary}</p>
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" onclick="showToast('Edit form coming soon!','info')">✏️ Edit Profile</button>
        <button class="btn btn-primary btn-sm" onclick="navigate('idea-hub')">View in Idea Hub →</button>
      </div>
    </div>`;
}

function founderJobsTab() {
    return `<h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">💼 My Job Listings</h2>
    ${demoJobs.slice(0, 2).map(j => `
      <div class="glass-card" style="padding:20px;margin-bottom:12px;display:flex;align-items:center;gap:16px">
        <span style="font-size:1.8rem">${j.logo}</span>
        <div style="flex:1">
          <p style="font-weight:600">${j.title}</p>
          <p style="font-size:0.8rem;color:var(--text-muted)">${j.applicants} applicants · Posted ${j.posted}</p>
        </div>
        <span class="tag tag-emerald">Active</span>
      </div>`).join('')}
    <button class="btn btn-primary btn-sm" onclick="showToast('Post job form coming soon!','info')">+ Post New Role</button>`;
}

function applicantsTab() {
    const names = [['Priya Nair', 'PN', 'Senior Dev', '3–5 years', 'Shortlisted'], ['Arjun Mehta', 'AM', 'Full-Stack Eng', '5–8 years', 'Under Review'], ['Kavya S.', 'KS', 'Backend Dev', '1–3 years', 'Applied']];
    return `<h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">👥 Applicants</h2>
    ${names.map(([name, av, role, exp, status]) => `
      <div class="glass-card" style="padding:16px 20px;margin-bottom:10px;display:flex;align-items:center;gap:14px">
        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem">${av}</div>
        <div style="flex:1"><p style="font-weight:600;font-size:0.9rem">${name}</p><p style="font-size:0.78rem;color:var(--text-muted)">${role} · ${exp}</p></div>
        <span class="tag ${status === 'Shortlisted' ? 'tag-emerald' : status === 'Under Review' ? 'tag-blue' : 'tag-purple'}">${status}</span>
        <div style="display:flex;gap:6px">
          <button class="btn btn-emerald btn-sm" onclick="showToast('${name} shortlisted!','success')">✓</button>
          <button class="btn btn-ghost btn-sm" onclick="showToast('${name} rejected.','error')">✗</button>
        </div>
      </div>`).join('')}`;
}

function watchlistTab() {
    return `<h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">🔖 Watchlist</h2>
    ${demoStartups.slice(0, 4).map(s => `
      <div class="glass-card" style="padding:16px 20px;margin-bottom:10px;display:flex;align-items:center;gap:14px;cursor:pointer" onclick="window._viewStartup(${s.id})">
        <span style="font-size:1.6rem">${s.logo}</span>
        <div style="flex:1"><p style="font-weight:600">${s.name}</p><p style="font-size:0.78rem;color:var(--text-muted)">${s.stage} · ${s.askAmount}</p></div>
        <div style="font-weight:700;color:${s.aiScore >= 85 ? 'var(--emerald)' : 'var(--blue)'}">AI ${s.aiScore}</div>
        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();navigate('messages')">Message</button>
      </div>`).join('')}`;
}

function portfolioTab() {
    return `<h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">📈 Portfolio</h2>
    <div class="glass-card" style="padding:24px;margin-bottom:16px">
      <p style="color:var(--text-secondary);font-size:0.9rem">Track your active investments here. Connect your deals to see live portfolio metrics.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px">
        <div style="text-align:center"><p style="font-size:1.5rem;font-weight:800;color:var(--emerald)">$2.4M</p><p style="font-size:0.78rem;color:var(--text-muted)">Deployed</p></div>
        <div style="text-align:center"><p style="font-size:1.5rem;font-weight:800;color:var(--blue)">7</p><p style="font-size:0.78rem;color:var(--text-muted)">Portfolio Companies</p></div>
        <div style="text-align:center"><p style="font-size:1.5rem;font-weight:800;color:var(--purple)">3.2x</p><p style="font-size:0.78rem;color:var(--text-muted)">Avg. MOIC</p></div>
      </div>
    </div>`;
}

function applicationsTab() {
    const apps = [
        { job: 'Senior Full-Stack Engineer', company: 'NeuralNest AI', logo: '🧠', status: 'Shortlisted', date: 'Jan 18' },
        { job: 'ML Engineer', company: 'MediScan Pro', logo: '🏥', status: 'Under Review', date: 'Jan 15' },
        { job: 'Growth Marketer', company: 'SkillBridge', logo: '📚', status: 'Applied', date: 'Jan 12' },
    ];
    return `<h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">📋 My Applications</h2>
    ${apps.map(a => `
      <div class="glass-card" style="padding:16px 20px;margin-bottom:10px;display:flex;align-items:center;gap:14px">
        <span style="font-size:1.6rem">${a.logo}</span>
        <div style="flex:1"><p style="font-weight:600">${a.job}</p><p style="font-size:0.78rem;color:var(--text-muted)">${a.company} · Applied ${a.date}</p></div>
        <span class="tag ${a.status === 'Shortlisted' ? 'tag-emerald' : a.status === 'Under Review' ? 'tag-blue' : 'tag-purple'}">${a.status}</span>
      </div>`).join('')}`;
}

function savedTab() {
    return `<h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">🔖 Saved Jobs</h2>
    ${demoJobs.slice(1, 4).map(j => `
      <div class="glass-card" style="padding:16px 20px;margin-bottom:10px;display:flex;align-items:center;gap:14px">
        <span style="font-size:1.6rem">${j.logo}</span>
        <div style="flex:1"><p style="font-weight:600">${j.title}</p><p style="font-size:0.78rem;color:var(--text-muted)">${j.company} · ${j.salary}</p></div>
        <button class="btn btn-primary btn-sm" onclick="window._openApply(${j.id})">Apply</button>
      </div>`).join('')}`;
}

export function bindDashboardEvents() {
    const user = getCurrentUser();

    window._dashTab = (el, tab) => {
        document.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
        const content = document.getElementById('dash-content');
        if (content) content.innerHTML = getDashTab(tab, user?.role, user);
    };

    window._viewStartup = (id) => navigate('startup', { id });
    window.navigate = navigate;
    window.showToast = showToast;
}

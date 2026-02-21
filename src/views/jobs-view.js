import { demoJobs } from '../demo-data.js';
import { tagColors, showToast } from '../ui.js';
import { getCurrentUser } from '../auth.js';
import { navigate } from '../router.js';
import { openModal, closeModal } from '../ui.js';

export function renderJobBoard() {
  return `
  <div class="container">
    <div class="section-header">
      <div>
        <h2 class="section-title">💼 Job Board</h2>
        <p class="section-sub">${demoJobs.length} open roles at top startups</p>
      </div>
      <div id="job-post-btn-area"></div>
    </div>
    <div class="filters-bar">
      <input class="filter-search" placeholder="🔍  Search roles, companies..." id="job-search" oninput="window._jobFilter()">
      <button class="filter-btn active" data-jf="all" onclick="window._jobType(this,'all')">All</button>
      <button class="filter-btn" data-jf="Engineering" onclick="window._jobType(this,'Engineering')">⚙️ Engineering</button>
      <button class="filter-btn" data-jf="Design" onclick="window._jobType(this,'Design')">🎨 Design</button>
      <button class="filter-btn" data-jf="Marketing" onclick="window._jobType(this,'Marketing')">📣 Marketing</button>
      <button class="filter-btn" data-jf="Hardware" onclick="window._jobType(this,'Hardware')">🔧 Hardware</button>
    </div>
    <div class="grid-2" id="job-grid">
      ${demoJobs.map(j => jobCard(j)).join('')}
    </div>
  </div>

  <!-- Apply Modal -->
  <div class="modal-overlay" id="apply-modal">
    <div class="modal">
      <div class="modal-header">
        <h3>Apply for Role</h3>
        <button class="modal-close" onclick="window._closeApply()">✕</button>
      </div>
      <div class="modal-body">
        <div id="apply-job-info" style="padding:12px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:10px;margin-bottom:20px"></div>
        <div class="input-group mb-16">
          <label class="input-label">Cover Note</label>
          <textarea class="input-field" id="apply-cover" placeholder="Why are you excited about this role? (3-4 sentences)"></textarea>
        </div>
        <div class="input-group mb-16">
          <label class="input-label">Years of Experience</label>
          <select class="input-field" id="apply-exp">
            <option>0–1 years</option><option>1–3 years</option><option>3–5 years</option><option>5–8 years</option><option>8+ years</option>
          </select>
        </div>
        <div class="input-group mb-16">
          <label class="input-label">Resume / LinkedIn URL</label>
          <input class="input-field" id="apply-resume" placeholder="https://linkedin.com/in/yourprofile">
        </div>
        <div class="input-group">
          <label class="input-label">Portfolio / GitHub (Optional)</label>
          <input class="input-field" id="apply-portfolio" placeholder="https://github.com/yourhandle">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="window._closeApply()">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="window._submitApply()">Submit Application 🚀</button>
      </div>
    </div>
  </div>`;
}

function jobCard(j) {
  const techTypes = ['React', 'Node.js', 'Python', 'PyTorch', 'Figma', 'Framer'];
  const isTech = j.stack.some(s => techTypes.includes(s));
  const label = isTech ? 'Engineering' : j.stack.includes('Figma') || j.stack.includes('Framer') ? 'Design' : j.stack.includes('Meta Ads') ? 'Marketing' : 'Hardware';
  return `
  <div class="glass-card job-card" data-type="${label}">
    <div class="job-card-top">
      <div class="job-logo">${j.logo}</div>
      <div style="flex:1;min-width:0">
        <h3>${j.title}</h3>
        <p style="font-size:0.82rem;color:var(--text-secondary);margin-top:2px">${j.company}</p>
        <div class="job-meta">
          <span class="job-meta-item">📍 ${j.location}</span>
          <span class="job-meta-item">⏱️ ${j.type}</span>
          <span class="job-meta-item">📅 ${j.posted}</span>
        </div>
      </div>
    </div>
    <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.55;margin-bottom:12px">${j.description.slice(0, 130)}...</p>
    <div class="job-card-tags">${tagColors(j.stack.slice(0, 4))}</div>
    <div class="job-card-footer">
      <div>
        <span class="salary-text">${j.salary}</span>
        <span style="font-size:0.75rem;color:var(--emerald);margin-left:8px">+ ${j.equity} equity</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="applicant-count">👥 ${j.applicants} applicants</span>
        <button class="btn btn-primary btn-sm" onclick="window._openApply(${j.id})">Apply</button>
      </div>
    </div>
  </div>`;
}

export function bindJobBoardEvents() {
  let typeFilter = 'all';

  // Add post job button for founders
  const user = getCurrentUser();
  const area = document.getElementById('job-post-btn-area');
  if (area && user?.role === 'founder') {
    area.innerHTML = `<button class="btn btn-primary" onclick="window._postJob()">+ Post a Job</button>`;
  }

  window._jobType = (el, type) => {
    typeFilter = type;
    document.querySelectorAll('.filter-btn[data-jf]').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    window._jobFilter();
  };

  window._jobFilter = () => {
    const q = (document.getElementById('job-search')?.value || '').toLowerCase();
    const grid = document.getElementById('job-grid');
    if (!grid) return;
    const filtered = demoJobs.filter(j => {
      const matchType = typeFilter === 'all' || j.stack.some(s => {
        if (typeFilter === 'Engineering') return ['React', 'Node.js', 'Python', 'PyTorch', 'PostgreSQL', 'Docker', 'AWS SageMaker'].includes(s);
        if (typeFilter === 'Design') return ['Figma', 'Framer', 'CSS', 'Design Systems'].includes(s);
        if (typeFilter === 'Marketing') return ['Meta Ads', 'Google Analytics', 'SQL', 'Content Strategy'].includes(s);
        if (typeFilter === 'Hardware') return ['ESP32', 'MQTT', 'LoRaWAN', 'Embedded C', 'PCB Design'].includes(s);
        return true;
      });
      const matchQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.stack.join(' ').toLowerCase().includes(q);
      return matchType && matchQ;
    });
    grid.innerHTML = filtered.length ? filtered.map(j => jobCard(j)).join('') : `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><p>No jobs match your filter.</p></div>`;
  };

  window._openApply = (id) => {
    const u = getCurrentUser();
    if (!u) { showToast('Please sign in to apply.', 'error'); navigate('auth'); return; }
    const job = demoJobs.find(j => j.id === id);
    const info = document.getElementById('apply-job-info');
    if (info && job) info.innerHTML = `<strong>${job.title}</strong> at <span style="color:var(--blue)">${job.company}</span> · <span style="color:var(--emerald)">${job.salary}</span>`;
    openModal('apply-modal');
  };

  window._closeApply = () => closeModal('apply-modal');

  window._submitApply = () => {
    const cover = document.getElementById('apply-cover')?.value;
    if (!cover || cover.length < 20) { showToast('Please write a cover note (min 20 chars).', 'error'); return; }
    closeModal('apply-modal');
    showToast('Application submitted! You\'ll get real-time updates. 🚀', 'success');
  };

  window._postJob = () => showToast('Job posting form coming soon!', 'info');
}

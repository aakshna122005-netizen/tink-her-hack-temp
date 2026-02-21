// ===== UI Utilities =====

export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || '✅'}</span><span class="toast-text">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

export function openModal(id) {
    document.getElementById(id)?.classList.add('open');
}

export function closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
}

export function scoreRing(score) {
    const pct = Math.round(score * 3.6);
    const cls = score >= 85 ? 'score-high' : score >= 65 ? 'score-mid' : 'score-low';
    return `
    <div class="ai-score-ring ${cls}" style="--pct:${pct}deg">
      <div class="score-inner">
        <span style="font-size:0.95rem;font-weight:800">${score}</span>
        <span style="font-size:0.55rem;color:var(--text-muted);margin-top:1px">AI</span>
      </div>
    </div>`;
}

export function tagColors(tags) {
    const colors = ['tag-blue', 'tag-emerald', 'tag-purple', 'tag-amber', 'tag-pink'];
    return tags.map((t, i) => `<span class="tag ${colors[i % colors.length]}">${t}</span>`).join('');
}

export function avatarEl(initials, size = 40) {
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-size:${Math.round(size * 0.3)}px;font-weight:700;flex-shrink:0">${initials}</div>`;
}

export function formatDate(daysAgo) { return daysAgo; }

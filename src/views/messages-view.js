import { demoMessages, demoNotifications } from '../demo-data.js';
import { showToast, openModal, closeModal } from '../ui.js';

export function renderMessages() {
    return `
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">💬 Messages</h2><p class="section-sub">Direct conversations with your network</p></div>
    </div>
    <div style="display:grid;grid-template-columns:320px 1fr;gap:0;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius);overflow:hidden;min-height:500px">
      <div style="border-right:1px solid var(--glass-border);padding:16px">
        <div style="margin-bottom:12px">
          <input class="filter-search" placeholder="🔍 Search conversations..." style="width:100%;border-radius:var(--radius-sm);padding:10px 16px">
        </div>
        <div class="panel-list" id="msg-list">
          ${demoMessages.map((m, i) => `
          <div class="panel-item ${m.unread ? 'unread' : ''}" onclick="window._openChat(${i})">
            <div class="msg-avatar">${m.avatar}</div>
            <div class="msg-body">
              <div class="msg-name">${m.from}</div>
              <div class="msg-text">${m.text}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
              <span class="msg-time">${m.time}</span>
              ${m.unread ? '<div class="unread-dot"></div>' : ''}
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div id="chat-window" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:16px">💬</div>
        <p style="font-size:0.9rem">Select a conversation to start chatting</p>
      </div>
    </div>
  </div>`;
}

export function renderNotifications() {
    return `
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">🔔 Notifications</h2><p class="section-sub">${demoNotifications.filter(n => n.unread).length} unread</p></div>
      <button class="btn btn-ghost btn-sm" onclick="window._markAllRead()">Mark all read</button>
    </div>
    <div class="glass-card" style="overflow:hidden">
      <div class="panel-list" id="notif-list">
        ${demoNotifications.map((n, i) => `
        <div class="panel-item ${n.unread ? 'unread' : ''}" style="border-bottom:1px solid var(--glass-border)" onclick="window._readNotif(${i},this)">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--glass-bg);border:1px solid var(--glass-border);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">${n.icon}</div>
          <div class="msg-body">
            <div class="msg-name">${n.text}</div>
            <div class="msg-time" style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">${n.time}</div>
          </div>
          ${n.unread ? '<div class="unread-dot"></div>' : ''}
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

export function bindMessagesEvents() {
    const chatMessages = [
        ['Sounds great! Let\'s schedule a call. What works for you this week?', '10:35 AM'],
        ['I\'ve been following NeuralNest since you launched — very impressive traction for 3 months.', '10:40 AM'],
        ['Friday 4pm IST works for me. I\'ll send a Google Meet invite.', '10:52 AM'],
    ];

    window._openChat = (idx) => {
        const m = demoMessages[idx];
        const chat = document.getElementById('chat-window');
        if (!chat) return;
        chat.style.alignItems = 'stretch';
        chat.style.justifyContent = 'flex-start';
        chat.style.padding = '0';
        chat.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--glass-border)">
        <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem">${m.avatar}</div>
        <div><p style="font-weight:600;font-size:0.9rem">${m.from}</p><p style="font-size:0.75rem;color:var(--emerald)">● Online</p></div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px">
        <div style="align-self:flex-start;max-width:70%;background:var(--bg-secondary);border:1px solid var(--glass-border);border-radius:12px 12px 12px 4px;padding:12px 16px">
          <p style="font-size:0.875rem">${m.text}</p>
          <p style="font-size:0.7rem;color:var(--text-muted);margin-top:6px">${m.time}</p>
        </div>
        ${chatMessages.map(([txt, t]) => `
          <div style="align-self:flex-start;max-width:70%;background:var(--bg-secondary);border:1px solid var(--glass-border);border-radius:12px 12px 12px 4px;padding:12px 16px">
            <p style="font-size:0.875rem">${txt}</p>
            <p style="font-size:0.7rem;color:var(--text-muted);margin-top:6px">${t}</p>
          </div>`).join('')}
      </div>
      <div style="padding:16px;border-top:1px solid var(--glass-border);display:flex;gap:10px">
        <input class="input-field" id="chat-input" placeholder="Type a message..." style="flex:1;border-radius:99px;padding:10px 18px" onkeydown="if(event.key==='Enter')window._sendMsg()">
        <button class="btn btn-primary btn-sm" style="border-radius:99px;padding:10px 18px" onclick="window._sendMsg()">Send ↗</button>
      </div>`;
    };

    window._sendMsg = () => {
        const inp = document.getElementById('chat-input');
        const val = inp?.value.trim();
        if (!val) return;
        const container = inp.closest('[style*="flex-direction:column"]')?.querySelector('[style*="overflow-y:auto"]');
        if (container) {
            const el = document.createElement('div');
            el.style.cssText = 'align-self:flex-end;max-width:70%;background:linear-gradient(135deg,var(--blue),#1D4ED8);border-radius:12px 12px 4px 12px;padding:12px 16px';
            el.innerHTML = `<p style="font-size:0.875rem;color:white">${val}</p><p style="font-size:0.7rem;color:rgba(255,255,255,0.6);margin-top:6px">Just now</p>`;
            container.appendChild(el);
            container.scrollTop = container.scrollHeight;
        }
        inp.value = '';
        setTimeout(() => showToast('Message sent!', 'success'), 200);
    };

    window._readNotif = (idx, el) => {
        el.classList.remove('unread');
        const dot = el.querySelector('.unread-dot');
        if (dot) dot.remove();
    };

    window._markAllRead = () => {
        document.querySelectorAll('.panel-item.unread').forEach(el => {
            el.classList.remove('unread');
            el.querySelector('.unread-dot')?.remove();
        });
        showToast('All notifications marked as read.', 'success');
    };
}

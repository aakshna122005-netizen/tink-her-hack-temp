import { login, demoLogin, register } from '../auth.js';
import { showToast } from '../ui.js';
import { navigate } from '../router.js';

export function renderAuthPage() {
  return `
  <div class="auth-page" id="page-auth">
    <div class="auth-box">
      <div class="auth-logo">
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:6px">
          <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--blue),var(--emerald));display:flex;align-items:center;justify-content:center;font-size:1.3rem">🌉</div>
          <span class="brand" style="font-size:1.8rem;font-weight:800;background:linear-gradient(135deg,var(--blue),var(--emerald));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">PitchBridge</span>
        </div>
        <p style="color:var(--text-muted);font-size:0.85rem">Connect. Pitch. Build the Future.</p>
      </div>

      <div class="auth-tabs">
        <button class="auth-tab active" id="tab-login" onclick="window._authTab('login')">Sign In</button>
        <button class="auth-tab" id="tab-register" onclick="window._authTab('register')">Register</button>
      </div>

      <div id="auth-demo-section">
        <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:10px;text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Quick Demo Access</p>
        <div class="demo-login-grid">
          <button class="demo-login-btn" onclick="window._demoLogin('founder')">
            <span class="demo-icon">🚀</span>Founder
          </button>
          <button class="demo-login-btn" onclick="window._demoLogin('investor')">
            <span class="demo-icon">💼</span>Investor
          </button>
          <button class="demo-login-btn" onclick="window._demoLogin('seeker')">
            <span class="demo-icon">🎯</span>Job Seeker
          </button>
        </div>
        <div class="divider">or sign in manually</div>
      </div>

      <div id="auth-login-form">
        <div class="input-group mb-16">
          <label class="input-label">Email</label>
          <input class="input-field" type="email" id="login-email" placeholder="you@example.com" value="founder@demo.com">
        </div>
        <div class="input-group mb-16">
          <label class="input-label">Password</label>
          <input class="input-field" type="password" id="login-password" placeholder="••••••••" value="demo123">
        </div>
        <button class="btn btn-primary w-full" style="justify-content:center" onclick="window._loginSubmit()">Sign In →</button>
      </div>

      <div id="auth-register-form" style="display:none">
        <div class="input-group mb-16">
          <label class="input-label">Full Name</label>
          <input class="input-field" type="text" id="reg-name" placeholder="Your name">
        </div>
        <div class="input-group mb-16">
          <label class="input-label">Email</label>
          <input class="input-field" type="email" id="reg-email" placeholder="you@example.com">
        </div>
        <div class="input-group mb-16">
          <label class="input-label">Password</label>
          <input class="input-field" type="password" id="reg-password" placeholder="Min 6 characters">
        </div>
        <div class="input-group mb-16">
          <label class="input-label">I am a...</label>
          <div class="role-selector">
            <button class="role-btn active" data-role="founder" onclick="window._setRole(this,'founder')"><span class="role-icon">🚀</span>Founder</button>
            <button class="role-btn" data-role="investor" onclick="window._setRole(this,'investor')"><span class="role-icon">💼</span>Investor</button>
            <button class="role-btn" data-role="seeker" onclick="window._setRole(this,'seeker')"><span class="role-icon">🎯</span>Job Seeker</button>
          </div>
        </div>
        <button class="btn btn-primary w-full" style="justify-content:center" onclick="window._registerSubmit()">Create Account →</button>
      </div>

      <p style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:20px">
        Demo credentials: <strong style="color:var(--blue)">founder@demo.com</strong> / <strong style="color:var(--blue)">demo123</strong>
      </p>
    </div>
  </div>`;
}

export function bindAuthEvents() {
  let selectedRole = 'founder';

  window._authTab = (tab) => {
    const isLogin = tab === 'login';
    document.getElementById('tab-login').classList.toggle('active', isLogin);
    document.getElementById('tab-register').classList.toggle('active', !isLogin);
    document.getElementById('auth-login-form').style.display = isLogin ? 'block' : 'none';
    document.getElementById('auth-register-form').style.display = isLogin ? 'none' : 'block';
    document.getElementById('auth-demo-section').style.display = isLogin ? 'block' : 'none';
  };

  window._demoLogin = (role) => {
    const result = demoLogin(role);
    if (result.ok) {
      showToast(`Welcome, ${result.user.name}! 🎉`, 'success');
      navigate('dashboard');
    }
  };

  window._loginSubmit = () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const result = login(email, password);
    if (result.ok) {
      showToast(`Welcome back, ${result.user.name}!`, 'success');
      navigate('dashboard');
    } else {
      showToast(result.error, 'error');
    }
  };

  window._setRole = (el, role) => {
    selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
  };

  window._registerSubmit = () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const result = register(name, email, password, selectedRole);
    if (result.ok) navigate('dashboard');
    else showToast(result.error, 'error');
  };
}

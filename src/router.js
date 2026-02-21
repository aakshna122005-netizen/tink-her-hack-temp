// ===== PitchBridge SPA Router =====
import { getCurrentUser } from './auth.js';

let currentView = null;
let currentParams = {};

const privateRoutes = ['dashboard', 'profile', 'messages', 'notifications'];

export function navigate(view, params = {}) {
    currentView = view;
    currentParams = params;
    const user = getCurrentUser();
    if (privateRoutes.includes(view) && !user) {
        currentView = 'auth';
    }
    window.dispatchEvent(new CustomEvent('pb-navigate', { detail: { view: currentView, params } }));
}

export function getParams() { return currentParams; }

export function getCurrentView() { return currentView; }

// expose globally for onclick handlers in HTML strings
window.navigate = navigate;

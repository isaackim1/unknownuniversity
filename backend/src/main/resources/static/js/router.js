/* =============================================================================
   router.js — hash router with auth + prerequisite gating.
   Hash routing is used deliberately: deep links / refresh always resolve to
   index.html and never collide with the server's ignored paths (/api/*, /app/*).
   ============================================================================= */
import { isAuthed } from './state.js';
import * as api from './api.js';
import { renderShell, mountShell } from './views/shell.js';
import gate from './views/gate.js';

import landing from './views/landing.js';
import intake from './views/intake.js';
import dashboard from './views/dashboard.js';
import lesson from './views/lesson.js';
import submit from './views/submit.js';
import feedforward from './views/feedforward.js';
import archive from './views/archive.js';

const APP_VIEWS = {
  '/dashboard': dashboard,
  '/intake': intake,
  '/lesson': lesson,
  '/submit': submit,
  '/feedforward': feedforward,
  '/archive': archive,
};

const app = () => document.getElementById('app');

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  return raw.split('?')[0] || '/';
}

/** Redirect helper that always triggers a render. */
function go(path) {
  if (location.hash === '#' + path) {
    render();
  } else {
    location.hash = '#' + path;
  }
}

async function mountMarketing(view) {
  const node = app();
  node.removeAttribute('class');
  const v = await view();
  node.innerHTML = v.html;
  v.onMount?.();
  window.scrollTo(0, 0);
}

async function mountAppRoute(path, view) {
  const v = await view();
  app().innerHTML = renderShell(path, v.html);
  mountShell(path);
  v.onMount?.();
  document.querySelector('.content')?.scrollTo?.(0, 0);
  window.scrollTo(0, 0);
}

export async function render() {
  const path = parseHash();

  // Public marketing route.
  if (path === '/') return mountMarketing(landing);

  const view = APP_VIEWS[path];
  if (!view) return go('/dashboard');

  // Auth gate.
  if (!isAuthed()) {
    const g = gate(path);
    app().removeAttribute('class');
    app().innerHTML = g.html;
    g.onMount?.();
    return;
  }

  // Prerequisite gating for the coaching loop.
  if (path !== '/intake' && !api.hasProject()) return go('/intake');
  if (path === '/feedforward' && api.getSubmissions().length === 0) return go('/submit');

  return mountAppRoute(path, view);
}

export function startRouter() {
  window.addEventListener('hashchange', render);
  render();
}

export { go };

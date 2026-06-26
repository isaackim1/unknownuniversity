/* =============================================================================
   shell.js — authenticated app chrome (sidebar + topbar)
   ============================================================================= */
import { getCtx, userName, userRole } from '../state.js';
import * as api from '../api.js';
import { esc, initials, badge } from '../components.js';

const NAV = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/intake', label: 'Intake' },
  { path: '/lesson', label: 'Expert feedback' },
  { path: '/submit', label: 'Submit work' },
  { path: '/feedforward', label: 'Feed-forward' },
  { path: '/archive', label: 'Archive' },
];

const CRUMB = {
  '/dashboard': 'Dashboard',
  '/intake': 'Intake',
  '/lesson': 'Expert feedback',
  '/submit': 'Submit work-in-progress',
  '/feedforward': 'Feed-forward',
  '/archive': 'Project archive',
};

export function renderShell(active, content) {
  const project = api.getProject();
  const mod = api.getModule();
  const readiness = api.getReadiness();

  const navLinks = NAV.map((n) => `
    <a class="nav__link ${n.path === active ? 'is-active' : ''}" href="#${n.path}">
      <span class="nav__dot"></span> ${esc(n.label)}
    </a>`).join('');

  const modules = `
    <a class="nav__link is-active" href="#/dashboard"><span class="nav__dot"></span> Problem Validation</a>
    <span class="nav__link ${mod.unlocked ? '' : 'is-locked'}" aria-disabled="${!mod.unlocked}">
      <span class="nav__dot"></span> Customer Discovery <span class="nav__lock">${mod.unlocked ? '' : '🔒'}</span>
    </span>
    <span class="nav__link is-locked" aria-disabled="true">
      <span class="nav__dot"></span> Value Proposition <span class="nav__lock">🔒</span>
    </span>`;

  const ventureBlock = project ? `
    <div class="sidebar__venture">
      <div class="sidebar__venture-name">${esc(project.name)}</div>
      <div class="sidebar__venture-meta">${esc(userName())} · ${esc(stageWord(project.stage))} stage</div>
    </div>` : '';

  return `
  <div class="shell">
    <div class="scrim" data-scrim></div>
    <aside class="sidebar" aria-label="Coaching navigation" data-sidebar>
      <div class="brand">
        <div class="brand__mark">U</div>
        <div>
          <div class="brand__title">Unknown</div>
          <div class="brand__sub">Your 24/7 business coach</div>
        </div>
      </div>
      <div class="nav-label">Coaching loop</div>
      <nav class="nav">${navLinks}</nav>
      <div class="nav-label">Modules</div>
      <nav class="nav">${modules}</nav>
      ${ventureBlock}
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="u-flex u-center u-gap-3">
          <button class="menu-toggle" data-menu aria-label="Open navigation">☰</button>
          <div class="topbar__crumb">Module 1 · <strong>${esc(CRUMB[active] || 'Problem Validation')}</strong></div>
        </div>
        <div class="topbar__actions">
          ${readiness.status !== 'pending' ? badge(readiness.status) : '<span class="badge badge--neutral">Intake</span>'}
          <div class="topbar__user">
            <span class="avatar" aria-hidden="true">${initials(userName())}</span>
            <span class="u-col">
              <span class="topbar__user-name">${esc(userName())}</span>
              <span class="topbar__user-role">${esc(userRole())}</span>
            </span>
          </div>
          <a class="btn btn--ghost btn--sm" href="${api.logoutUrl()}" data-signout>Sign out</a>
        </div>
      </header>
      <main class="content" id="view">${content}</main>
    </div>
  </div>`;
}

export function mountShell() {
  const sidebar = document.querySelector('[data-sidebar]');
  const scrim = document.querySelector('[data-scrim]');
  const toggle = document.querySelector('[data-menu]');
  const open = () => { sidebar?.classList.add('is-open'); scrim?.classList.add('is-open'); };
  const close = () => { sidebar?.classList.remove('is-open'); scrim?.classList.remove('is-open'); };
  toggle?.addEventListener('click', open);
  scrim?.addEventListener('click', close);
  sidebar?.querySelectorAll('a.nav__link').forEach((a) => a.addEventListener('click', close));

  // Demo mode signs out by clearing the flag and returning home.
  const signout = document.querySelector('[data-signout]');
  if (getCtx().demo && signout) {
    signout.addEventListener('click', (e) => { e.preventDefault(); getCtx().demo = false; location.hash = '#/'; });
  }
}

function stageWord(stage) {
  return { idea: 'Idea', prototype: 'Prototype', testing: 'Testing', iteration: 'Iteration', final: 'Final' }[stage] || 'Idea';
}

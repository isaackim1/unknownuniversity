/* =============================================================================
   state.js — minimal app context (session + ephemeral UI state)
   ============================================================================= */

const ctx = {
  session: { authenticated: false },
  demo: false,            // "preview the app without signing in" (clearly labelled)
  sidebarOpen: false,
};

export function getCtx() { return ctx; }

export function setSession(session) { ctx.session = session || { authenticated: false }; }

export function isAuthed() { return ctx.session.authenticated || ctx.demo; }

export function userName() {
  return ctx.session.name || ctx.session.email || (ctx.demo ? 'Guest founder' : 'You');
}

export function userRole() {
  return ctx.session.role || (ctx.demo ? 'Preview' : 'Founder');
}

export function enableDemo() { ctx.demo = true; }

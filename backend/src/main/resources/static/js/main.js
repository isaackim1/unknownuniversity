/* =============================================================================
   main.js — bootstrap. Loads the real session, then starts the router.
   ============================================================================= */
import { fetchSession, setCoachName } from './api.js';
import { setSession } from './state.js';
import { startRouter } from './router.js';

async function boot() {
  const session = await fetchSession();
  setSession(session);
  if (session.authenticated && session.name) setCoachName(session.name);

  // Surface a login error redirected back from the OIDC callback.
  if (location.search.includes('login_error=1')) {
    history.replaceState(null, '', location.pathname + location.hash);
  }

  if (!location.hash) location.hash = '#/';
  startRouter();
}

boot();

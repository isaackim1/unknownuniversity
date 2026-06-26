/* =============================================================================
   gate.js — shown when an app route is hit without a session (401).
   Offers the real sign-in, plus a clearly-labelled no-auth preview so the
   coaching screens stay reviewable when OIDC isn't configured locally.
   ============================================================================= */
import * as api from '../api.js';
import { enableDemo } from '../state.js';

export default function gate(returnTo = '/dashboard') {
  const html = `
    <div class="gate">
      <div class="card card--pad-lg gate__card">
        <div class="brand" style="justify-content:center">
          <div class="brand__mark" style="background:var(--c-ink);color:var(--c-paper)">U</div>
        </div>
        <div class="eyebrow" style="margin-top:8px">Members only</div>
        <h1 style="margin-top:8px">Sign in to enter your coaching loop</h1>
        <p>Your venture, submissions, and feed-forward history live behind your Unknown University account. Sign in to pick up where you left off.</p>
        <div class="u-col u-gap-3" style="margin-top:24px">
          <a class="btn btn--coral btn--lg btn--block" href="${api.loginUrl(returnTo)}">Sign in to continue</a>
          <button class="btn btn--secondary btn--block" data-demo type="button">Preview the app without signing in</button>
        </div>
        <p class="field-hint" style="margin-top:16px">Preview mode uses sample data on this device only — nothing is saved to your account.</p>
        <a class="btn btn--ghost btn--sm u-mt-4" href="#/">← Back to home</a>
      </div>
    </div>`;

  function onMount() {
    document.querySelector('[data-demo]')?.addEventListener('click', () => {
      enableDemo();
      location.hash = '#' + returnTo;
      // hashchange won't fire if identical; force a re-render:
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
  }

  return { html, onMount };
}

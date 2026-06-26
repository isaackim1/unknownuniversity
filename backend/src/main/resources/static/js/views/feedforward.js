/* =============================================================================
   feedforward.js — the readiness call. Renders No-go / Almost / Go with named
   rubric gaps, a continuity reference, and one concrete next action.
   ============================================================================= */
import * as api from '../api.js';
import { userName } from '../state.js';
import {
  esc, ring, badge, statusMeta, rubricRows, nextAction, when,
} from '../components.js';

export default function feedforward() {
  const subs = api.getSubmissions();
  const sub = subs[subs.length - 1];
  const fb = sub.feedback;
  const m = statusMeta(fb.status);
  const first = (userName() || 'there').split(' ')[0];
  const go = fb.status === 'ready';

  const callHeadline = go
    ? 'Readiness call: Go'
    : fb.status === 'almost_ready' ? 'Readiness call: Almost' : 'Readiness call: No-go';

  const html = `
    <div class="page-head u-flex u-between u-wrap u-gap-4" style="align-items:flex-start">
      <div>
        <span class="eyebrow">Feed-forward · iteration ${sub.iteration}</span>
        <h1 class="page-head__title">${esc(callHeadline)}</h1>
        <p class="page-head__sub">I coach, I don't lecture. Everything below is tied to ${esc(api.getProject().name)} and ends with one concrete next action.</p>
      </div>
      <span class="badge ${m.badge} badge--lg">${esc(m.label)}</span>
    </div>

    <div class="grid-split">
      <div class="feed">
        <!-- Founder submission -->
        <div class="feed-block feed-block--user">
          <div class="feed-avatar feed-avatar--founder">${esc((first[0] || 'Y').toUpperCase())}</div>
          <div class="feed-bubble feed-bubble--user-msg">
            <p>Submitted iteration ${sub.iteration}.</p>
            <p class="u-faint" style="margin-top:8px;white-space:pre-wrap;font-size:var(--fs-14)">${esc(preview(sub.text))}</p>
          </div>
        </div>

        <!-- Coach feed-forward -->
        <div class="feed-block">
          <div class="feed-avatar feed-avatar--coach">U</div>
          <div class="feed-bubble ${m.bubble}">
            <h4>${esc(callHeadline)}</h4>
            <p>${esc(fb.specificFeedback)}</p>

            ${fb.strengths.length ? `
              <p style="font-weight:var(--fw-semibold);margin-top:16px;font-size:var(--fs-13);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--c-ink-muted)">What's working</p>
              <ul>${fb.strengths.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}

            <p style="font-weight:var(--fw-semibold);margin-top:16px;font-size:var(--fs-13);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--c-ink-muted)">${go ? 'Rubric — all clear' : 'Rubric gaps (not a score)'}</p>
            <div class="u-mt-3">${rubricRows(fb.rubric)}</div>

            <div class="card card--flat card--pad u-mt-4" style="background:var(--c-paper-raised)">
              <div class="card-title" style="margin-bottom:6px">Improved example</div>
              <p style="font-size:var(--fs-15);color:var(--c-ink-soft)">${esc(fb.improvedExample)}</p>
            </div>

            <div class="continuity">${esc(fb.continuity)}</div>

            ${nextAction(fb.nextAction, go)}
          </div>
        </div>
      </div>

      <aside class="stack">
        <div class="card card--pad" style="text-align:center">
          ${ring(fb.readinessScore, fb.status)}
          <div style="font-weight:var(--fw-semibold);margin-top:12px">${esc(fb.currentLevel)}</div>
          <div class="u-faint" style="font-size:var(--fs-13);margin-top:4px">Module readiness</div>
        </div>

        <div class="card card--pad">
          <div class="card-title">This module</div>
          <div class="stat-row"><span>Status</span><span style="color:${color(fb.status)}">${esc(m.word)}</span></div>
          <div class="stat-row"><span>Iteration</span><span>#${sub.iteration} of ∞</span></div>
          <div class="stat-row"><span>Module 2</span><span>${fb.unlockNextModule ? 'Unlocked' : 'Locked until Go'}</span></div>
        </div>

        ${go ? `
          <div class="card card--teal card--flat card--pad">
            <div class="card-title" style="color:var(--c-teal-ink)">You did it</div>
            <p style="font-size:var(--fs-14);color:var(--c-ink-soft)">Problem validated. Module 2 · Customer Discovery is now open.</p>
            <a class="btn btn--teal btn--block u-mt-4" href="#/dashboard">Advance to Module 2 →</a>
          </div>` : `
          <div class="card card--wash card--flat card--pad">
            <p class="field-hint" style="margin:0">You're not ready to advance yet — and that's the point. The <strong>Iterate &amp; resubmit</strong> button stays here until you hit Go.</p>
            <a class="btn btn--coral btn--block u-mt-4" href="#/submit">Iterate &amp; resubmit</a>
            <button class="btn btn--secondary btn--block u-mt-3" disabled>Advance — unlocks at Go</button>
          </div>`}

        <a class="btn btn--ghost btn--sm" href="#/archive">View coaching history →</a>
      </aside>
    </div>

    <p class="u-faint" style="font-size:var(--fs-13);margin-top:24px">Last reviewed ${when(sub.submittedAt)}</p>`;

  return { html };
}

function preview(text) {
  const t = (text || '').replace(/\s+\n/g, '\n').trim();
  return t.length > 320 ? t.slice(0, 319) + '…' : t;
}
function color(status) {
  return { ready: 'var(--c-go)', almost_ready: 'var(--c-almost)', not_ready: 'var(--c-nogo)' }[status] || 'var(--c-ink)';
}

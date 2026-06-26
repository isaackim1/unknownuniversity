/* =============================================================================
   dashboard.js — venture readiness, status, next action, snapshot, streak.
   ============================================================================= */
import * as api from '../api.js';
import { userName } from '../state.js';
import { esc, ring, badge, statusMeta, stageLabel } from '../components.js';

export default function dashboard() {
  const project = api.getProject();
  const readiness = api.getReadiness();        // { score, status, label }
  const fb = api.latestFeedback();
  const subs = api.getSubmissions();
  const mod = api.getModule();
  const m = statusMeta(readiness.status);
  const first = (userName() || 'there').split(' ')[0];

  const started = !!fb;
  const nextAction = fb ? fb.nextAction
    : 'Open your expert feedback to see your first deliverable, then submit your work-in-progress.';

  const html = `
    <div class="page-head">
      <span class="eyebrow">Venture dashboard</span>
      <h1 class="page-head__title">Good to see you, ${esc(first)}.</h1>
      <p class="page-head__sub">Readiness, your next action, and module progress — updated after every submission.</p>
    </div>

    <div class="grid-dash">
      <section class="card card--pad-lg">
        <div class="u-flex u-center u-between u-wrap u-gap-3">
          <div>
            <div class="card-title" style="margin-bottom:6px">Module 1</div>
            <h2 style="font-size:var(--fs-30)">Problem Validation</h2>
          </div>
          ${started ? badge(readiness.status) : '<span class="badge badge--neutral">Awaiting first submission</span>'}
        </div>

        <p class="u-muted u-mt-4 measure">
          You're building <strong>${esc(project.name)}</strong>. Current focus: prove the pain behind
          “${esc(project.description)}” is real and sharp enough to change behaviour — before you build.
        </p>

        <div class="u-mt-6">
          <div class="u-flex u-between" style="font-size:var(--fs-13);margin-bottom:8px">
            <span class="u-muted">Readiness</span>
            <span><strong>${started ? readiness.score + '%' : '—'}</strong> ${started && !mod.unlocked ? '· blocked from Module 2' : ''}${mod.unlocked ? '· Module 2 unlocked' : ''}</span>
          </div>
          <div class="bar"><div class="bar__fill ${m.bar}" style="width:${started ? readiness.score : 0}%"></div></div>
        </div>

        <div class="next-action ${readiness.status === 'ready' ? 'next-action--go' : ''}" style="margin-top:24px">
          <div class="next-action__label">Next action</div>
          <p>${esc(nextAction)}</p>
        </div>

        <div class="u-flex u-gap-3 u-wrap u-mt-6">
          ${started
            ? `<a class="btn btn--coral" href="#/feedforward">View latest feed-forward</a>
               <a class="btn btn--secondary" href="#/submit">Submit a new iteration</a>`
            : `<a class="btn btn--coral" href="#/lesson">Continue round</a>
               <a class="btn btn--secondary" href="#/submit">Submit work</a>`}
        </div>
      </section>

      <div class="stack">
        <div class="card card--pad" style="text-align:center">
          ${started ? ring(readiness.score, readiness.status) : ring(0, 'pending')}
          <div style="font-weight:var(--fw-semibold);font-size:var(--fs-14);margin-top:12px">Module readiness</div>
          <div class="u-faint" style="font-size:var(--fs-13);margin-top:4px">${started ? esc(readiness.label) : 'Iterate until Go'}</div>
        </div>

        <div class="card card--pad">
          <div class="card-title">Venture snapshot</div>
          <div class="stat-row"><span>Stage</span><span>${esc(stageLabel(project.stage))}</span></div>
          <div class="stat-row"><span>Deliverable</span><span>Interview script</span></div>
          <div class="stat-row"><span>Submissions</span><span>${subs.length}</span></div>
          <div class="stat-row"><span>Last call</span><span style="color:${started ? cssVar(readiness.status) : 'var(--c-ink-muted)'}">${started ? esc(statusMeta(readiness.status).word) : '—'}</span></div>
        </div>

        <div class="card card--pad card--accent">
          <div class="card-title">Coaching streak</div>
          <p class="u-muted" style="font-size:var(--fs-14)">${api.getState().streakDays} day${api.getState().streakDays === 1 ? '' : 's'} showing up with real work. Consistency beats perfection.</p>
        </div>
      </div>
    </div>`;

  return { html };
}

function cssVar(status) {
  return { ready: 'var(--c-go)', almost_ready: 'var(--c-almost)', not_ready: 'var(--c-nogo)' }[status] || 'var(--c-ink-muted)';
}

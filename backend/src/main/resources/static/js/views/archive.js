/* =============================================================================
   archive.js — full coaching history/timeline per project + saved drafts.
   ============================================================================= */
import * as api from '../api.js';
import { esc, badge, statusMeta, when, stageLabel } from '../components.js';

export default function archive() {
  const project = api.getProject();
  const subs = api.getSubmissions();
  const drafts = api.getDrafts();
  const readiness = api.getReadiness();
  const mod = api.getModule();

  const timeline = `
    <div class="steps">
      <div class="step step--done">
        <div class="step__num">✓</div>
        <div><div class="step__title">Intake submitted</div><div class="step__desc">${esc(stageLabel(project.stage))} stage · blocker captured in your own words.</div></div>
      </div>
      <div class="step step--done">
        <div class="step__num">✓</div>
        <div><div class="step__title">Expert feedback</div><div class="step__desc">Coach set the interview-script deliverable.</div></div>
      </div>
      ${subs.map((s) => `
        <div class="step step--done">
          <div class="step__num">${s.feedback.unlockNextModule ? '✓' : s.iteration}</div>
          <div>
            <div class="step__title">Submission v${s.iteration} · ${when(s.submittedAt)} ${badge(s.feedback.status)}</div>
            <div class="step__desc">${esc(firstGap(s.feedback))}</div>
          </div>
        </div>`).join('')}
    </div>`;

  const html = `
    <div class="page-head">
      <span class="eyebrow">Project archive</span>
      <h1 class="page-head__title">Everything you've submitted, in one place.</h1>
      <p class="page-head__sub">Your full coaching history — so you can see how far ${esc(project.name)} has come.</p>
    </div>

    <div class="grid-split">
      <div class="stack">
        <div class="card card--pad">
          <div class="card-title">Coaching timeline</div>
          ${timeline}
        </div>

        <div class="card card--pad">
          <div class="card-title">Saved drafts</div>
          ${drafts.length ? drafts.map((d) => `
            <div class="stat-row">
              <span>${esc(d.label)} <span class="u-faint">· ${when(d.savedAt)}</span></span>
              <a class="btn btn--secondary btn--sm" href="#/${d.kind === 'submission' ? 'submit' : 'intake'}">Open</a>
            </div>`).join('')
            : '<p class="field-hint">Drafts you save anywhere in a round land here automatically.</p>'}
        </div>
      </div>

      <div class="stack">
        <div class="card card--pad">
          <div class="card-title">Your project</div>
          <div class="stat-row"><span><strong>${esc(project.name)}</strong></span>${readiness.status !== 'pending' ? badge(readiness.status) : '<span class="badge badge--neutral">In progress</span>'}</div>
          <div class="stat-row"><span>Module</span><span>${mod.unlocked ? 'Customer Discovery' : 'Problem Validation'}</span></div>
          <div class="stat-row"><span>Submissions</span><span>${subs.length} reviewed</span></div>
          <div class="stat-row"><span>Readiness</span><span>${readiness.status === 'pending' ? '—' : readiness.score + '%'}</span></div>
          <a class="btn btn--secondary btn--sm btn--block u-mt-4" href="#/intake">Edit venture</a>
        </div>

        <div class="card card--pad card--accent">
          <div class="card-title">Progress at a glance</div>
          <p class="u-muted" style="font-size:var(--fs-14)">${esc(progressLine(subs))} Your coach remembers every step, so feedback keeps getting sharper.</p>
        </div>
      </div>
    </div>

    <div class="disclaimer">
      <strong>Note:</strong> Unknown University references here are an <em>inspired-by / fictional</em> framing. No real rankings, recordings, or faculty voice are implied.
    </div>`;

  return { html };
}

function firstGap(fb) {
  const gap = (fb.missing && fb.missing[0]) || fb.specificFeedback;
  return gap.length > 90 ? gap.slice(0, 89) + '…' : gap;
}

function progressLine(subs) {
  if (!subs.length) return 'No submissions yet.';
  const words = subs.map((s) => statusMeta(s.feedback.status).word);
  return words.join(' → ') + (subs[subs.length - 1].feedback.unlockNextModule ? ' — Module 2 unlocked.' : '.');
}

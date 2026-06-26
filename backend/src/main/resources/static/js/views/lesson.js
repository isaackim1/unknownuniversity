/* =============================================================================
   lesson.js — expert feedback: deep, project-specific insight + practical
   actions + a concrete homework deliverable + rubric preview.
   ============================================================================= */
import * as api from '../api.js';
import { userName } from '../state.js';
import { esc } from '../components.js';

export default function lesson() {
  const p = api.getProject();
  const first = (userName() || 'there').split(' ')[0];

  const html = `
    <div class="page-head">
      <span class="eyebrow">Expert feedback · on ${esc(p.name)}</span>
      <h1 class="page-head__title">${esc(first)} — your blocker is validation, not motivation.</h1>
      <p class="page-head__sub">A deep read on your venture and where you're stuck — plus a concrete, practical thing to go do next.</p>
    </div>

    <div class="grid-split">
      <div class="card card--pad-lg">
        <div class="feed-bubble" style="border:none;padding:0;max-width:none">
          <p style="margin-bottom:16px">
            You told me the blocker is: <em>“${esc(shorten(p.blocker, 180))}”</em>. Good instinct — that doubt <strong>is</strong> the work.
            Right now the pain behind “${esc(p.description)}” is an <strong>assumption</strong>, not a validated problem. Before any pricing
            or product talk, you need evidence that a specific group feels it sharply enough to change what they do.
          </p>
          <p>
            For <strong>${esc(p.name)}</strong>, don't talk to “everyone”. Talk to a narrow, recruitable group who live the exact
            situation in your description — people whose week is shaped by this problem.
          </p>
        </div>

        <div class="card card--wash card--flat card--pad u-mt-6">
          <div class="card-title">Two practical ways to move right now</div>
          <ul class="feed-bubble" style="border:none;padding:0;background:none">
            <li><strong>Listen where they already complain.</strong> Find the forums, group chats, and subreddits where your customer vents. Collect 5 real posts about this problem — in their words.</li>
            <li><strong>Homework: 3 interviews this week.</strong> Find 3 people in that narrow group. Ask about the <em>last time</em> the problem bit them. Don't pitch — listen and capture quotes.</li>
          </ul>
        </div>

        <div class="card card--teal card--flat card--pad u-mt-6">
          <div class="card-title" style="color:var(--c-teal-ink)">Your work-in-progress this round</div>
          <p style="font-size:var(--fs-15);color:var(--c-ink-soft)">
            Draft a <strong>6-question interview script</strong> for those conversations, then submit it — messy is fine.
            I'll feed-forward against the rubric so your next version is sharper. This is your practical next step, tailored to where ${esc(p.name)} is today.
          </p>
        </div>

        <div class="u-flex u-gap-3 u-wrap u-mt-6">
          <a class="btn btn--coral" href="#/submit">Submit work-in-progress</a>
          <a class="btn btn--secondary" href="#/dashboard">Back to dashboard</a>
        </div>
      </div>

      <aside class="card card--pad card--dark">
        <div class="card-title" style="color:rgba(255,255,255,0.5)">Rubric preview</div>
        <p style="font-size:var(--fs-14);color:rgba(255,255,255,0.6);margin-bottom:16px">This is what I'll assess your submission against — so you always know what “ready” looks like.</p>
        <div class="rubric">
          <div class="rubric-row"><span class="rubric-dot"></span><div><div class="rubric-row__title">Segment specificity</div><div class="rubric-row__note">A named, recruitable group — not “everyone”.</div></div></div>
          <div class="rubric-row"><span class="rubric-dot"></span><div><div class="rubric-row__title">Problem vs. solution</div><div class="rubric-row__note">Questions test behaviour, not your idea.</div></div></div>
          <div class="rubric-row"><span class="rubric-dot"></span><div><div class="rubric-row__title">Evidence hook</div><div class="rubric-row__note">A question that pulls a quotable, real story.</div></div></div>
        </div>
      </aside>
    </div>`;

  return { html };
}

function shorten(s, n) {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t || 'I want to validate this before I build.';
}

/* =============================================================================
   intake.js — start (or edit) the venture and kick off a mentorship round.
   ============================================================================= */
import * as api from '../api.js';
import { esc } from '../components.js';

const STAGES = [
  ['idea', 'Idea — concept, problem definition'],
  ['prototype', 'Prototype — mockup, wireframe, draft'],
  ['testing', 'Testing — user feedback, evaluation'],
  ['iteration', 'Iteration — refine based on feedback'],
  ['final', 'Final Presentation — present & deliver'],
];

export default function intake() {
  const p = api.getProject() || {};

  const html = `
    <div class="page-head">
      <span class="eyebrow">Your coach is online</span>
      <h1 class="page-head__title">Bring your project. Tell me where you're stuck.</h1>
      <p class="page-head__sub">I'm your 24/7 business coach. Share your venture and your current blocker, and I'll give you specific, practical guidance built around <em>your</em> idea — not theory.</p>
    </div>

    <div class="grid-split">
      <form class="card card--pad-lg" id="intake-form" novalidate>
        <div class="field">
          <label class="field-label" for="name">Project name</label>
          <input class="input" id="name" name="name" type="text" required value="${esc(p.name || '')}" placeholder="Campus Plate">
        </div>
        <div class="field">
          <label class="field-label" for="description">Project description</label>
          <input class="input" id="description" name="description" type="text" required value="${esc(p.description || '')}" placeholder="Affordable, healthy meals for international students who can't access campus kitchens">
        </div>
        <div class="field">
          <label class="field-label" for="targetCustomer">Who is it for?</label>
          <input class="input" id="targetCustomer" name="targetCustomer" type="text" required value="${esc(p.targetCustomer || '')}" placeholder="International first-year students living off-campus">
          <p class="field-hint">Be specific — a narrow, recruitable group beats “everyone”.</p>
        </div>
        <div class="field">
          <label class="field-label" for="problem">What problem are you solving?</label>
          <input class="input" id="problem" name="problem" type="text" required value="${esc(p.problem || '')}" placeholder="They can't access a kitchen and end up skipping meals or overspending on delivery">
        </div>
        <div class="field">
          <label class="field-label" for="stage">Stage</label>
          <select class="select" id="stage" name="stage">
            ${STAGES.map(([v, l]) => `<option value="${v}" ${p.stage === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label class="field-label" for="blocker">What's blocking you right now?</label>
          <textarea class="textarea" id="blocker" name="blocker" required placeholder="Write it in your own words — the more honest, the better I can help." style="min-height:150px">${esc(p.blocker || '')}</textarea>
          <p class="field-hint">I'll read this to understand your real needs and shape practical next steps — no generic advice.</p>
        </div>

        <div class="banner banner--error" id="intake-error" hidden></div>

        <div class="u-flex u-gap-3 u-wrap u-mt-5">
          <button class="btn btn--coral" type="submit">Start mentorship round →</button>
          <button class="btn btn--secondary" type="button" data-save-draft>Save draft</button>
        </div>
      </form>

      <aside class="card card--pad">
        <div class="card-title">How we'll work together</div>
        <div class="steps">
          <div class="step step--current">
            <div class="step__num">1</div>
            <div><div class="step__title">You tell me your blocker</div><div class="step__desc">I route you to the right focus for where you are.</div></div>
          </div>
          <div class="step">
            <div class="step__num">2</div>
            <div><div class="step__title">I give expert feedback</div><div class="step__desc">Specific to your project, with a practical thing to go do.</div></div>
          </div>
          <div class="step">
            <div class="step__num">3</div>
            <div><div class="step__title">You submit, we iterate</div><div class="step__desc">A real rubric — Go / Almost / No-go — until you're ready.</div></div>
          </div>
        </div>
        <div class="card card--wash card--flat card--pad u-mt-5">
          <div class="card-title" style="margin-bottom:8px">Module 1</div>
          <div class="u-flex u-center u-between"><strong>Problem Validation</strong><span class="badge badge--teal">Active</span></div>
          <p class="field-hint" style="margin-top:8px">Prove the pain is real before you build anything.</p>
        </div>
      </aside>
    </div>`;

  function onMount() {
    const form = document.getElementById('intake-form');
    const error = document.getElementById('intake-error');

    function collect() {
      return {
        name: form.name.value.trim(),
        description: form.description.value.trim(),
        targetCustomer: form.targetCustomer.value.trim(),
        problem: form.problem.value.trim(),
        stage: form.stage.value,
        blocker: form.blocker.value.trim(),
      };
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = collect();
      if (!data.name || !data.description || !data.targetCustomer || !data.problem || !data.blocker) {
        error.textContent = 'Fill in your project, who it’s for, the problem, and your current blocker so I can coach you properly.';
        error.hidden = false;
        return;
      }
      error.hidden = true;
      api.saveProject(data);
      location.hash = '#/lesson';
    });

    document.querySelector('[data-save-draft]')?.addEventListener('click', () => {
      const data = collect();
      api.saveDraft('intake', `Intake — ${data.name || 'Untitled'}`, data);
      if (data.name && data.description && data.blocker) api.saveProject(data);
      error.className = 'banner banner--info';
      error.textContent = 'Draft saved to your archive.';
      error.hidden = false;
      setTimeout(() => { error.hidden = true; error.className = 'banner banner--error'; }, 2400);
    });
  }

  return { html, onMount };
}

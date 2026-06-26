/* =============================================================================
   submit.js — submit work-in-progress (upload + paste). Messy WIP welcome.
   ============================================================================= */
import * as api from '../api.js';
import { esc, stageLabel } from '../components.js';

export default function submit() {
  const p = api.getProject();
  const iteration = api.getSubmissions().length + 1;

  const html = `
    <div class="page-head">
      <span class="eyebrow">Problem Validation · Submit</span>
      <h1 class="page-head__title">Submit your work-in-progress</h1>
      <p class="page-head__sub">Upload anytime. Messy is expected. I'll feed-forward against the rubric — never a grade.</p>
    </div>

    <div class="grid-split">
      <form id="submit-form">
        <label class="upload" id="dropzone" for="file" tabindex="0" role="button" aria-label="Upload a file">
          <div class="upload__icon">↑</div>
          <div class="upload__title">Drop your interview script</div>
          <div class="upload__hint" id="filehint">PDF, Doc, or paste below · iteration ${iteration}</div>
          <input id="file" type="file" class="visually-hidden" accept=".pdf,.doc,.docx,.txt,.md">
        </label>

        <div class="field u-mt-5">
          <label class="field-label" for="text">Or paste your submission</label>
          <textarea class="textarea" id="text" name="text" required style="min-height:240px" placeholder="${esc(placeholder(p))}"></textarea>
          <p class="field-hint">Tip: one interview question per line. Be specific about who you'd talk to.</p>
        </div>

        <div class="banner banner--error" id="submit-error" hidden></div>

        <div class="u-flex u-gap-3 u-wrap u-mt-5">
          <button class="btn btn--coral" type="submit" id="submit-btn">Submit for feed-forward</button>
          <button class="btn btn--secondary" type="button" data-save-draft>Save draft</button>
        </div>
      </form>

      <aside class="card card--pad">
        <div class="card-title">Before you submit</div>
        <div class="stat-row"><span>Project linked</span><span>✓ ${esc(p.name)}</span></div>
        <div class="stat-row"><span>Module</span><span>Problem Validation</span></div>
        <div class="stat-row"><span>Stage</span><span>${esc(stageLabel(p.stage))}</span></div>
        <div class="stat-row"><span>Iteration</span><span>#${iteration}</span></div>
        <div class="stat-row"><span>Coach continuity</span><span>Remembers your intake</span></div>
        <div class="card card--wash card--flat card--pad u-mt-5">
          <p class="field-hint" style="margin:0">Your coach reads this against three rubric rows: <strong>segment specificity</strong>, <strong>problem vs. solution</strong>, and <strong>evidence hook</strong>.</p>
        </div>
      </aside>
    </div>`;

  function onMount() {
    const form = document.getElementById('submit-form');
    const text = document.getElementById('text');
    const error = document.getElementById('submit-error');
    const dz = document.getElementById('dropzone');
    const file = document.getElementById('file');
    const hint = document.getElementById('filehint');
    const btn = document.getElementById('submit-btn');

    // File pick → read text content into the textarea (txt/md) or just note the name.
    file.addEventListener('change', () => {
      const f = file.files[0];
      if (!f) return;
      hint.textContent = `Attached: ${f.name}`;
      if (/\.(txt|md)$/i.test(f.name)) {
        f.text().then((t) => { if (!text.value.trim()) text.value = t; });
      }
    });
    ['dragover', 'dragenter'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('is-drag'); }));
    ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, () => dz.classList.remove('is-drag')));
    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (!f) return;
      hint.textContent = `Attached: ${f.name}`;
      if (/\.(txt|md)$/i.test(f.name)) f.text().then((t) => { if (!text.value.trim()) text.value = t; });
    });
    dz.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!text.value.trim()) {
        error.textContent = 'Paste your work-in-progress (or upload a .txt/.md) so I can give you feed-forward.';
        error.hidden = false;
        return;
      }
      error.hidden = true;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px"></span> Coaching…';
      // Real assessment via POST /api/generate-feedback (api.js maps shapes + falls back offline).
      api.submitWork(text.value.trim())
        .then(() => { location.hash = '#/feedforward'; })
        .catch(() => {
          btn.disabled = false;
          btn.textContent = 'Submit for feed-forward';
          error.textContent = 'Something went wrong reaching your coach. Please try again.';
          error.hidden = false;
        });
    });

    document.querySelector('[data-save-draft]')?.addEventListener('click', () => {
      api.saveDraft('submission', `Interview script (draft) — iteration ${iteration}`, { text: text.value });
      error.className = 'banner banner--info';
      error.textContent = 'Draft saved to your archive.';
      error.hidden = false;
      setTimeout(() => { error.hidden = true; error.className = 'banner banner--error'; }, 2400);
    });
  }

  return { html, onMount };
}

function placeholder(p) {
  return `${p.name} — Interview script v1\n\n1. Tell me about the last time "${(p.description || 'this problem')}" came up for you.\n2. What did you do about it?\n3. How long did it take / what did it cost you?\n4. What were you using instead?\n5. ...`;
}

/* =============================================================================
   components.js — shared render helpers (pure, no side effects)
   ============================================================================= */

export function html(strings, ...values) {
  // Tiny tagged-template helper; values are inserted raw (callers escape).
  return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ''), '');
}

export function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/** Status → display metadata for the Go / Almost / No-go system. */
export function statusMeta(status) {
  switch (status) {
    case 'ready':
      return { word: 'Go', label: 'Go — ready to advance', badge: 'badge--go', ring: 'ring--go', bar: 'bar__fill--go', dot: 'rubric-dot--go', bubble: 'feed-bubble--go' };
    case 'almost_ready':
      return { word: 'Almost', label: 'Almost — missing evidence', badge: 'badge--almost', ring: 'ring--almost', bar: 'bar__fill--almost', dot: 'rubric-dot--almost', bubble: 'feed-bubble--almost' };
    case 'not_ready':
      return { word: 'No-go', label: 'No-go — revise first', badge: 'badge--nogo', ring: 'ring--nogo', bar: 'bar__fill--nogo', dot: 'rubric-dot--nogo', bubble: 'feed-bubble--nogo' };
    default:
      return { word: 'Not started', label: 'Not started', badge: 'badge--neutral', ring: '', bar: '', dot: '', bubble: '' };
  }
}

export function rubricState(state) {
  return { go: 'rubric-dot--go', almost: 'rubric-dot--almost', nogo: 'rubric-dot--nogo' }[state] || '';
}

export function badge(status) {
  const m = statusMeta(status);
  return `<span class="badge ${m.badge}">${esc(m.word)}</span>`;
}

export function ring(score, status) {
  const m = statusMeta(status);
  return `<div class="ring ${m.ring}" style="--val:${Number(score) || 0}"><span class="ring__val">${Number(score) || 0}%</span></div>`;
}

export function bar(score, status) {
  const m = statusMeta(status);
  return `<div class="bar"><div class="bar__fill ${m.bar}" style="width:${Math.max(0, Math.min(100, Number(score) || 0))}%"></div></div>`;
}

export function rubricRows(rows = []) {
  return `<div class="rubric">${rows.map((r) => `
    <div class="rubric-row">
      <span class="rubric-dot ${rubricState(r.state)}"></span>
      <div>
        <div class="rubric-row__title">${esc(r.key)}</div>
        <div class="rubric-row__note">${esc(r.note)}</div>
      </div>
    </div>`).join('')}</div>`;
}

export function nextAction(text, go = false) {
  return `<div class="next-action ${go ? 'next-action--go' : ''}">
    <div class="next-action__label">Concrete next action</div>
    <p>${esc(text)}</p>
  </div>`;
}

/** Stage value → human label. */
export function stageLabel(stage) {
  return {
    'idea': 'Idea',
    'prototype': 'Prototype',
    'testing': 'Testing',
    'iteration': 'Iteration',
    'final': 'Final Presentation',
  }[stage] || 'Idea';
}

/** Relative-ish timestamp. */
export function when(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' +
           d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

export function initials(name) {
  const parts = String(name || 'You').trim().split(/\s+/);
  return ((parts[0]?.[0] || 'U') + (parts[1]?.[0] || '')).toUpperCase();
}

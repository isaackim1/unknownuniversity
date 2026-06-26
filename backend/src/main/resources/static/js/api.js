/* =============================================================================
   api.js — the ONE client data layer.
   - Auth/session is REAL: Fluxzero BFF (`/app/auth/session`, `/app/login`, `/app/logout`).
   - Coaching is REAL: POST `/api/generate-profile` and `/api/generate-feedback`
     (Fluxzero CoachingService → Claude, with the backend's own deterministic
     fallback when ANTHROPIC_API_KEY is unset).
   - localStorage only holds local session continuity (project, drafts, submissions,
     the founder profile, module unlock). If the backend is unreachable, a local
     fallback coach keeps the demo working offline.
   ============================================================================= */

/* ----------------------------------------------------------------------------
   REAL — Authentication (Fluxzero BFF)
   ---------------------------------------------------------------------------- */

/** GET /app/auth/session → { authenticated, name, role, email, ... } | { authenticated:false } */
export async function fetchSession() {
  try {
    const res = await fetch('/app/auth/session', {
      headers: { accept: 'application/json' },
      credentials: 'same-origin',
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 200 && data && data.authenticated) {
      return { authenticated: true, ...data };
    }
    return { authenticated: false, issuer: data && data.issuer };
  } catch (err) {
    return { authenticated: false, error: String(err) };
  }
}

export function loginUrl(returnTo = '#/dashboard') {
  return `/app/login?returnTo=${encodeURIComponent('/' + (returnTo.startsWith('#') ? returnTo : '#' + returnTo))}`;
}

export function logoutUrl() {
  return '/app/logout';
}

/* ----------------------------------------------------------------------------
   Local session continuity (localStorage)
   ---------------------------------------------------------------------------- */

const STORE_KEY = 'uu_loop_v2';

const SEED = {
  project: null,          // { name, description, stage, blocker, createdAt }
  profile: null,          // FounderProfileResponse from /api/generate-profile
  drafts: [],             // { id, kind, label, savedAt, data }
  submissions: [],        // { id, iteration, text, submittedAt, feedback }
  module: { name: 'Problem Validation', number: 1, unlocked: false },
  streakDays: 1,
};

function read() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(SEED);
    return { ...structuredClone(SEED), ...JSON.parse(raw) };
  } catch {
    return structuredClone(SEED);
  }
}
function write(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  return state;
}

export function getState() { return read(); }
export function hasProject() { return !!read().project; }
export function getProject() { return read().project; }
export function getProfile() { return read().profile; }
export function getDrafts() { return read().drafts; }
export function getSubmissions() { return read().submissions; }
export function getModule() { return read().module; }
export function latestFeedback() {
  const subs = read().submissions;
  return subs.length ? subs[subs.length - 1].feedback : null;
}
export function getReadiness() {
  const fb = latestFeedback();
  if (!fb) return { score: 0, status: 'pending', label: 'Not started' };
  return { score: fb.readinessScore, status: fb.status, label: fb.currentLevel };
}

export function saveProject(project) {
  const state = read();
  state.project = { ...project, createdAt: state.project?.createdAt || new Date().toISOString() };
  state.profile = null; // re-profile on next request
  write(state);
  // Kick off the real founder profile in the background (non-blocking).
  generateProfileRemote(state.project).catch(() => {});
  return state.project;
}

export function saveDraft(kind, label, data) {
  const state = read();
  const id = 'd_' + Date.now();
  state.drafts = [{ id, kind, label, savedAt: new Date().toISOString(), data }, ...state.drafts].slice(0, 12);
  write(state);
  return id;
}

export function resetLoop() { try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ } }

/* ----------------------------------------------------------------------------
   REAL — Coaching: POST /api/generate-profile
   ---------------------------------------------------------------------------- */

const STAGE_MAP = {
  idea: 'idea', prototype: 'early-testing', testing: 'early-testing',
  iteration: 'first-customers', final: 'growing',
};

/** Map the redesign's intake {name,description,stage,blocker} → backend GenerateProfileRequest. */
function intakePayload(project) {
  const p = project || {};
  return {
    idea: [p.name, p.description].filter(Boolean).join(' — '),
    targetCustomer: p.targetCustomer || '',
    problem: p.problem || p.description || '',
    stage: STAGE_MAP[p.stage] || 'idea',
    tested: '',
    weeklyTime: '',
  };
}

export async function generateProfileRemote(project) {
  try {
    const res = await fetch('/api/generate-profile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(intakePayload(project)),
    });
    if (!res.ok) throw new Error('profile ' + res.status);
    const profile = await res.json();
    const state = read();
    state.profile = profile;
    write(state);
    return profile;
  } catch {
    return null; // profile is optional; feedback still works without it
  }
}

/* ----------------------------------------------------------------------------
   REAL — Coaching: POST /api/generate-feedback  (the assessment)
   ---------------------------------------------------------------------------- */

/** Build the GenerateFeedbackRequest from the local project + the pasted WIP. */
function feedbackPayload(project, text, previousFeedback) {
  const ls = (text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  return {
    intake: intakePayload(project),
    profile: read().profile || {},
    submission: {
      problemHypothesis: [project?.name, project?.description].filter(Boolean).join(': '),
      interviewQuestions: ls,
    },
    previousFeedback: Array.isArray(previousFeedback) ? previousFeedback : [],
  };
}

export async function submitWork(text) {
  const state = read();
  const iteration = state.submissions.length + 1;
  const prior = state.submissions.map((s) => s.feedback?.raw).filter(Boolean);

  let feedback;
  try {
    const res = await fetch('/api/generate-feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(feedbackPayload(state.project, text, prior)),
    });
    if (!res.ok) throw new Error('feedback ' + res.status);
    const raw = await res.json();
    feedback = normalizeFeedback(raw, iteration, state.project);
  } catch {
    feedback = evaluateSubmission(state.project, text, iteration); // offline fallback
  }

  const submission = { id: 's_' + Date.now(), iteration, text, submittedAt: new Date().toISOString(), feedback };
  state.submissions.push(submission);
  if (feedback.unlockNextModule) state.module.unlocked = true;
  state.streakDays = Math.min(state.streakDays + 1, 99);
  write(state);
  return submission;
}

/** Map the backend FeedbackResponse into the shape the feed-forward view renders. */
function normalizeFeedback(raw, iteration, project) {
  const status = ['not_ready', 'almost_ready', 'ready'].includes(raw.status) ? raw.status : 'not_ready';
  const score = status === 'ready' ? 100 : status === 'almost_ready' ? 68 : 42;
  const missing = Array.isArray(raw.missing) ? raw.missing : [];
  const blocker = project?.blocker?.trim();

  const ROWS = [
    { key: 'Segment specificity', kw: /(segment|customer|who|narrow|broad|audience|specific)/i },
    { key: 'Problem vs. solution', kw: /(lead|pitch|solution|behaviou?r|question|assum)/i },
    { key: 'Evidence hook', kw: /(evidence|quote|story|proof|interview|verbatim)/i },
  ];
  const rubric = ROWS.map((r) => {
    const hit = missing.find((m) => r.kw.test(m));
    const state = hit ? (status === 'almost_ready' ? 'almost' : 'nogo') : 'go';
    return { key: r.key, state, note: hit || 'Looks solid for this round.' };
  });

  return {
    status,
    currentLevel: raw.currentLevel || (status === 'ready' ? 'Validation-ready' : status === 'almost_ready' ? 'Sharpening your validation' : 'Early problem framing'),
    readinessScore: score,
    iteration,
    rubric,
    strengths: Array.isArray(raw.strengths) && raw.strengths.length ? raw.strengths : ['You put your venture in front of real validation instead of building first.'],
    missing,
    specificFeedback: raw.specificFeedback || '',
    improvedExample: raw.improvedExample || '',
    nextAction: raw.nextAction || '',
    continuity: blocker ? `I remember: at intake you said “${shorten(blocker, 90)}”. Keep every question tied to testing that.` : 'I remember your intake — keep every question tied to what was blocking you.',
    unlockNextModule: !!raw.unlockNextModule,
    poweredBy: raw.poweredBy || 'fluxzero',
    raw, // kept for previousFeedback continuity on the next iteration
  };
}

/* ----------------------------------------------------------------------------
   OFFLINE FALLBACK COACH — only used if /api/generate-feedback is unreachable.
   ---------------------------------------------------------------------------- */

const LEADING = [/^\s*would you\b/i, /^\s*do you like\b/i, /^\s*will you\b/i, /^\s*should we\b/i, /would you pay/i, /would you use/i];
const BEHAVIORAL = /(last time|last week|walk me through|what did you do|how did you|the most recent)/i;
const EVIDENCE = /("[^"]{8,}"|\b\d+\s+(interview|interviews|people|students|founders|users)\b|verbatim|quote)/i;
const SEGMENT_HINT = /(first[- ]year|international|off[- ]campus|remote|freelance|enterprise|b2b|students who|founders who|per week|times a week)/i;

function evaluateSubmission(project, text, iteration) {
  const name = project?.name?.trim() || 'your venture';
  const desc = project?.description?.trim() || 'the problem you described';
  const blocker = project?.blocker?.trim() || '';
  const ls = (text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const questions = ls.filter((l) => l.endsWith('?') || /^\d+[.)]/.test(l) || /^[-*]/.test(l));
  const leadingCount = questions.filter((q) => LEADING.some((re) => re.test(q))).length;
  const segmentState = SEGMENT_HINT.test(text || '') ? 'go' : 'nogo';
  const leadingState = leadingCount === 0 ? 'go' : leadingCount <= 2 ? 'almost' : 'nogo';
  const evidenceState = EVIDENCE.test(text || '') ? 'go' : BEHAVIORAL.test(text || '') ? 'almost' : 'nogo';
  const states = [segmentState, leadingState, evidenceState];
  const status = states.includes('nogo') ? 'not_ready' : states.includes('almost') ? 'almost_ready' : 'ready';
  const sc = { go: 1, almost: 0.62, nogo: 0.18 };
  let score = Math.max(20, Math.min(100, Math.round(((sc[segmentState] + sc[leadingState] + sc[evidenceState]) / 3) * 100)));
  if (status === 'ready') score = Math.max(score, 92);

  const rubric = [
    { key: 'Segment specificity', state: segmentState, note: segmentState === 'go' ? 'A named, recruitable group.' : `"${shorten(desc)}" still points at a broad audience.` },
    { key: 'Problem vs. solution', state: leadingState, note: leadingState === 'go' ? 'Questions probe behaviour, not your idea.' : `${leadingCount} question(s) lead the witness.` },
    { key: 'Evidence hook', state: evidenceState, note: evidenceState === 'go' ? 'A quotable, real story.' : 'No question pulls a concrete story.' },
  ];
  return {
    status,
    currentLevel: status === 'ready' ? 'Validation-ready' : status === 'almost_ready' ? 'Sharpening your validation' : 'Early problem framing',
    readinessScore: score,
    iteration,
    rubric,
    strengths: ['You’re testing ' + name + ' with real conversations before building.'],
    missing: rubric.filter((r) => r.state !== 'go').map((r) => `${r.key}: ${r.note}`),
    specificFeedback: `(Offline coach) Right now ${name} needs sharper evidence that "${shorten(desc)}" is real and frequent. Test behaviour, not your idea.`,
    improvedExample: `Ask: "Walk me through the last time you ran into ${shorten(desc)} — what did you do, and what did it cost you?"`,
    nextAction: status === 'ready' ? 'Advance to Module 2 · Customer Discovery.' : `Interview 5 people about the last time they hit "${shorten(desc)}". Don’t pitch ${name}. Then resubmit.`,
    continuity: blocker ? `I remember: at intake you said “${shorten(blocker, 90)}”.` : 'I remember your intake.',
    unlockNextModule: status === 'ready',
    poweredBy: 'offline-fallback',
  };
}

function shorten(s, n = 70) {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

let _firstName = 'there';
export function setCoachName(name) { _firstName = (name || '').split(' ')[0] || 'there'; }

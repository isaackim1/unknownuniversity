/* =============================================================================
   landing.js — public marketing front door.
   ============================================================================= */
import * as api from '../api.js';
import { isAuthed } from '../state.js';

const LOOP = [
  { n: '1', t: 'Intake', d: 'Tell your coach your venture and what is blocking you right now.' },
  { n: '2', t: 'Expert feedback', d: 'Get project-specific insight and a concrete deliverable to go build.' },
  { n: '3', t: 'Submit work', d: 'Upload your messy work-in-progress. No grades, ever.' },
  { n: '4', t: 'Feed-forward', d: 'A Go / Almost / No-go call against a real rubric, tied to your venture.' },
  { n: '5', t: 'Iterate', d: 'Resubmit until you hit Go — then the next module unlocks.' },
];

const FEATURES = [
  { i: '◎', t: 'Coach, don\'t lecture', d: 'Practical, specific guidance built around your idea — never generic theory or a wall of slides.' },
  { i: '↗', t: 'Feed-forward, not grades', d: 'Every review tells you what is missing and the one thing to do next. No numeric scores to game.' },
  { i: '✶', t: 'Learning by doing', d: 'You leave each round with real founder work: a sharper problem, a customer to interview, evidence.' },
];

const WHO = [
  { t: 'First-time founders', d: 'You have an idea but keep getting told to "talk to customers" with no one telling you if your problem is even sharp enough to start.' },
  { t: 'Student & part-time builders', d: 'You have a few hours a week. You need a structured path, not a 40-hour course you will never finish.' },
  { t: 'Accelerator cohorts', d: 'A consistent rubric and coaching loop that scales the same high-quality feedback across every team.' },
];

const QUOTES = [
  { q: 'It refused to let me build until I had a real quote from a real customer. That No-go saved me three months.', a: 'Maria', r: 'Founder, Campus Plate' },
  { q: 'The feedback always referenced my actual venture. It felt like a coach who remembered every conversation.', a: 'Devin', r: 'Solo founder' },
  { q: 'Go / Almost / No-go is the clearest signal I have ever had on whether I was ready to move forward.', a: 'Aiko', r: 'Cohort 04' },
];

export default function landing() {
  const cta = isAuthed() ? '#/dashboard' : api.loginUrl('/dashboard');
  const ctaLabel = isAuthed() ? 'Go to your dashboard' : 'Start your assessment';

  const html = `
  <div class="site">
    <header class="site-header">
      <a class="brand" href="#/">
        <div class="brand__mark">U</div>
        <div><div class="brand__title">Unknown University</div></div>
      </a>
      <nav class="site-nav">
        <a href="#how">How it works</a>
        <a href="#who">Who it's for</a>
        <a href="#proof">Stories</a>
        ${isAuthed()
          ? '<a class="btn btn--primary btn--sm" href="#/dashboard">Dashboard</a>'
          : `<a class="btn btn--primary btn--sm" href="${api.loginUrl('/dashboard')}">Sign in</a>`}
      </nav>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero__inner">
        <span class="eyebrow">Applied Entrepreneurship · Module 1</span>
        <h1 class="hero__title">Build your startup like you're inside an <em>applied</em> entrepreneurship university.</h1>
        <p class="hero__lede">Unknown University is your 24/7 business coach. Bring your idea and your blocker — get specific, practical guidance, real founder work, and a clear Go / No-go path through Problem Validation.</p>
        <div class="hero__cta">
          <a class="btn btn--coral btn--lg" href="${cta}">${ctaLabel} →</a>
          <a class="btn btn--secondary btn--lg" href="#how">See the coaching loop</a>
        </div>
        <div class="hero__meta">
          <div class="hero__meta-item"><strong>1 module</strong> Problem Validation, done properly</div>
          <div class="hero__meta-item"><strong>Go / Almost / No-go</strong> a real readiness call</div>
          <div class="hero__meta-item"><strong>24/7</strong> coaching, on your schedule</div>
        </div>
      </div>
    </section>

    <!-- Core loop -->
    <section class="section section--ink" id="how">
      <div class="section__inner">
        <span class="eyebrow" style="color:var(--c-teal)">The coaching loop</span>
        <h2 class="section-title">One module. One loop. Repeated until you're ready.</h2>
        <p class="section-lede">This isn't a chatbot and it isn't a video course. It's a guided founder workflow that ends with a decision and a next action — every single time.</p>
        <div class="loop-grid">
          ${LOOP.map((s) => `
            <div class="loop-step">
              <div class="loop-step__num">${s.n}</div>
              <div class="loop-step__title">${s.t}</div>
              <div class="loop-step__desc">${s.d}</div>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- Philosophy / features -->
    <section class="section">
      <div class="section__inner">
        <span class="eyebrow">Why it works</span>
        <h2 class="section-title">A coach that does the opposite of a lecture.</h2>
        <div class="feature-grid">
          ${FEATURES.map((f) => `
            <div class="card card--pad feature">
              <div class="feature__icon">${f.i}</div>
              <h3>${f.t}</h3>
              <p>${f.d}</p>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- Who it's for -->
    <section class="section section--wash" id="who">
      <div class="section__inner">
        <span class="eyebrow">Who it's for</span>
        <h2 class="section-title">For builders who'd rather validate than guess.</h2>
        <div class="who-grid">
          ${WHO.map((w) => `
            <div class="card card--pad card--flat who">
              <h3>${w.t}</h3>
              <p>${w.d}</p>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- Social proof -->
    <section class="section" id="proof">
      <div class="section__inner">
        <span class="eyebrow">Founder stories</span>
        <h2 class="section-title">Real momentum, not a certificate.</h2>
        <div class="quote-grid">
          ${QUOTES.map((q) => `
            <div class="card card--pad quote">
              <p>“${q.q}”</p>
              <div class="quote__author"><strong>${q.a}</strong><span>${q.r}</span></div>
            </div>`).join('')}
        </div>
        <div class="logos">
          <span>CAMPUS PLATE</span><span>NORTHWIND</span><span>LEDGERLY</span><span>OPENBENCH</span><span>TIDEKIT</span>
        </div>
      </div>
    </section>

    <!-- CTA band -->
    <section class="section">
      <div class="section__inner">
        <div class="cta-band">
          <h2>Bring your idea. Tell us where you're stuck.</h2>
          <p>Start Module 1 — Problem Validation — and get your first feed-forward today.</p>
          <div class="hero__cta">
            <a class="btn btn--primary btn--lg" href="${cta}">${ctaLabel} →</a>
          </div>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="site-footer__inner">
        <div class="brand">
          <div class="brand__mark" style="background:var(--c-ink);color:var(--c-paper)">U</div>
          <div><div class="brand__title">Unknown University</div></div>
        </div>
        <small>An inspired-by, fictional applied-entrepreneurship campus. No real ranking, recording, or faculty claims. © Unknown University.</small>
      </div>
    </footer>
  </div>`;

  function onMount() {
    // Smooth in-page anchors without changing the hash route.
    document.querySelectorAll('.site a[href^="#"]:not([href^="#/"])').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  return { html, onMount };
}

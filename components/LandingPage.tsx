import Link from 'next/link'

const CARDS = [
  {
    title: 'AI founder coach',
    body: 'A coach that reads your specific venture and pushes back like an operator — not a generic chatbot, not a search box.',
  },
  {
    title: 'Practical output',
    body: 'You leave each round with real founder work: a sharpened problem, a customer to interview, a concrete next action.',
  },
  {
    title: 'Feed-forward, not grades',
    body: 'No scores to game. Every review tells you what is missing and exactly what to do before you build.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-unknown-black text-unknown-white">
      <div className="mx-auto flex max-w-5xl flex-col px-6 py-16 md:py-24">
        <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-unknown-yellow">
          Unknown Digital Campus
        </div>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Build your startup like you are inside an applied entrepreneurship
          university.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
          Unknown Digital Campus turns your venture idea into founder work,
          feed-forward coaching, and a go/no-go path through Problem Validation.
        </p>

        <div className="mt-10">
          <Link
            href="/intake"
            className="inline-flex items-center justify-center rounded-md bg-unknown-yellow px-7 py-3.5 text-base font-semibold text-unknown-black transition hover:brightness-95"
          >
            Start founder assessment
          </Link>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-white/10 bg-unknown-gray p-6"
            >
              <h2 className="text-lg font-semibold text-unknown-white">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {card.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-16 text-sm text-white/40">
          Module 1 · Problem Validation — test your assumptions before you build.
        </p>
      </div>
    </main>
  )
}

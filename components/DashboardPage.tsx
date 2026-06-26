'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/state'
import PoweredByBadge from '@/components/PoweredByBadge'
import type { Feedback } from '@/lib/types'

const STATUS_CONFIG: Record<
  Feedback['status'],
  { label: string; pill: string; ring: string }
> = {
  not_ready: {
    label: 'No-go: revise first',
    pill: 'bg-red-500/15 text-red-300 border-red-500/40',
    ring: 'border-red-500/40',
  },
  almost_ready: {
    label: 'Almost ready',
    pill: 'bg-unknown-yellow/15 text-unknown-yellow border-unknown-yellow/40',
    ring: 'border-unknown-yellow/40',
  },
  ready: {
    label: 'Go: ready to advance',
    pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    ring: 'border-emerald-500/40',
  },
}

function List({
  title,
  items,
  marker,
}: {
  title: string
  items: string[]
  marker: string
}) {
  if (!items.length) return null
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-md border border-white/10 bg-unknown-gray p-4 text-white/85"
          >
            <span aria-hidden="true" className="text-unknown-yellow">
              {marker}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [state] = useAppState()
  const { submissions } = state
  const latest = submissions.at(-1)

  useEffect(() => {
    if (!latest) router.replace('/submit')
  }, [latest, router])

  if (!latest) return null

  const feedback = latest.feedback
  const status = STATUS_CONFIG[feedback.status]

  return (
    <main className="min-h-screen bg-unknown-black text-unknown-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-unknown-yellow">
            Problem Validation · Coaching
          </div>
          <PoweredByBadge poweredBy={feedback.poweredBy} />
        </div>

        {/* Go / no-go headline */}
        <div className={`mt-6 rounded-xl border ${status.ring} bg-unknown-gray p-8`}>
          <span
            className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wide ${status.pill}`}
          >
            {status.label}
          </span>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-white/50">
            Current level
          </p>
          <p className="text-2xl font-bold text-unknown-white">
            {feedback.currentLevel}
          </p>
        </div>

        {feedback.unlockNextModule && (
          <div className="mt-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-5 text-emerald-200">
            <span className="font-semibold">Next module unlocked.</span> Your
            problem is validated enough to move on from Problem Validation.
          </div>
        )}

        {/* Specific feedback */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Coach feedback
          </h2>
          <p className="mt-2 leading-relaxed text-white/85">
            {feedback.specificFeedback}
          </p>
        </section>

        <List title="Strengths" items={feedback.strengths} marker="✓" />
        <List title="What's missing" items={feedback.missing} marker="→" />

        {/* Improved example */}
        {feedback.improvedExample && (
          <section className="mt-8 rounded-lg border border-white/10 bg-unknown-gray p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
              Improved example
            </h2>
            <p className="mt-2 italic leading-relaxed text-white/85">
              {feedback.improvedExample}
            </p>
          </section>
        )}

        {/* Next action */}
        <section className="mt-8 rounded-lg border border-unknown-yellow/30 bg-unknown-yellow/5 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-unknown-yellow">
            Your next action
          </h2>
          <p className="mt-2 leading-relaxed text-white/90">{feedback.nextAction}</p>
        </section>

        {/* Submission history */}
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Submission history
          </h2>
          <ol className="mt-3 space-y-2">
            {submissions.map((record, i) => (
              <li
                key={record.submittedAt}
                className="flex items-center justify-between rounded-md border border-white/10 bg-unknown-gray px-4 py-3 text-sm"
              >
                <span className="text-white/70">
                  Submission {i + 1} ·{' '}
                  {new Date(record.submittedAt).toLocaleString()}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CONFIG[record.feedback.status].pill}`}
                >
                  {STATUS_CONFIG[record.feedback.status].label}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/submit"
            className="inline-flex items-center justify-center rounded-md bg-unknown-yellow px-7 py-3.5 text-base font-semibold text-unknown-black transition hover:brightness-95"
          >
            Iterate &amp; resubmit
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-md border border-white/15 px-7 py-3.5 text-base font-semibold text-unknown-white transition hover:border-white/40"
          >
            Back to profile
          </Link>
        </div>
      </div>
    </main>
  )
}

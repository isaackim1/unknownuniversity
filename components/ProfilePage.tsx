'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/state'
import PoweredByBadge from '@/components/PoweredByBadge'

export default function ProfilePage() {
  const router = useRouter()
  const [state] = useAppState()
  const { profile } = state

  useEffect(() => {
    if (!profile) router.replace('/intake')
  }, [profile, router])

  if (!profile) return null

  const score = Math.max(0, Math.min(100, profile.readinessScore))

  return (
    <main className="min-h-screen bg-unknown-black text-unknown-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-unknown-yellow">
            Founder profile
          </div>
          <PoweredByBadge poweredBy={profile.poweredBy} />
        </div>

        <h1 className="mt-4 text-3xl font-bold md:text-4xl">{profile.founderStage}</h1>
        <p className="mt-4 text-lg leading-relaxed text-white/80">
          {profile.ventureSummary}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-unknown-yellow/40 bg-unknown-yellow/10 px-3 py-1.5 text-sm font-semibold text-unknown-yellow">
          Recommended module · {profile.recommendedModule}
        </div>

        {/* Readiness score */}
        <div className="mt-10 rounded-lg border border-white/10 bg-unknown-gray p-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-white/60">
              Readiness score
            </span>
            <span className="text-2xl font-bold text-unknown-yellow">{score}%</span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-unknown-black">
            <div
              className="h-full rounded-full bg-unknown-yellow transition-all"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Biggest risk */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Biggest risk
          </h2>
          <p className="mt-2 leading-relaxed text-white/85">{profile.biggestRisk}</p>
        </section>

        {/* Risky assumptions */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Risky assumptions to test
          </h2>
          <ul className="mt-3 space-y-2">
            {profile.riskyAssumptions.map((assumption, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-md border border-white/10 bg-unknown-gray p-4 text-white/85"
              >
                <span className="font-bold text-unknown-yellow">{i + 1}</span>
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Next action */}
        <section className="mt-8 rounded-lg border border-unknown-yellow/30 bg-unknown-yellow/5 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-unknown-yellow">
            Your next action
          </h2>
          <p className="mt-2 leading-relaxed text-white/90">{profile.nextAction}</p>
        </section>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/submit"
            className="inline-flex items-center justify-center rounded-md bg-unknown-yellow px-7 py-3.5 text-base font-semibold text-unknown-black transition hover:brightness-95"
          >
            Start Problem Validation
          </Link>
          <Link
            href="/intake"
            className="inline-flex items-center justify-center rounded-md border border-white/15 px-7 py-3.5 text-base font-semibold text-unknown-white transition hover:border-white/40"
          >
            Edit intake
          </Link>
        </div>
      </div>
    </main>
  )
}

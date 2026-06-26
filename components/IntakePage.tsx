'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/state'
import type { FounderIntake, FounderProfile, Stage } from '@/lib/types'

const STAGES: { value: Stage; label: string }[] = [
  { value: 'idea', label: 'Idea — concept and problem definition' },
  { value: 'early-testing', label: 'Early testing — talking to first users' },
  { value: 'first-customers', label: 'First customers — early traction' },
  { value: 'growing', label: 'Growing — scaling what works' },
]

const FIELD =
  'w-full rounded-md border border-white/15 bg-unknown-black px-4 py-3 text-unknown-white placeholder-white/30 outline-none transition focus:border-unknown-yellow'
const LABEL = 'mb-2 block text-sm font-semibold text-unknown-white'

export default function IntakePage() {
  const router = useRouter()
  const [, setState] = useAppState()

  const [form, setForm] = useState<FounderIntake>({
    idea: '',
    targetCustomer: '',
    problem: '',
    stage: 'idea',
    tested: '',
    weeklyTime: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof FounderIntake>(key: K, value: FounderIntake[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`)
      }
      const profile = (await response.json()) as FounderProfile

      setState((prev) => ({
        ...prev,
        intake: form,
        profile,
      }))
      router.push('/profile')
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not generate your profile: ${err.message}. Please try again.`
          : 'Could not generate your profile. Please try again.',
      )
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-unknown-black text-unknown-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-unknown-yellow">
          Founder assessment
        </div>
        <h1 className="text-3xl font-bold md:text-4xl">Tell us about your venture</h1>
        <p className="mt-3 text-white/60">
          Your coach uses this to build a founder profile and route you into
          Problem Validation. Be specific — vague inputs get vague coaching.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className={LABEL} htmlFor="idea">
              What are you building?
            </label>
            <input
              id="idea"
              className={FIELD}
              value={form.idea}
              onChange={(e) => update('idea', e.target.value)}
              placeholder="An AI study trainer for first-year students"
              required
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="targetCustomer">
              Who is it for?
            </label>
            <input
              id="targetCustomer"
              className={FIELD}
              value={form.targetCustomer}
              onChange={(e) => update('targetCustomer', e.target.value)}
              placeholder="First-year economics students"
              required
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="problem">
              What problem are you solving?
            </label>
            <textarea
              id="problem"
              className={`${FIELD} min-h-[96px] resize-y`}
              value={form.problem}
              onChange={(e) => update('problem', e.target.value)}
              placeholder="They don't know what to study first and waste their time"
              required
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="stage">
              What stage are you at?
            </label>
            <select
              id="stage"
              className={FIELD}
              value={form.stage}
              onChange={(e) => update('stage', e.target.value as Stage)}
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value} className="bg-unknown-black">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="tested">
              What have you already tested?
            </label>
            <textarea
              id="tested"
              className={`${FIELD} min-h-[80px] resize-y`}
              value={form.tested}
              onChange={(e) => update('tested', e.target.value)}
              placeholder="Nothing yet — just the idea"
              required
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="weeklyTime">
              How much time can you put in each week?
            </label>
            <input
              id="weeklyTime"
              className={FIELD}
              value={form.weeklyTime}
              onChange={(e) => update('weeklyTime', e.target.value)}
              placeholder="6 hours"
              required
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md bg-unknown-yellow px-7 py-3.5 text-base font-semibold text-unknown-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Building your founder profile…' : 'Generate founder profile'}
          </button>
        </form>
      </div>
    </main>
  )
}

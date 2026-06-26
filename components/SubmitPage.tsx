'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/state'
import type { Feedback, Submission } from '@/lib/types'

const FIELD =
  'w-full rounded-md border border-white/15 bg-unknown-black px-4 py-3 text-unknown-white placeholder-white/30 outline-none transition focus:border-unknown-yellow'
const LABEL = 'mb-2 block text-sm font-semibold text-unknown-white'

export default function SubmitPage() {
  const router = useRouter()
  const [state, setState] = useAppState()
  const { intake, profile, submissions } = state

  const [problemHypothesis, setProblemHypothesis] = useState('')
  const [questionsText, setQuestionsText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!intake || !profile) router.replace('/intake')
  }, [intake, profile, router])

  if (!intake || !profile) return null

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const interviewQuestions = questionsText
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean)

    const submission: Submission = { problemHypothesis, interviewQuestions }
    const previousFeedback = submissions.map((record) => record.feedback)

    try {
      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intake,
          profile,
          submission,
          previousFeedback,
        }),
      })
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`)
      }
      const feedback = (await response.json()) as Feedback

      setState((prev) => ({
        ...prev,
        submissions: [
          ...prev.submissions,
          { submittedAt: new Date().toISOString(), submission, feedback },
        ],
        goNoGoStatus: feedback.status,
      }))
      router.push('/dashboard')
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not generate feedback: ${err.message}. Please try again.`
          : 'Could not generate feedback. Please try again.',
      )
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-unknown-black text-unknown-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-unknown-yellow">
          Problem Validation · Submit work
        </div>
        <h1 className="text-3xl font-bold md:text-4xl">Submit your validation work</h1>
        <p className="mt-3 text-white/60">
          State the problem you believe is real, then draft the interview
          questions you would use to test it. Your coach reviews this as
          feed-forward — not a grade.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className={LABEL} htmlFor="problemHypothesis">
              Problem hypothesis
            </label>
            <textarea
              id="problemHypothesis"
              className={`${FIELD} min-h-[120px] resize-y`}
              value={problemHypothesis}
              onChange={(e) => setProblemHypothesis(e.target.value)}
              placeholder="First-year economics students lose hours each week deciding what to study first, and end up studying the wrong things before exams."
              required
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="interviewQuestions">
              Interview questions
            </label>
            <textarea
              id="interviewQuestions"
              className={`${FIELD} min-h-[180px] resize-y`}
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
              placeholder={
                'One question per line, e.g.\nTell me about the last time you sat down to study for an exam.\nWhat did you decide to study first, and why?\nWhat made that hard?'
              }
              required
            />
            <p className="mt-2 text-sm text-white/40">
              Write one question per line — we send them as a list to your coach.
            </p>
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
            {loading ? 'Coaching your submission…' : 'Submit for feed-forward'}
          </button>
        </form>
      </div>
    </main>
  )
}

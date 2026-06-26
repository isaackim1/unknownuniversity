import { fallbackFeedback } from '@/lib/fallbacks'
import type { Feedback, FeedbackRequest, Submission } from '@/lib/types'

const FLUXZERO_TIMEOUT_MS = 8_000
const DEFAULT_FLUXZERO_BASE_URL = 'http://localhost:8080'

function getFluxzeroBaseUrl(): string {
  return (process.env.FLUXZERO_BASE_URL || DEFAULT_FLUXZERO_BASE_URL).replace(/\/+$/, '')
}

function toWarningMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown proxy error'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isFeedback(value: unknown): value is Feedback {
  if (!isRecord(value)) return false

  return (
    (value.status === 'not_ready' ||
      value.status === 'almost_ready' ||
      value.status === 'ready') &&
    typeof value.currentLevel === 'string' &&
    isStringArray(value.strengths) &&
    isStringArray(value.missing) &&
    typeof value.specificFeedback === 'string' &&
    typeof value.improvedExample === 'string' &&
    typeof value.nextAction === 'string' &&
    typeof value.unlockNextModule === 'boolean' &&
    value.poweredBy === 'fluxzero'
  )
}

function normalizeInterviewQuestions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  }

  return []
}

function normalizeSubmission(submission: Partial<Submission> | undefined): {
  problemHypothesis: unknown
  interviewQuestions: string[]
} {
  return {
    problemHypothesis: submission?.problemHypothesis,
    interviewQuestions: normalizeInterviewQuestions(submission?.interviewQuestions),
  }
}

function toFluxzeroFeedbackPayload(request: Partial<FeedbackRequest>): Record<string, unknown> {
  return {
    intake: request.intake,
    profile: request.profile,
    submission: normalizeSubmission(request.submission),
    previousFeedback: request.previousFeedback,
  }
}

async function postFeedbackToFluxzero(request: Partial<FeedbackRequest>): Promise<Feedback> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FLUXZERO_TIMEOUT_MS)

  try {
    const response = await fetch(`${getFluxzeroBaseUrl()}/api/generate-feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(toFluxzeroFeedbackPayload(request)),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Fluxzero feedback returned ${response.status}`)
    }

    const data: unknown = await response.json()
    if (!isFeedback(data)) {
      throw new Error('Fluxzero feedback response was invalid')
    }

    return data
  } finally {
    clearTimeout(timeout)
  }
}

export async function POST(request: Request) {
  let body: Partial<FeedbackRequest> = {}

  try {
    const parsed: unknown = await request.json()
    body = isRecord(parsed) ? (parsed as Partial<FeedbackRequest>) : {}
  } catch (error) {
    console.warn('Using local fallback feedback:', toWarningMessage(error))
    return Response.json(fallbackFeedback(body))
  }

  try {
    return Response.json(await postFeedbackToFluxzero(body))
  } catch (error) {
    console.warn('Using local fallback feedback:', toWarningMessage(error))
    return Response.json(fallbackFeedback(body))
  }
}

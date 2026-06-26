import { fallbackProfile } from '@/lib/fallbacks'
import type { FounderIntake, FounderProfile } from '@/lib/types'

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

function isFounderProfile(value: unknown): value is FounderProfile {
  if (!isRecord(value)) return false

  return (
    typeof value.ventureSummary === 'string' &&
    typeof value.founderStage === 'string' &&
    value.recommendedModule === 'Problem Validation' &&
    typeof value.biggestRisk === 'string' &&
    isStringArray(value.riskyAssumptions) &&
    typeof value.readinessScore === 'number' &&
    Number.isFinite(value.readinessScore) &&
    typeof value.nextAction === 'string' &&
    value.poweredBy === 'fluxzero'
  )
}

function toFluxzeroProfilePayload(intake: Partial<FounderIntake>): Record<string, unknown> {
  const weeklyTime =
    (intake as Partial<FounderIntake> & { weeklyTime?: unknown }).weeklyTime ??
    intake.weeklyHours

  return {
    idea: intake.idea,
    targetCustomer: intake.targetCustomer,
    problem: intake.problem,
    stage: intake.stage,
    tested: intake.tested,
    weeklyTime: String(weeklyTime ?? ''),
  }
}

async function postProfileToFluxzero(intake: Partial<FounderIntake>): Promise<FounderProfile> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FLUXZERO_TIMEOUT_MS)

  try {
    const response = await fetch(`${getFluxzeroBaseUrl()}/api/generate-profile`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(toFluxzeroProfilePayload(intake)),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Fluxzero profile returned ${response.status}`)
    }

    const data: unknown = await response.json()
    if (!isFounderProfile(data)) {
      throw new Error('Fluxzero profile response was invalid')
    }

    return data
  } finally {
    clearTimeout(timeout)
  }
}

export async function POST(request: Request) {
  let intake: Partial<FounderIntake> = {}

  try {
    const parsed: unknown = await request.json()
    intake = isRecord(parsed) ? (parsed as Partial<FounderIntake>) : {}
  } catch (error) {
    console.warn('Using local fallback profile:', toWarningMessage(error))
    return Response.json(fallbackProfile(intake))
  }

  try {
    return Response.json(await postProfileToFluxzero(intake))
  } catch (error) {
    console.warn('Using local fallback profile:', toWarningMessage(error))
    return Response.json(fallbackProfile(intake))
  }
}

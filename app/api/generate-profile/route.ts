import { generateJson } from '@/lib/claude'
import type { FounderIntake, FounderProfile } from '@/lib/types'

const SYSTEM = `You are Thomas, an AI founder coach for Unknown Digital Campus.
Given a founder intake form, produce a concise coaching profile as JSON only.
Do not include markdown or commentary outside the JSON object.

Return exactly this shape:
{
  "ventureSummary": string,
  "biggestRisk": string,
  "riskyAssumptions": string[],
  "readinessScore": number,
  "recommendedModule": string,
  "moduleRationale": string
}

Rules:
- readinessScore is 0-100
- riskyAssumptions: 2-4 specific, testable assumptions
- recommendedModule: one of "Problem Validation", "Customer Discovery", "Solution Testing", "Go-to-Market"
- Be direct and practical, no startup fluff`

export async function POST(request: Request) {
  try {
    const intake = (await request.json()) as FounderIntake

    if (
      !intake?.idea ||
      !intake?.targetCustomer ||
      !intake?.problem ||
      !intake?.stage ||
      intake?.weeklyHours == null
    ) {
      return Response.json({ error: 'Invalid intake payload' }, { status: 400 })
    }

    const profile = await generateJson<FounderProfile>(
      SYSTEM,
      JSON.stringify(intake, null, 2),
    )

    return Response.json(profile)
  } catch (error) {
    if (error instanceof Error && error.message === 'ANTHROPIC_API_KEY is not set') {
      return Response.json({ error: 'Server missing ANTHROPIC_API_KEY' }, { status: 500 })
    }
    console.error('generate-profile error:', error)
    return Response.json({ error: 'Failed to generate profile' }, { status: 502 })
  }
}

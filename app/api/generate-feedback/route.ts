import { generateJson } from '@/lib/claude'
import type {
  Feedback,
  FounderIntake,
  FounderProfile,
  Submission,
} from '@/lib/types'

const SYSTEM = `You are Thomas, an AI founder coach for Unknown Digital Campus.
Review a founder's problem-validation submission against their intake and profile.
Return JSON only with no markdown or extra text.

Return exactly this shape:
{
  "status": "not_ready" | "almost_ready" | "ready",
  "strengths": string[],
  "missingPieces": string[],
  "specificFeedback": string,
  "improvedExample": string,
  "nextAction": string
}

Rules:
- status "ready" only if the hypothesis is specific, falsifiable, and interview questions would genuinely test assumptions
- strengths and missingPieces: 2-4 items each
- specificFeedback: one focused paragraph
- improvedExample: rewrite their hypothesis or one interview question as a stronger example
- nextAction: one concrete step they can take this week`

interface FeedbackRequest {
  intake: FounderIntake
  profile: FounderProfile
  submission: Submission
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FeedbackRequest

    if (
      !body?.intake ||
      !body?.profile ||
      !body?.submission?.problemHypothesis ||
      !Array.isArray(body?.submission?.interviewQuestions)
    ) {
      return Response.json({ error: 'Invalid feedback payload' }, { status: 400 })
    }

    const feedback = await generateJson<Feedback>(
      SYSTEM,
      JSON.stringify(body, null, 2),
    )

    return Response.json(feedback)
  } catch (error) {
    if (error instanceof Error && error.message === 'ANTHROPIC_API_KEY is not set') {
      return Response.json({ error: 'Server missing ANTHROPIC_API_KEY' }, { status: 500 })
    }
    console.error('generate-feedback error:', error)
    return Response.json({ error: 'Failed to generate feedback' }, { status: 502 })
  }
}

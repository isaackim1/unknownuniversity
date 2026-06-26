import type { Feedback, FeedbackRequest, FounderIntake, FounderProfile } from '@/lib/types'

const DEFAULT_PROFILE_NEXT_ACTION =
  'Interview five people from one specific customer segment before refining the solution.'

const DEFAULT_FEEDBACK_NEXT_ACTION =
  'Interview five people from one specific customer segment before changing the solution.'

function text(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function stageLabel(stage: unknown): string {
  switch (stage) {
    case 'early-testing':
      return 'Early testing'
    case 'first-customers':
      return 'First customers'
    case 'growing':
      return 'Growing'
    case 'idea':
      return 'Idea stage'
    default:
      return 'Idea stage'
  }
}

export function fallbackProfile(intake: Partial<FounderIntake> = {}): FounderProfile {
  const idea = text(intake.idea, 'This venture')
  const targetCustomer = text(intake.targetCustomer, 'one specific customer segment')
  const problem = text(intake.problem, 'a painful problem')

  return {
    ventureSummary: `${idea} is aimed at ${targetCustomer} who are dealing with ${problem}.`,
    founderStage: stageLabel(intake.stage),
    recommendedModule: 'Problem Validation',
    biggestRisk: `The biggest risk is that ${targetCustomer} may not describe ${problem} as urgent enough to change behavior.`,
    riskyAssumptions: [
      `${targetCustomer} experience ${problem} frequently enough to care.`,
      `${targetCustomer} are willing to discuss this problem before seeing a solution.`,
      `${idea} is solving the highest-priority part of the problem.`,
    ],
    readinessScore: 42,
    nextAction: DEFAULT_PROFILE_NEXT_ACTION,
    poweredBy: 'nextjs-fallback',
  }
}

export function fallbackFeedback(request: Partial<FeedbackRequest> = {}): Feedback {
  const idea = text(request.intake?.idea, 'this venture')
  const targetCustomer = text(request.intake?.targetCustomer, 'the customer segment')
  const problem = text(request.intake?.problem, 'the problem')

  return {
    status: 'not_ready',
    currentLevel: 'Early draft',
    strengths: [
      `The submission keeps ${idea} connected to a concrete problem area.`,
      `There is enough direction to begin learning from ${targetCustomer}.`,
    ],
    missing: [
      'A narrower customer segment with a shared context or trigger.',
      'Interview questions that test the problem before introducing the solution.',
    ],
    specificFeedback: `${idea} is not ready to move to solution design yet because the customer segment or questions are still too broad or solution-led. Focus the next round on whether ${targetCustomer} already feel ${problem} strongly enough to seek a workaround.`,
    improvedExample:
      'Ask: "Tell me about the last time this problem came up. What happened, and what did you do next?"',
    nextAction: DEFAULT_FEEDBACK_NEXT_ACTION,
    unlockNextModule: false,
    poweredBy: 'nextjs-fallback',
  }
}

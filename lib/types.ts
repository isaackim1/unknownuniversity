export type Stage = 'idea' | 'early-testing' | 'first-customers' | 'growing'

export type PoweredBy = 'fluxzero' | 'nextjs-fallback'

export interface FounderIntake {
  idea: string
  targetCustomer: string
  problem: string
  stage: Stage
  tested: string
  weeklyTime: string
  /** Legacy numeric field kept optional so the api proxy route still type-checks. */
  weeklyHours?: number
}

export interface FounderProfile {
  ventureSummary: string
  founderStage: string
  recommendedModule: 'Problem Validation'
  biggestRisk: string
  riskyAssumptions: string[]
  readinessScore: number
  nextAction: string
  poweredBy: PoweredBy
}

export interface Submission {
  problemHypothesis: string
  interviewQuestions: string[] | string
}

export interface Feedback {
  status: 'not_ready' | 'almost_ready' | 'ready'
  currentLevel: string
  strengths: string[]
  missing: string[]
  specificFeedback: string
  improvedExample: string
  nextAction: string
  unlockNextModule: boolean
  poweredBy: PoweredBy
}

export interface FeedbackRequest {
  intake: FounderIntake
  profile: FounderProfile
  submission: Submission
  previousFeedback?: Feedback | Feedback[]
}

export interface SubmissionRecord {
  submittedAt: string
  submission: Submission
  feedback: Feedback
}

export interface AppState {
  intake: FounderIntake | null
  profile: FounderProfile | null
  submissions: SubmissionRecord[]
  currentModule: string
  goNoGoStatus: 'pending' | 'not_ready' | 'almost_ready' | 'ready'
}

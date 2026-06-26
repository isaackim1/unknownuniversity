export type Stage = 'idea' | 'early-testing' | 'first-customers' | 'growing'
export interface FounderIntake {
  idea: string; targetCustomer: string; problem: string;
  stage: Stage; tested: string; weeklyHours: number;
}
export interface FounderProfile {
  ventureSummary: string; biggestRisk: string;
  riskyAssumptions: string[]; readinessScore: number;
  recommendedModule: string; moduleRationale: string;
}
export interface Submission {
  problemHypothesis: string; interviewQuestions: string[];
}
export interface Feedback {
  status: 'not_ready' | 'almost_ready' | 'ready';
  strengths: string[]; missingPieces: string[];
  specificFeedback: string; improvedExample: string; nextAction: string;
}
export interface SubmissionRecord {
  submittedAt: string; submission: Submission; feedback: Feedback;
}
export interface AppState {
  intake: FounderIntake | null; profile: FounderProfile | null;
  submissions: SubmissionRecord[]; currentModule: string;
  goNoGoStatus: 'pending' | 'not_ready' | 'almost_ready' | 'ready';
}

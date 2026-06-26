package com.example.unknown.coaching.api;

import io.fluxzero.sdk.tracking.handling.Request;

/**
 * Fluxzero query that produces a {@link FeedbackResponse}. Handled by {@code CoachingService} as a
 * local query handler, keeping the AI/fallback logic on the Fluxzero message path.
 */
public record GenerateCoachingFeedback(GenerateFeedbackRequest request)
        implements Request<FeedbackResponse> {
}

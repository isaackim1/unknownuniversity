package com.example.unknown.coaching;

import com.example.unknown.coaching.api.FeedbackResponse;
import com.example.unknown.coaching.api.FounderProfileResponse;
import io.fluxzero.sdk.test.TestFixture;
import org.junit.jupiter.api.Test;

import java.util.List;

/**
 * Verifies the public coaching endpoints route through Fluxzero without authentication and always
 * return demo-safe, contract-shaped responses. Assertions check shape only, so they hold whether the
 * response comes from Claude or the deterministic fallback.
 */
class CoachingEndpointTest {

    final TestFixture fixture = TestFixture.create(
            new CoachingEndpoint(), new CoachingService(new ClaudeClient()));

    @Test
    void generateProfileReturnsFluxzeroPoweredProfile() {
        fixture.whenPost("/api/generate-profile", "/coaching/generate-profile-request.json")
                .<FounderProfileResponse>expectResult(r ->
                        "fluxzero".equals(r.poweredBy())
                                && "Problem Validation".equals(r.recommendedModule())
                                && r.readinessScore() >= 0 && r.readinessScore() <= 100
                                && r.riskyAssumptions() != null
                                && r.riskyAssumptions().size() >= 3
                                && r.riskyAssumptions().size() <= 5
                                && notBlank(r.ventureSummary())
                                && notBlank(r.biggestRisk())
                                && notBlank(r.nextAction()));
    }

    @Test
    void generateFeedbackReturnsFluxzeroPoweredFeedback() {
        fixture.whenPost("/api/generate-feedback", "/coaching/generate-feedback-request.json")
                .<FeedbackResponse>expectResult(r ->
                        "fluxzero".equals(r.poweredBy())
                                && List.of("not_ready", "almost_ready", "ready").contains(r.status())
                                && (r.unlockNextModule() == "ready".equals(r.status()))
                                && notBlank(r.specificFeedback())
                                && notBlank(r.nextAction())
                                && r.missing() != null);
    }

    @Test
    void leadingQuestionsAreNotReadyAndStayLocked() {
        fixture.whenPost("/api/generate-feedback", "/coaching/generate-feedback-request.json")
                .<FeedbackResponse>expectResult(r ->
                        // With no API key the deterministic coach flags the leading questions.
                        "not_ready".equals(r.status()) && !r.unlockNextModule());
    }

    private static boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }
}

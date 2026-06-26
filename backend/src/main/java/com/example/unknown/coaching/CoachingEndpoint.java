package com.example.unknown.coaching;

import com.example.unknown.coaching.api.FeedbackResponse;
import com.example.unknown.coaching.api.FounderProfileResponse;
import com.example.unknown.coaching.api.GenerateCoachingFeedback;
import com.example.unknown.coaching.api.GenerateFeedbackRequest;
import com.example.unknown.coaching.api.GenerateFounderProfile;
import com.example.unknown.coaching.api.GenerateProfileRequest;
import io.fluxzero.sdk.Fluxzero;
import io.fluxzero.sdk.tracking.handling.authentication.NoUserRequired;
import io.fluxzero.sdk.web.ApiDoc;
import io.fluxzero.sdk.web.HandlePost;
import io.fluxzero.sdk.web.Path;
import org.springframework.stereotype.Component;

/**
 * Public founder-coaching endpoints for Unknown Digital Campus.
 * <p>
 * {@link NoUserRequired} overrides the package-level {@code @RequiresUser} default so the demo flow
 * needs no authentication. Each request is dispatched as a Fluxzero query and handled by
 * {@code CoachingService}, keeping the AI/fallback logic on the Fluxzero message path. Every
 * successful response carries {@code "poweredBy": "fluxzero"}.
 */
@Component
@Path("/api")
@NoUserRequired
@ApiDoc(tags = "Founder Coaching", description = "AI founder coaching for Unknown Digital Campus.")
public class CoachingEndpoint {

    @HandlePost("/generate-profile")
    @ApiDoc(
            summary = "Generate founder profile",
            operationId = "generateProfile",
            description = "Turns a founder intake into a coaching profile recommending Problem Validation.")
    FounderProfileResponse generateProfile(GenerateProfileRequest request) {
        return Fluxzero.queryAndWait(new GenerateFounderProfile(request));
    }

    @HandlePost("/generate-feedback")
    @ApiDoc(
            summary = "Generate feed-forward coaching",
            operationId = "generateFeedback",
            description = "Reviews a Problem Validation submission and returns feed-forward coaching, not a grade.")
    FeedbackResponse generateFeedback(GenerateFeedbackRequest request) {
        return Fluxzero.queryAndWait(new GenerateCoachingFeedback(request));
    }
}

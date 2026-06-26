package com.example.unknown.coaching.api;

import java.util.List;

/**
 * Coaching profile returned for a founder intake. {@code poweredBy} is always {@code "fluxzero"} and
 * {@code recommendedModule} is always {@code "Problem Validation"} for this MVP.
 */
public record FounderProfileResponse(
        String ventureSummary,
        String founderStage,
        String recommendedModule,
        String biggestRisk,
        List<String> riskyAssumptions,
        int readinessScore,
        String nextAction,
        String poweredBy) {
}

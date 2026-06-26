package com.example.unknown.coaching.api;

import java.util.List;

/**
 * Feed-forward coaching result. Never a grade or score. {@code unlockNextModule} is only ever
 * {@code true} when {@code status} is {@code "ready"}. {@code poweredBy} is always {@code "fluxzero"}.
 */
public record FeedbackResponse(
        String status,
        String currentLevel,
        List<String> strengths,
        List<String> missing,
        String specificFeedback,
        String improvedExample,
        String nextAction,
        boolean unlockNextModule,
        String poweredBy) {
}

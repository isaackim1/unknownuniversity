package com.example.unknown.coaching.api;

/**
 * Intake submitted by a founder to receive a coaching profile.
 * <p>
 * Fields are intentionally lenient (no blank-checks) so the demo never fails with a 400 when a field
 * is empty; {@code CoachingService} defaults any missing value.
 */
public record GenerateProfileRequest(
        String idea,
        String targetCustomer,
        String problem,
        String stage,
        String tested,
        String weeklyTime) {
}

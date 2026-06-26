package com.example.unknown.coaching.api;

import java.util.List;
import java.util.Map;

/**
 * Feed-forward coaching request. {@code profile} and {@code previousFeedback} are accepted as loose
 * structures so the frontend can forward whatever it holds without breaking deserialization.
 */
public record GenerateFeedbackRequest(
        GenerateProfileRequest intake,
        Map<String, Object> profile,
        SubmissionData submission,
        List<Object> previousFeedback) {

    public record SubmissionData(
            String problemHypothesis,
            List<String> interviewQuestions) {
    }
}

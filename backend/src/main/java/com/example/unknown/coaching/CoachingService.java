package com.example.unknown.coaching;

import com.example.unknown.coaching.api.FeedbackResponse;
import com.example.unknown.coaching.api.FounderProfileResponse;
import com.example.unknown.coaching.api.GenerateCoachingFeedback;
import com.example.unknown.coaching.api.GenerateFeedbackRequest;
import com.example.unknown.coaching.api.GenerateFounderProfile;
import com.example.unknown.coaching.api.GenerateProfileRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.fluxzero.sdk.tracking.handling.HandleQuery;
import io.fluxzero.sdk.tracking.handling.LocalHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Founder-coaching brain for Unknown Digital Campus. Runs on the Fluxzero query path as a local
 * handler. It tries Claude first; on any failure (missing key, timeout, transport error, or invalid
 * JSON) it returns a deterministic, venture-specific response. It never throws for AI failures, so
 * the web layer never returns a 500 because of the model.
 */
@Component
@LocalHandler
@Slf4j
public class CoachingService {

    private static final String MODULE = "Problem Validation";
    private static final String POWERED_BY = "fluxzero";
    private static final List<String> VALID_STATUS = List.of("not_ready", "almost_ready", "ready");

    private final ClaudeClient claudeClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CoachingService(ClaudeClient claudeClient) {
        this.claudeClient = claudeClient;
    }

    @HandleQuery
    FounderProfileResponse handle(GenerateFounderProfile query) {
        GenerateProfileRequest request = query.request() == null
                ? new GenerateProfileRequest(null, null, null, null, null, null)
                : query.request();
        return tryClaudeProfile(request).orElseGet(() -> fallbackProfile(request));
    }

    @HandleQuery
    FeedbackResponse handle(GenerateCoachingFeedback query) {
        GenerateFeedbackRequest request = query.request() == null
                ? new GenerateFeedbackRequest(null, null, null, null)
                : query.request();
        return tryClaudeFeedback(request).orElseGet(() -> fallbackFeedback(request));
    }

    // ------------------------------------------------------------------
    // Claude path: profile
    // ------------------------------------------------------------------

    private Optional<FounderProfileResponse> tryClaudeProfile(GenerateProfileRequest r) {
        String system = """
                You are the Unknown Digital Campus founder coach.
                Coach, do not lecture. Give feed-forward, not grades.
                Always reference the founder's specific venture. Never invent traction, customers, revenue, or evidence.
                Problem Validation means disproving assumptions before building.
                Respond with raw JSON only. No markdown, no prose, no code fences.
                Use exactly this shape:
                {
                  "ventureSummary": string,
                  "founderStage": string,
                  "biggestRisk": string,
                  "riskyAssumptions": string[3..5],
                  "readinessScore": number(0-100),
                  "nextAction": string
                }
                Rules: biggestRisk and nextAction must be specific to this venture. nextAction must be doable this week.
                Do not mention grades or exams.""";

        String user = """
                Founder intake:
                - Idea: %s
                - Target customer: %s
                - Problem: %s
                - Stage: %s
                - Already tested: %s
                - Weekly time: %s""".formatted(
                orUnknown(r.idea()), orUnknown(r.targetCustomer()), orUnknown(r.problem()),
                orUnknown(r.stage()), orUnknown(r.tested()), orUnknown(r.weeklyTime()));

        return claudeClient.complete(system, user).flatMap(text -> parseProfile(text, r));
    }

    private Optional<FounderProfileResponse> parseProfile(String text, GenerateProfileRequest r) {
        try {
            JsonNode node = objectMapper.readTree(stripFences(text));
            String summary = textOf(node, "ventureSummary");
            String stage = textOf(node, "founderStage");
            String risk = textOf(node, "biggestRisk");
            String nextAction = textOf(node, "nextAction");
            List<String> assumptions = stringList(node.get("riskyAssumptions"));

            if (isBlank(summary) || isBlank(risk) || isBlank(nextAction) || assumptions.size() < 3) {
                log.warn("Claude profile JSON missing required fields; using fallback");
                return Optional.empty();
            }
            int score = clampScore(node.path("readinessScore").asInt(defaultScore(r.stage())));
            return Optional.of(new FounderProfileResponse(
                    summary,
                    isBlank(stage) ? defaultFounderStage(r.stage()) : stage,
                    MODULE,
                    risk,
                    trimAssumptions(assumptions),
                    score,
                    nextAction,
                    POWERED_BY));
        } catch (Exception e) {
            log.warn("Could not parse Claude profile ({}); using fallback", e.toString());
            return Optional.empty();
        }
    }

    // ------------------------------------------------------------------
    // Claude path: feedback
    // ------------------------------------------------------------------

    private Optional<FeedbackResponse> tryClaudeFeedback(GenerateFeedbackRequest r) {
        GenerateProfileRequest intake = r.intake() == null
                ? new GenerateProfileRequest(null, null, null, null, null, null)
                : r.intake();
        GenerateFeedbackRequest.SubmissionData submission = r.submission() == null
                ? new GenerateFeedbackRequest.SubmissionData(null, List.of())
                : r.submission();

        String system = """
                You are the Unknown Digital Campus founder coach reviewing a Problem Validation submission.
                Coach, do not lecture. Give feed-forward, not grades or scores.
                Problem Validation means disproving assumptions before building: discover whether the customer pain is
                real, specific, frequent, and painful enough to matter. Always reference the founder's actual venture.
                End with one concrete next founder action. No generic startup advice.
                Respond with raw JSON only. No markdown, no prose, no code fences.
                Use exactly this shape:
                {
                  "status": "not_ready" | "almost_ready" | "ready",
                  "currentLevel": string,
                  "strengths": string[],
                  "missing": string[],
                  "specificFeedback": string,
                  "improvedExample": string,
                  "nextAction": string,
                  "unlockNextModule": boolean
                }
                Rules: unlockNextModule is true only when status is "ready". not_ready when the customer/problem is vague,
                questions are leading, or the hypothesis is not testable. almost_ready when promising but needs sharper
                customer definition or stronger questions. ready when customer, problem, and validation plan are specific
                enough to proceed.""";

        String user = """
                Venture:
                - Idea: %s
                - Target customer: %s
                - Problem: %s
                - Stage: %s

                Submission:
                - Problem hypothesis: %s
                - Interview questions:
                %s""".formatted(
                orUnknown(intake.idea()), orUnknown(intake.targetCustomer()), orUnknown(intake.problem()),
                orUnknown(intake.stage()), orUnknown(submission.problemHypothesis()),
                numberedQuestions(submission.interviewQuestions()));

        return claudeClient.complete(system, user).flatMap(text -> parseFeedback(text, r));
    }

    private Optional<FeedbackResponse> parseFeedback(String text, GenerateFeedbackRequest r) {
        try {
            JsonNode node = objectMapper.readTree(stripFences(text));
            String status = normalizeStatus(textOf(node, "status"));
            String currentLevel = textOf(node, "currentLevel");
            String specificFeedback = textOf(node, "specificFeedback");
            String improvedExample = textOf(node, "improvedExample");
            String nextAction = textOf(node, "nextAction");
            List<String> strengths = stringList(node.get("strengths"));
            List<String> missing = stringList(node.get("missing"));

            if (status == null || isBlank(specificFeedback) || isBlank(nextAction)) {
                log.warn("Claude feedback JSON missing required fields; using fallback");
                return Optional.empty();
            }
            boolean unlock = "ready".equals(status);
            return Optional.of(new FeedbackResponse(
                    status,
                    isBlank(currentLevel) ? defaultCurrentLevel(status) : currentLevel,
                    strengths.isEmpty() ? List.of("You committed to validating before building.") : strengths,
                    missing,
                    specificFeedback,
                    isBlank(improvedExample) ? "" : improvedExample,
                    nextAction,
                    unlock,
                    POWERED_BY));
        } catch (Exception e) {
            log.warn("Could not parse Claude feedback ({}); using fallback", e.toString());
            return Optional.empty();
        }
    }

    // ------------------------------------------------------------------
    // Deterministic fallback: profile
    // ------------------------------------------------------------------

    private FounderProfileResponse fallbackProfile(GenerateProfileRequest r) {
        String idea = orDefault(r.idea(), "your venture");
        String customer = orDefault(r.targetCustomer(), "your target customer");
        String problem = orDefault(r.problem(), "the problem you described");

        String summary = "You're building %s for %s, aimed at the problem that %s. The work now is to prove that pain is real before you build."
                .formatted(idea, customer, problem);

        String risk = "The biggest risk is assuming %s feel \"%s\" sharply enough to change what they do today — that's unproven until you hear it from them directly."
                .formatted(customer, problem);

        List<String> assumptions = List.of(
                "%s actually experience \"%s\" often enough to care.".formatted(customer, problem),
                "The pain is severe enough that %s already try to solve it some other way.".formatted(customer),
                "%s is the right first customer rather than a broader or narrower group.".formatted(customer),
                "%s would change their current behaviour to adopt %s.".formatted(customer, idea));

        String nextAction = "This week, run 5 problem-discovery interviews with %s about %s. Ask only about their last real experience — do not pitch %s."
                .formatted(customer, problem, idea);

        return new FounderProfileResponse(
                summary,
                defaultFounderStage(r.stage()),
                MODULE,
                risk,
                assumptions,
                defaultScore(r.stage()),
                nextAction,
                POWERED_BY);
    }

    // ------------------------------------------------------------------
    // Deterministic fallback: feedback
    // ------------------------------------------------------------------

    private FeedbackResponse fallbackFeedback(GenerateFeedbackRequest r) {
        GenerateProfileRequest intake = r.intake() == null
                ? new GenerateProfileRequest(null, null, null, null, null, null)
                : r.intake();
        GenerateFeedbackRequest.SubmissionData submission = r.submission() == null
                ? new GenerateFeedbackRequest.SubmissionData(null, List.of())
                : r.submission();

        String idea = orDefault(intake.idea(), "your venture");
        String customer = orDefault(intake.targetCustomer(), "your target customer");
        String problem = orDefault(intake.problem(), "the problem you described");
        String hypothesis = submission.problemHypothesis();
        List<String> questions = submission.interviewQuestions() == null ? List.of() : submission.interviewQuestions();

        long leadingCount = questions.stream().filter(CoachingService::isLeadingQuestion).count();
        boolean hypothesisTestable = isTestableHypothesis(hypothesis);
        boolean enoughQuestions = questions.size() >= 5;

        String status;
        if (!hypothesisTestable || leadingCount >= 3 || !enoughQuestions) {
            status = "not_ready";
        } else if (leadingCount >= 1) {
            status = "almost_ready";
        } else {
            status = "ready";
        }

        List<String> strengths = new ArrayList<>();
        strengths.add("You're putting %s in front of real conversations with %s instead of building first."
                .formatted(idea, customer));
        if (enoughQuestions) {
            strengths.add("You prepared a full set of interview questions to take into the field.");
        }
        if (hypothesisTestable) {
            strengths.add("Your hypothesis is specific enough that interviews could actually disprove it.");
        }

        List<String> missing = new ArrayList<>();
        if (!hypothesisTestable) {
            missing.add("Your hypothesis isn't yet falsifiable — it should name who hurts, around what, and how often, so an interview could prove it wrong.");
        }
        if (leadingCount >= 1) {
            missing.add("%d of your questions are leading (they invite a polite \"yes\" rather than the truth about %s)."
                    .formatted(leadingCount, problem));
        }
        if (!enoughQuestions) {
            missing.add("You have %d interview questions — aim for 5 that dig into past behaviour, not future intentions."
                    .formatted(questions.size()));
        }
        if (missing.isEmpty()) {
            missing.add("Add a question that uncovers what %s currently spend (time or money) working around %s."
                    .formatted(customer, problem));
        }

        String specificFeedback = ("For %s, the goal right now is to disprove that %s is a real, frequent, painful problem for %s — "
                + "not to confirm that your idea is good. Questions like \"Would you use this?\" predict the future and "
                + "people are kind, so they say yes. Instead, dig into what %s actually did the last time they hit %s. "
                + "If you can't yet picture how a single interview could prove you wrong, the hypothesis needs sharpening first.")
                .formatted(idea, problem, customer, customer, problem);

        String improvedExample = buildImprovedExample(questions, customer, problem);

        String nextAction = "This week, interview 5 %s about the last time they faced %s. Don't mention %s — just map what they did, how long it took, and what it cost them."
                .formatted(customer, problem, idea);

        boolean unlock = "ready".equals(status);

        return new FeedbackResponse(
                status,
                defaultCurrentLevel(status),
                strengths,
                missing,
                specificFeedback,
                improvedExample,
                nextAction,
                unlock,
                POWERED_BY);
    }

    private static String buildImprovedExample(List<String> questions, String customer, String problem) {
        String leading = questions.stream().filter(CoachingService::isLeadingQuestion).findFirst().orElse(null);
        String rewritten = "Walk me through the last time you ran into %s — what did you do, and what did it cost you?"
                .formatted(problem);
        if (leading != null) {
            return "Instead of \"%s\", ask: \"%s\" It surfaces real past behaviour from %s rather than a polite guess."
                    .formatted(leading.trim(), rewritten, customer);
        }
        return "Add this behavioural question: \"%s\" It surfaces what %s already do about %s today."
                .formatted(rewritten, customer, problem);
    }

    // ------------------------------------------------------------------
    // Heuristics & helpers
    // ------------------------------------------------------------------

    private static boolean isLeadingQuestion(String question) {
        if (question == null) {
            return false;
        }
        String q = question.toLowerCase(Locale.ROOT).trim();
        return q.startsWith("would you")
                || q.startsWith("do you like")
                || q.startsWith("will you")
                || q.startsWith("should we")
                || q.startsWith("don't you")
                || q.startsWith("wouldn't you")
                || q.contains("would you pay")
                || q.contains("do you think this");
    }

    private static boolean isTestableHypothesis(String hypothesis) {
        if (isBlank(hypothesis)) {
            return false;
        }
        String h = hypothesis.toLowerCase(Locale.ROOT);
        boolean tooGeneric = h.contains("because studying is hard")
                || h.contains("everyone")
                || (h.contains("need") && h.length() < 60);
        return !tooGeneric && hypothesis.trim().length() >= 40;
    }

    private static int defaultScore(String stage) {
        if (stage == null) {
            return 30;
        }
        return switch (stage.toLowerCase(Locale.ROOT).trim()) {
            case "early-testing", "early testing" -> 45;
            case "first-customers", "first customers" -> 65;
            case "growing" -> 80;
            default -> 30;
        };
    }

    private static String defaultFounderStage(String stage) {
        if (stage == null) {
            return "Idea-stage founder";
        }
        return switch (stage.toLowerCase(Locale.ROOT).trim()) {
            case "early-testing", "early testing" -> "Early-testing founder";
            case "first-customers", "first customers" -> "First-customers founder";
            case "growing" -> "Growth-stage founder";
            default -> "Idea-stage founder";
        };
    }

    private static String defaultCurrentLevel(String status) {
        return switch (status) {
            case "ready" -> "Validation-ready";
            case "almost_ready" -> "Sharpening your validation";
            default -> "Early problem framing";
        };
    }

    private String normalizeStatus(String status) {
        if (status == null) {
            return null;
        }
        String s = status.toLowerCase(Locale.ROOT).trim();
        return VALID_STATUS.contains(s) ? s : null;
    }

    private static String numberedQuestions(List<String> questions) {
        if (questions == null || questions.isEmpty()) {
            return "(none provided)";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < questions.size(); i++) {
            sb.append(i + 1).append(". ").append(questions.get(i)).append('\n');
        }
        return sb.toString().stripTrailing();
    }

    private List<String> stringList(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(item -> {
                String value = item.asText(null);
                if (value != null && !value.isBlank()) {
                    result.add(value);
                }
            });
        }
        return result;
    }

    private static List<String> trimAssumptions(List<String> assumptions) {
        return assumptions.size() > 5 ? new ArrayList<>(assumptions.subList(0, 5)) : assumptions;
    }

    private String textOf(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    private static String stripFences(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline > 0) {
                trimmed = trimmed.substring(firstNewline + 1);
            }
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.length() - 3);
            }
        }
        return trimmed.trim();
    }

    private static int clampScore(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String orDefault(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private static String orUnknown(String value) {
        return isBlank(value) ? "(not provided)" : value.trim();
    }
}

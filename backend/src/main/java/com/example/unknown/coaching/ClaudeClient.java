package com.example.unknown.coaching;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;

/**
 * Thin Anthropic Messages API client built on {@link java.net.http.HttpClient}. Adds no new Maven
 * dependency. The client is intentionally fail-soft: any missing key, timeout, transport error, or
 * unexpected response shape results in an empty {@link Optional} so callers fall back deterministically.
 */
@Component
@Slf4j
public class ClaudeClient {

    private static final String ENDPOINT = "https://api.anthropic.com/v1/messages";
    private static final String ANTHROPIC_VERSION = "2023-06-01";
    private static final String DEFAULT_MODEL = "claude-3-5-sonnet-latest";
    private static final Duration TIMEOUT = Duration.ofSeconds(8);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(TIMEOUT)
            .build();

    /** Whether an API key is configured. When false, callers should go straight to fallback. */
    public boolean isEnabled() {
        return apiKey() != null && !apiKey().isBlank();
    }

    /**
     * Sends a single-turn request to Claude and returns the raw assistant text (expected to be JSON).
     * Returns {@link Optional#empty()} on any failure so the caller can fall back without a 500.
     */
    public Optional<String> complete(String systemPrompt, String userPrompt) {
        if (!isEnabled()) {
            return Optional.empty();
        }
        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("model", model());
            body.put("max_tokens", 1024);
            body.put("system", systemPrompt);
            ArrayNode messages = body.putArray("messages");
            ObjectNode message = messages.addObject();
            message.put("role", "user");
            message.put("content", userPrompt);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(ENDPOINT))
                    .timeout(TIMEOUT)
                    .header("content-type", "application/json")
                    .header("x-api-key", apiKey())
                    .header("anthropic-version", ANTHROPIC_VERSION)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                log.warn("Claude returned status {}; using deterministic fallback", response.statusCode());
                return Optional.empty();
            }
            return extractText(response.body());
        } catch (Exception e) {
            log.warn("Claude call failed ({}); using deterministic fallback", e.toString());
            return Optional.empty();
        }
    }

    private Optional<String> extractText(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode content = root.path("content");
            if (content.isArray()) {
                for (JsonNode block : content) {
                    if ("text".equals(block.path("type").asText()) && block.hasNonNull("text")) {
                        String text = block.get("text").asText();
                        if (!text.isBlank()) {
                            return Optional.of(text);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not parse Claude response ({}); using deterministic fallback", e.toString());
        }
        return Optional.empty();
    }

    private String apiKey() {
        return System.getenv("ANTHROPIC_API_KEY");
    }

    private String model() {
        String model = System.getenv("ANTHROPIC_MODEL");
        return model != null && !model.isBlank() ? model : DEFAULT_MODEL;
    }
}

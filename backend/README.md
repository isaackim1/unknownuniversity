# Unknown Digital Campus Fluxzero Backend

Fluxzero Java backend for the Unknown Digital Campus founder coaching demo.

## Run

```bash
cd backend
./mvnw exec:java
```

Backend URL:

```text
http://localhost:8080
```

## Endpoints

```text
POST /api/generate-profile
POST /api/generate-feedback
```

Frontend should call:

```text
http://localhost:8080/api/generate-profile
http://localhost:8080/api/generate-feedback
```

## Environment Variables

```text
ANTHROPIC_API_KEY optional
ANTHROPIC_MODEL optional
```

If `ANTHROPIC_API_KEY` is missing, the backend uses deterministic fallback responses but still returns:

```json
"poweredBy": "fluxzero"
```

## Example Requests

Generate a founder profile:

```bash
curl -i -X POST http://localhost:8080/api/generate-profile \
  -H "Content-Type: application/json" \
  -d '{"idea":"AI study trainer","targetCustomer":"first-year economics students","problem":"they do not know what to study first","stage":"idea","tested":"nothing yet","weeklyTime":"6 hours"}'
```

Generate feedback:

```bash
curl -i -X POST http://localhost:8080/api/generate-feedback \
  -H "Content-Type: application/json" \
  -d '{"intake":{"idea":"AI study trainer","targetCustomer":"first-year economics students","problem":"they do not know what to study first","stage":"idea","tested":"nothing yet","weeklyTime":"6 hours"},"profile":{},"submission":{"problemHypothesis":"Students need AI because studying is hard","interviewQuestions":["Would you use AI?","Would you pay for this?","Do you like studying?","Would this help you?","Should we build it?"]},"previousFeedback":[]}'
```

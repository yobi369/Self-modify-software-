# API contract

## Base paths

The API is exposed by `api/index.ts` and is mounted by the local development server. The canonical routes are:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Liveness and AI configuration indicator |
| POST | `/api/ai/analyze` | AI-assisted source review |
| POST | `/api/ai/mutate` | Generate an unverified candidate transformation |

Legacy `/api/gemini/*` and unprefixed aliases remain available for compatibility. Prefer canonical `/api/ai/*` routes for new clients.

## Request limits

- JSON request body: 128 KiB maximum.
- Source code: 60,000 characters maximum.
- Language identifier: 1–32 characters, beginning with a letter.
- Analysis focus: 160 characters maximum.
- Mutation technique: one of `instruction_substitution`, `dead_code_insertion`, `dynamic_jit_wrapper`, or `self_healing_guard`.
- Best-effort process-local throttle: 15 AI requests per IP per 60 seconds.

The in-memory throttle is not a global quota or a substitute for a shared/edge rate limiter. In production, both AI endpoints are hard-disabled in code. There is deliberately no environment-variable bypass: configuration alone cannot establish authentication, tenant isolation, or shared quotas. Serverless instances do not share memory. Implement and test those controls before changing this guard. The local process throttle is only a development safeguard.

## Analysis request

```json
{
  "code": "int main(void) { return 0; }",
  "language": "c",
  "focus": "memory safety"
}
```

Success returns `success: true`, an `analysis` object, `simulated: false`, and `verificationStatus: AI_REVIEW_NOT_EXECUTION_VERIFIED`. This means an AI response was returned; it does not mean the code was compiled or executed.

## Mutation request

```json
{
  "code": "int value = 1;",
  "language": "c",
  "mutationType": "instruction_substitution"
}
```

Success returns a candidate source string and `verificationStatus: NOT_VERIFIED`. `behaviorPreserved` is always false until a real baseline/candidate test suite has run. The candidate must be reviewed and independently tested before use.

## Error responses

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_REQUEST` / `INVALID_JSON` | Invalid request shape or JSON |
| 413 | `PAYLOAD_TOO_LARGE` | JSON body exceeds configured limit |
| 429 | `RATE_LIMITED` | Best-effort local throttle exceeded |
| 502 | `AI_PROVIDER_ERROR` / `INVALID_PROVIDER_RESPONSE` | Provider unavailable or response invalid |
| 503 | `AI_API_DISABLED` | Production AI endpoints are disabled until authentication and shared usage controls are configured |
| 503 | `AI_NOT_CONFIGURED` | Server-side API key is missing |
| 504 | `AI_TIMEOUT` | Provider response exceeded timeout |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

Do not return provider credentials, raw stack traces, submitted source code, or provider response internals in error payloads.

# Testing strategy and evidence requirements

## Testing principles

Tests must validate observable behaviour rather than repeat implementation assumptions. A green build is not proof of production readiness. A simulated experiment must never be reported as a real native execution result.

## Test layers

### 1. Static quality

- TypeScript compilation with no emitted files.
- Linting and formatting checks when configured.
- Dependency vulnerability and licence review.
- Secret scanning and static security analysis.
- Build output inspection.

### 2. Unit tests

Test pure utilities and deterministic functions, including:

- Input validation and request schema boundaries.
- Hashing known test vectors.
- Statistical calculations with known datasets.
- Reproducibility record validation.
- Mutation metadata and state transitions.
- Error handling for malformed and incomplete data.

Use table-driven tests for empty values, maximum sizes, invalid enum values, Unicode, boundary numbers, NaN/Infinity, and malformed JSON.

### 3. API integration tests

Exercise health, analysis, and mutation routes using an isolated test application and mocked AI provider. Cover:

- Valid request and valid provider response.
- Missing provider key.
- Provider timeout and upstream errors.
- Invalid JSON and unsupported content types.
- Missing, wrong-type, and oversized fields.
- Unknown language or mutation technique.
- Malformed provider JSON and missing response fields.
- Rate-limit responses and concurrent requests.
- No provider credential leakage in responses or logs.

Tests must not call a paid external provider by default. A separately marked opt-in smoke test may be run with a dedicated low-privilege test key.

### 4. Frontend tests

Cover navigation, form validation, loading states, empty states, provider failures, copy/export actions, accessibility, and truthful labelling of simulated versus verified results. Use keyboard-only checks and representative mobile viewport sizes.

### 5. End-to-end tests

Run critical user journeys against a preview deployment: load the application, open each primary lab, submit valid and invalid analysis requests, view a candidate mutation, and confirm failure states remain understandable. Never execute arbitrary user-supplied native code in the web/API runtime.

### 6. Security tests

Test payload limits, request throttling, injection resistance, secret redaction, dependency advisories, security headers, CORS policy, and denial of untrusted code execution. Mutation candidates require a separate isolated runner before any execution-based evaluation.

## Current automated coverage

The current hardening branch has 48 automated Node tests across five groups:

- Request-validation unit tests.
- HTTP integration tests for health, invalid requests, missing provider configuration, malformed JSON, oversized payloads, response headers, per-instance throttling, and production AI fail-closed behaviour.
- Security/evidence tests for disabled candidate execution, lexical pattern findings, simulated evidence labels, local digest integrity/tampering, non-evaluated reproduction, and the browser playground's read-only source.
- Repository/deployment smoke tests for core scripts, Vercel security-header configuration, and consistency between the Node.js/Bun versions declared in CI and deployment.
- Descriptive benchmark utility tests for deterministic synthetic fixtures, unobserved JIT state, and the absence of formal p-value/significance claims.

**Additional CI runtime smoke check:** after building, CI starts the compiled production Express server and verifies the SPA root, health response/security headers, and fail-closed AI routes even when placeholder provider credentials and the legacy enable flag are present. This is not a live Vercel preview test.

**Browser automation now configured:** Playwright runs desktop Chromium and Pixel 7 mobile-emulation projects against the local Express/Vite application. The initial suite covers page landmarks, all eight navigation sections, keyboard activation, mobile overflow, both fail-closed AI endpoints, and an axe-core WCAG 2.1 A/AA scan. CI installs Chromium and runs `bun run test:e2e`. These browser tests have been added but their first CI execution and any resulting accessibility remediation are still pending.\n\n**Still outstanding:** mocked successful AI-provider integration tests, provider timeout/retry tests, full authenticated browser E2E journeys against the live SSO-protected preview, coverage reporting, and independent penetration testing. The existing authenticated HTTP smoke check applies to an older Vercel preview revision and is not a substitute for current-preview browser acceptance. The current test count must not be interpreted as full product coverage.

## Required evidence in pull requests

Every PR that changes runtime behaviour must include:

- Exact commands executed and their exit status.
- Test counts and any skipped tests.
- Build result.
- Relevant logs or CI links.
- A description of untested paths.
- Security and data-handling impact.
- Migration and rollback notes where applicable.

Do not claim coverage percentages unless generated by a configured coverage tool and linked to its report.

## Release acceptance

A release candidate must pass all required CI jobs, API integration tests, frontend critical-path tests, dependency/security checks, deployment smoke tests, and a manual product review. See [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md).

# Production-readiness assessment and release gates

## Current assessment

**Status: NOT CERTIFIED FOR PRODUCTION OR COMMERCIAL CUSTOMER USE.**

The original baseline lacked a README, CI workflow, automated tests, and engineering documentation. This hardening branch now adds those assets, a shared Express API application used by both local development and the Vercel entry point, explicit API request/response validation, fail-closed production AI routes, and a documented test/release process. The latest verified CI run for commit `877e41a317d48fdf3c084eaa56e64405698e5274` completed 35 tests with zero failures or skips, passed TypeScript validation, built the frontend and server artefacts, and uploaded the build artefact. CodeQL analysis for this same commit also completed successfully. These checks are a baseline, not a production certification. These improvements do not establish customer production readiness: the repository still has no declared licence, no authenticated customer accounts or tenant isolation, no shared production quota service, no isolated candidate execution service, no deployed preview acceptance evidence, and no independent security review.

This document is a living gate checklist. A checked box requires evidence in CI, a test report, a deployment record, or an authorised review.

## Gate A — Build and engineering quality

- [x] Frozen dependency installation passes in CI (latest verified run: 1 November 2026).
- [x] TypeScript checks pass (latest verified run: 1 November 2026).
- [x] Current unit and API integration suites pass: 35 tests, 0 failures, 0 skipped (latest verified run: 1 November 2026).
- [x] Production frontend and server builds pass in CI (latest verified run: 1 November 2026).
- [ ] No unresolved critical/high dependency vulnerabilities.
- [ ] No secrets detected in source, history, or built client assets.
- [x] Supported toolchain is declared and tested in CI: Node.js 22 and Bun 1.4.4.

## Gate B — API reliability

- [x] Local development and Vercel use the same Express API application.\n- [ ] Add end-to-end contract tests through both entry points.
- [x] Request body size is bounded (128 KiB).\n- [x] Provider JSON response is bounded to 100,000 characters; generated mutation candidates are bounded to 100,000 characters.
- [x] Request schemas and enum allowlists are enforced.
- [ ] Rate limiting is enforced at a shared/edge layer (current limit is per process and is not sufficient for serverless multi-instance production).
- [ ] Authentication, per-user quotas, and tenant isolation are implemented before paid public AI access.
- [ ] Provider timeout, quota, malformed output, and missing-key behaviour are tested.
- [ ] Production AI routes remain disabled by default and cannot be enabled without an approved authentication/shared-quota design.
- [ ] No fabricated fallback is returned as real AI output.
- [ ] Logs are structured and redact credentials and source code.
- [ ] Health/readiness endpoints accurately describe dependency state.

## Gate C — Security

- [ ] Threat model reviewed.
- [ ] Security headers and CORS policy tested.
- [ ] Secrets are server-side and environment-specific.
- [ ] Code is never executed in the API process.
- [ ] A dedicated isolated execution service is implemented and independently red-teamed. The current browser-side execution helper is fail-closed and does not execute candidate source.
- [ ] Any execution runner is isolated, network-denied by default, resource-limited, and disposable.
- [ ] Human approval is mandatory before candidate promotion.
- [ ] Dependency, secret, and static security scans pass.
- [ ] Branch protection and deployment permissions are configured.

## Gate D — Product correctness

- [ ] Simulated, generated, and independently verified results are visibly distinguished.
- [ ] Semantic equivalence is never asserted without actual baseline/candidate tests.
- [ ] Browser-generated evidence is labelled SIMULATED; synthetic hashes and metrics are never presented as real source provenance or measured results.
- [ ] Runtime security verdicts remain NOT_EVALUATED until a real isolated runner is available.
- [ ] Hashes are not described as signatures.
- [ ] Exported experiment reports identify the exact environment and test evidence.
- [ ] Critical workflows pass browser-based end-to-end tests.
- [ ] Accessibility and responsive layout reviewed.

## Gate E — Commercial readiness

- [ ] Owner selects and adds an explicit software licence.
- [ ] Privacy notice, terms of service, AI-provider disclosure, and data-retention policy are published.
- [ ] Customer data handling and deletion process are documented.
- [ ] Support contact, service scope, uptime expectations, and incident process are defined.
- [ ] Pricing and product claims match actual tested functionality.
- [ ] Independent security review and product acceptance completed.
- [ ] Backup/restore and rollback procedures are rehearsed where persistent data is introduced.

## Current prototype limitations

The browser labs are educational demonstrations. The current lexical pattern scanner is not an AST parser or runtime sandbox. The in-browser benchmark is descriptive only and does not calculate a validated p-value or inspect actual JIT tiers. Evidence reports use synthetic fixtures and are marked SIMULATED. These are release blockers for any product claim involving secure autonomous code execution, semantic preservation, or production rollout.

## Release decision

A release may be labelled production-ready only when every mandatory gate has evidence and an authorised owner signs the release record. Do not market the product as a secure autonomous self-modifying production engine until the candidate isolation, independent verification, approval, canary, and rollback controls are implemented and demonstrated.

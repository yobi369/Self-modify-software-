# Production-readiness assessment and release gates

## Current assessment

**Status: NOT CERTIFIED FOR PRODUCTION OR COMMERCIAL CUSTOMER USE.**

The hardening branch now has a consistent Node.js 22.x / Bun 1.4.4 toolchain, API validation and fail-closed production routes, bounded payloads, security headers, CI, CodeQL, a production-server smoke test, and a more accurate research-prototype UI.

Latest verified application revision: `9e27563c32d2d8355f2b8b673c4a58f25d9b6f8a` (branch HEAD at the time of this assessment).

- [CI run 41392054960](https://github.com/yobi369/Self-modify-software-/actions/runs/41392054960): TypeScript, 43 automated tests, production frontend/server build, production-server smoke test, and build artifact upload all passed.
- [CodeQL run 41392055003](https://github.com/yobi369/Self-modify-software-/actions/runs/41392055003): TypeScript/JavaScript analysis passed for the latest application revision.
- [Vercel preview deployment](https://self-modifying-software-studio-fck7ykltp.vercel.app): READY for the latest application revision. Authenticated deployment fetches confirmed the homepage and `/api/health` return HTTP 200 and the expected security headers. Vercel project settings confirm SSO protection is enabled for all deployment URLs except custom domains; password protection and trusted-IP restrictions are disabled. A temporary shareable preview URL was created for review and expires on 2026-11-03 at 04:04 UTC. The preview was not promoted to production.

These are engineering and build checks, not a production certification. Customer identity, tenant isolation, shared quotas, an isolated execution service, live preview acceptance, legal/commercial policies, and independent security review remain outstanding. The production AI routes intentionally remain unavailable.

This checklist is evidence-based. A gate may be checked only when the implementation and its verification evidence exist. A documentation statement alone is not evidence.

## Gate A — Build and engineering quality

- [x] Frozen dependency installation passes in CI.
- [x] TypeScript validation passes in CI.
- [x] Automated Node test suite passes (43 passed, 0 failed, 0 skipped on the latest application revision).
- [x] Production frontend and server builds pass in CI.
- [x] CI starts the built production server and smoke-checks the SPA root, health headers, and fail-closed AI routes.
- [x] Build artifact upload succeeds.
- [x] CodeQL analysis passes on the latest application revision.
- [x] Supported runtime is pinned consistently: Node.js 22.x and Bun 1.4.4; Vercel project Node runtime is set to 22.x.
- [ ] Dependency vulnerability audit and remediation policy are enforced. A Bun audit and pull-request dependency-review workflow has been added; its first successful run and any findings/remediation remain pending.
- [ ] Secret scanning covers repository history and release artefacts. A full-history Gitleaks workflow has been added; its first successful run and any findings/credential rotation remain pending. This does not replace enabling GitHub-native secret protection where available.

## Gate B — API reliability and access control

- [x] Local development and Vercel use the same Express API application.
- [x] JSON request body size is bounded to 128 KiB.
- [x] Source and provider response sizes are bounded.
- [x] Request schemas and mutation-technique allowlists are enforced.
- [x] Provider requests have a deadline and malformed provider output fails closed.
- [x] Production AI analysis and mutation routes return `AI_API_DISABLED`; no environment-variable bypass exists.
- [x] Fabricated AI fallback responses have been removed.
- [x] Health endpoint reports service status without disclosing provider configuration or credentials.
- [x] Production smoke test proves the AI routes remain disabled even when a placeholder key and legacy enable flag are present.
- [ ] End-to-end API contract tests cover both the Vercel function and standalone server entry point.
- [ ] Shared/edge rate limiting is implemented (the current in-memory throttle is process-local and unsuitable as a multi-instance production control).
- [ ] Authentication, per-user quotas, and tenant isolation are implemented and tested before public AI access.
- [ ] Structured operational logs, request correlation, and source-code/credential redaction are verified.
- [ ] Readiness and dependency health semantics are documented and tested.

## Gate C — Security and execution isolation

- [x] Security headers are configured and selected headers are tested.
- [x] Direct deployments do not trust caller-supplied forwarded IP headers by default.
- [x] Candidate source execution is disabled in the browser prototype.
- [x] Browser evidence and lexical screening are labelled as simulations or non-evaluated checks.
- [x] UI no longer claims an implemented hermetic browser sandbox, 95-assertion verification suite, or completed independent audit. TOST calculations remain explicitly NOT_EVALUATED because their inputs are synthetic and no independent reproduction was executed.
- [ ] A reviewed threat model and data-flow assessment are signed off.
- [ ] A dedicated execution service is implemented for untrusted code; it must be disposable, network-denied by default, resource-limited, and isolated from application credentials and customer data.
- [ ] The execution service is independently tested and red-teamed for escape, denial-of-service, filesystem, network, and cross-tenant attacks.
- [ ] Human approval, reproducible verification, canary rollout, and rollback controls are implemented before any candidate can be promoted.
- [ ] Dependency and secret scans are enforced (workflow implementation added; successful run and findings review pending).
- [ ] Main-branch protection, required checks, and deployment permissions are configured and verified. The connected GitHub integration cannot read the branch-protection endpoint, so this remains an owner-side verification item.

## Gate D — Product correctness and user experience

- [x] Simulated, generated, and independently verified results are distinguished in the current prototype.
- [x] Semantic equivalence is not claimed without baseline/candidate execution evidence.
- [x] Browser-generated evidence is labelled `SIMULATED`; hashes are described as local integrity digests, not signatures.
- [x] Runtime security verdicts remain `NOT_EVALUATED` while no isolated runner exists.
- [x] Static demo generation cards no longer present fabricated latency/speedup figures as measurements.
- [x] Local browser timing output is descriptive only; JIT tier is unobserved and no p-value/significance claim is made. The evidence utility's TOST calculation remains NOT_EVALUATED on synthetic inputs.
- [ ] Real baseline/candidate regression execution uses pinned toolchains, datasets, and reproducible environments.
- [ ] Critical user journeys have browser-based end-to-end tests.
- [ ] Accessibility and responsive behaviour are independently reviewed.
- [ ] A deployed preview for the current HEAD has passed authenticated HTTP smoke checks for the homepage, health endpoint, and security headers. The latest READY Vercel deployment inspected currently maps to older application revision `eb2ccdd993a1423b223bc28adb3f285a76aac48c`, not this branch HEAD. Full interactive browser journeys, accessibility, and user acceptance remain outstanding; SSO protection remains enabled.

## Gate E — Commercial and operational readiness

- [ ] Owner selects and adds an explicit software licence.
- [ ] Privacy notice, terms of service, AI-provider disclosure, and data-retention policy are published and legally reviewed.
- [ ] Customer data export, retention, and deletion processes are implemented and tested.
- [ ] Support contact, service scope, incident response, and realistic availability commitments are defined.
- [ ] Pricing and product claims match functionality that is actually implemented and verified.
- [ ] Independent security review and customer acceptance are completed.
- [ ] Backup/restore and rollback procedures are rehearsed if persistent customer data is introduced.
- [ ] Production deployment configuration, domain, secrets, monitoring, and alerting are verified in the owner's hosting account.

## Security architecture decision record\n\nThe provider-neutral identity, tenant isolation, shared quota, isolated execution, and reproducible verification design is documented in [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md). No identity vendor, datastore, quota service, or execution host has been selected or provisioned. These are deliberate owner decisions, not implementation omissions to paper over with in-memory substitutes.\n\nThe GitHub security workflow now defines Bun dependency auditing, pull-request dependency review, and full-history Gitleaks scanning. The corresponding release gates remain unchecked until the workflow has completed successfully and findings have been triaged.\n\n## Current product boundary

The browser labs are educational and research demonstrations. The lexical pattern scanner is not an AST parser or runtime sandbox. The browser playground uses fixed built-in demonstrations; it does not execute arbitrary submitted source. Evidence reports use synthetic fixtures and are marked `SIMULATED`. Browser benchmark samples are local and descriptive, not production performance evidence. AI analysis and mutation routes are disabled in deployed production mode. The product must not be marketed as a secure autonomous self-modifying production engine, a code-execution sandbox, or a semantic-equivalence verifier.

## Release decision

A release may be labelled production-ready only when every mandatory gate has implementation evidence, successful verification, and authorised owner sign-off. External owner actions (licence choice, legal review, hosting credentials, branch protection, and independent security review) cannot be marked complete by repository automation.

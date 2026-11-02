# Production-readiness assessment and release gates

## Current assessment

**Status: NOT CERTIFIED FOR PRODUCTION OR COMMERCIAL CUSTOMER USE.**

The hardening branch now has a consistent Node.js 22.x / Bun 1.4.4 toolchain, API validation and fail-closed production routes, bounded payloads, security headers, CI, CodeQL, a production-server smoke test, and a more accurate research-prototype UI.

Latest verified application revision: `a728816833ff1f825ac3adba7eea4465d1014c21`.

- [CI run 41398393553](https://github.com/yobi369/Self-modify-software-/actions/runs/41398393553): TypeScript, 48 Node tests, production build, production-server smoke check, and cross-browser Playwright suite all passed. Browser suite: 38 passed, 32 intentionally skipped duplicate axe runs across non-Chromium profiles.
- [Security run 41398393504](https://github.com/yobi369/Self-modify-software-/actions/runs/41398393504): full-severity Bun dependency audit and full-history Gitleaks scan passed. GitHub Dependency Review was skipped because the repository dependency graph has not yet been enabled.
- [CodeQL run 41398400352](https://github.com/yobi369/Self-modify-software-/actions/runs/41398400352): TypeScript/JavaScript analysis passed for the latest application revision.
- [Current Vercel preview deployment](https://self-modifying-software-studio-7a34lhlyl.vercel.app): READY for hardening branch commit `b51b2f663f15fc46328bb3038d82697dd7f93765`. Vercel project state remains `live=false`; SSO protection is enabled for all deployment URLs except custom domains, while password protection and trusted-IP restrictions are disabled. The preview was not promoted to production. Authenticated HTTP smoke and owner browser acceptance remain pending because an authorized SSO session was not available to this workflow.

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
- [x] Full-severity Bun dependency audit passes on the latest lockfile with no known advisories. Pull-request Dependency Review remains skipped until the owner enables the repository dependency graph and sets `GITHUB_DEPENDENCY_GRAPH_ENABLED=true`.
- [x] Full-history Gitleaks secret scanning passes on the latest branch head. This does not replace enabling GitHub-native secret scanning and push protection in repository settings.

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
- [x] Full-severity Bun audit and full-history Gitleaks scans are enforced in CI. GitHub Dependency Review remains an owner-side setting prerequisite.
- [ ] GitHub-native secret scanning and push protection are enabled and verified in repository settings.
- [ ] Main-branch protection, required checks, and deployment permissions are configured and verified. The repository rulesets endpoint returned no rulesets, and the connected GitHub integration could not read classic branch protection. The owner must verify Settings → Branches and require CI, CodeQL, and Security Supply-Chain Checks before merge; also block force-pushes and branch deletion.

## Gate D — Product correctness and user experience

- [x] Simulated, generated, and independently verified results are distinguished in the current prototype.
- [x] Semantic equivalence is not claimed without baseline/candidate execution evidence.
- [x] Browser-generated evidence is labelled `SIMULATED`; hashes are described as local integrity digests, not signatures.
- [x] Runtime security verdicts remain `NOT_EVALUATED` while no isolated runner exists.
- [x] Static demo generation cards no longer present fabricated latency/speedup figures as measurements.
- [x] Local browser timing output is descriptive only; JIT tier is unobserved and no p-value/significance claim is made. The evidence utility's TOST calculation remains NOT_EVALUATED on synthetic inputs.
- [ ] Real baseline/candidate regression execution uses pinned toolchains, datasets, and reproducible environments.
- [x] Critical browser journeys run in Chromium desktop/mobile, Firefox desktop, and WebKit desktop/mobile projects against the built production server.
- [x] Automated WCAG 2.1 A/AA axe-core scans pass across all eight research modules on desktop Chromium; keyboard and responsive tests pass across the browser matrix. Independent human accessibility review remains outstanding.
- [ ] The current hardening-branch preview is READY and SSO-protected. Authenticated HTTP smoke checks, owner browser acceptance, and confirmation against the exact deployment remain outstanding.

## Gate E — Commercial and operational readiness

- [ ] Owner selects and adds an explicit software licence.
- [ ] Privacy notice, terms of service, AI-provider disclosure, and data-retention policy are published and legally reviewed.
- [ ] Customer data export, retention, and deletion processes are implemented and tested.
- [ ] Support contact, service scope, incident response, and realistic availability commitments are defined.
- [ ] Pricing and product claims match functionality that is actually implemented and verified.
- [ ] Independent security review and customer acceptance are completed.
- [ ] Backup/restore and rollback procedures are rehearsed if persistent customer data is introduced.
- [ ] Production deployment configuration, domain, secrets, monitoring, and alerting are verified in the owner's hosting account.

Repository legal inventory: GitHub repository metadata currently reports `license: null`; no `LICENSE`, privacy notice, terms, or legal-policy files are present. These are intentionally unresolved pending the owner's licence choice and jurisdiction-appropriate legal review.

## Security architecture decision record

The provider-neutral identity, tenant isolation, shared quota, isolated execution, and reproducible verification design is documented in [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md). No identity vendor, datastore, quota service, or execution host has been selected or provisioned. These are deliberate owner decisions, not implementation omissions to paper over with in-memory substitutes.

The GitHub security workflow enforces a full-severity Bun audit and full-history Gitleaks scan; both passed on the latest branch head. Pull-request Dependency Review is intentionally skipped until the repository owner enables GitHub's dependency graph and sets the repository variable `GITHUB_DEPENDENCY_GRAPH_ENABLED=true`.

## Current product boundary

The browser labs are educational and research demonstrations. The lexical pattern scanner is not an AST parser or runtime sandbox. The browser playground uses fixed built-in demonstrations; it does not execute arbitrary submitted source. Evidence reports use synthetic fixtures and are marked `SIMULATED`. Browser benchmark samples are local and descriptive, not production performance evidence. AI analysis and mutation routes are disabled in deployed production mode. The product must not be marketed as a secure autonomous self-modifying production engine, a code-execution sandbox, or a semantic-equivalence verifier.

## Release decision

A release may be labelled production-ready only when every mandatory gate has implementation evidence, successful verification, and authorised owner sign-off. External owner actions (licence choice, legal review, hosting credentials, branch protection, and independent security review) cannot be marked complete by repository automation.

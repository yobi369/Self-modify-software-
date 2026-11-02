# Changelog

All notable changes to this project will be documented here.

## Unreleased — production hardening

- Added project, architecture, development, testing, security, deployment, operations, release, and production-readiness documentation.
- Added GitHub Actions CI for dependency installation, TypeScript checks, automated tests, and production build artefacts.
- Added CodeQL analysis and Dependabot update configuration.
- Added request validation and provider-response schema validation for AI API routes.
- Added bounded JSON request bodies, security response headers, and best-effort process-local request throttling.
- Removed fabricated AI fallback success responses; missing provider configuration and upstream failures now return explicit errors.
- Mutation API responses now explicitly identify candidates as unverified and do not claim behavioural equivalence.
- Local development server now mounts the same API application as the Vercel serverless entry point.
- Expanded automated coverage to 34 tests across request validation, API integration, execution fail-closed behaviour, evidence integrity, synthetic report disclosures, and repository/deployment configuration.
- Pinned CI to Node.js 22 and Bun 1.4.4; declared the supported toolchain in `package.json`.
- Added a detailed GitHub Actions guide covering triggers, permissions, concurrency, artefacts, CodeQL, Dependabot, branch governance, and troubleshooting.
- Added Vercel security headers and explicit production AI fail-closed configuration.
- Disabled arbitrary JavaScript evaluation in the browser playground and replaced the claimed hermetic sandbox with a `NOT_EXECUTED` gate.
- Re-labelled lexical scanning, lifecycle, and evidence features to distinguish static screening and simulations from real execution or verification.
- Removed fabricated passing-test counts, performance speedup claims, production traffic/watchdog/rollback claims, and false statistical equivalence language.
- Added current production-readiness and commercial-readiness gates; the project is not certified for customer production use.

- Added provider-neutral security architecture decisions for OIDC authentication, tenant isolation, shared quotas, isolated execution, and reproducible baseline/candidate verification.
- Added pinned GitHub security workflows for full-severity Bun dependency auditing and full-history Gitleaks scanning; GitHub Dependency Review is gated until the repository dependency graph is enabled.
- Removed the unused Vercel CLI development dependency, upgraded Vite to 6.4.5, and applied compatible dependency security updates; the remediation run reported no high/critical advisories.
- Expanded the automated Node suite to 48 passing tests and re-ran TypeScript, production build, and production-server smoke checks after dependency updates.\n- Added Playwright desktop/mobile browser journeys, keyboard navigation checks, fail-closed AI endpoint checks, and axe-core WCAG 2.1 A/AA scanning to CI.

## Release history

No formal versioned releases have been published yet.

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
- Added initial Node test-runner smoke tests for request validation and deployment configuration.

## Release history

No formal versioned releases have been published yet.

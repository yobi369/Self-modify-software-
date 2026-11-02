# Architecture and system boundaries

## 1. System overview

Self-Modifying Software Studio is a browser-based research application with an optional server-side AI integration. The current repository contains a React/Vite frontend, an Express development server, and a separate Express application exported from `api/index.ts` for Vercel serverless routing.

The application presents interactive labs for architecture exploration, runtime and memory simulation, AI-assisted code analysis, mutation proposals, static pattern screening, and simulated experiment evidence. It does not currently provide an isolated runtime for arbitrary candidate execution or a production deployment controller. These capabilities must be classified accurately: a simulation is not native execution, and an AI proposal is not a verified transformation.

## 2. Runtime components

### Browser application

The React application is mounted by `src/main.tsx` and composed in `src/App.tsx`. Feature areas are implemented under `src/components/`. Shared contracts are in `src/types.ts`; reusable experiment, hashing, and benchmark helpers are in `src/utils/`.

The browser is an untrusted client. It must not contain provider API keys, privileged credentials, or authoritative release decisions. Client-generated reports are user-facing evidence drafts and are currently labelled SIMULATED. Candidate execution in the browser is disabled: a page realm is not a secure isolation boundary.

### Local development server

`server.ts` starts Express and attaches Vite middleware in development. It exposes health and AI routes for local development. Keep development-only Vite middleware out of production deployments.

### Vercel API entry point

`api/index.ts` exports an Express application for serverless execution. It is a separate runtime entry point from `server.ts`; changes to one must not be assumed to affect the other. Route behaviour, request limits, timeouts, provider configuration, and error handling must be tested for both local and deployed environments.

### AI provider

The Gemini SDK is called only from server-side code. Provider output is untrusted input. Parse it, validate every required field, enforce response size limits, and reject malformed or incomplete results. Never trust generated code, claims of semantic equivalence, or security assertions without independent validation.

## 3. Trust boundaries

| Boundary | Trust level | Required control |
| --- | --- | --- |
| Browser request | Untrusted | Schema validation, payload limits, rate limits |
| User-supplied source code | Untrusted data | Treat as data; never execute on the API server |
| Gemini response | Untrusted external output | Parse, validate, bound, and label as unverified |
| Browser simulation | Demonstration only | Clearly disclose simulated behaviour |
| CI test runner | Controlled execution environment | Least privilege, pinned actions, no production secrets in PR jobs |
| Production deployment | Privileged | Protected branch, reviewed changes, deployment approval |
| Experiment evidence | Untrusted until verified | Reproducible commands, environment metadata, immutable hashes |

## 4. Required mutation lifecycle

The intended product architecture separates proposing a mutation from approving and deploying it:

1. **Baseline:** capture immutable source, version, and SHA-256 digest.
2. **Candidate:** generate a patch in a disposable workspace or branch.
3. **Static validation:** parse, type-check, lint, scan dependencies, and inspect the diff.
4. **Dynamic validation:** execute only in a dedicated, isolated runner with strict CPU, memory, time, filesystem, and network controls.
5. **Behavioural validation:** run baseline and candidate against the same deterministic fixtures and regression corpus.
6. **Security review:** inspect permissions, dependencies, secrets access, and unsafe system calls.
7. **Approval:** require a named authorised reviewer; no model-generated self-approval.
8. **Canary:** release to a limited environment and compare health/error/latency metrics.
9. **Promotion or rollback:** promote only after explicit gates; otherwise discard the candidate and restore the last known-good release.
10. **Evidence:** retain source hashes, patch, tool versions, test results, reviewer, release ID, and rollback outcome.

## 5. Deployment topology

The frontend is built by Vite into `dist/`. Vercel serves static assets and routes `/api/*` to the serverless API. Local development uses `server.ts`. The project must maintain a single documented source of truth for environment variables and route contracts.

## 6. Known architectural risks to resolve

- The local Express server and Vercel API are separate implementations and can drift.
- In-memory rate limits are not shared across serverless instances; use an edge gateway or shared store for production abuse controls.
- AI output must never be treated as compiled or behaviourally verified code.
- Browser-side simulations cannot enforce operating-system memory protections.
- A SHA-256 digest is not a signed attestation. Use a managed signing identity and verifiable provenance if signed releases are required.
- Candidate execution must not occur in the API process or in the user's browser with privileged access.
- A real commercial deployment requires an explicit license, support policy, privacy notice, data-retention policy, and customer-facing service terms.


## 7. Identity, tenancy, quotas, and execution architecture

The required target boundaries, authentication contract, tenant data-isolation rules, shared quota design, untrusted execution data plane, and reproducible baseline/candidate verification protocol are documented in [Security Architecture Decisions](SECURITY_ARCHITECTURE.md).

These are future implementation gates, not deployed capabilities. The current repository has no selected identity provider, tenant datastore, shared quota service, or isolated execution runner. Production AI endpoints remain disabled until the relevant controls are implemented and independently verified.

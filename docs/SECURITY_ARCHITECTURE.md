# Security architecture decisions

## Status and scope

This document records the security architecture required before the Studio can accept customer identities, persist customer workspaces, expose deployed AI operations, or execute untrusted source code. It is an architecture decision record and implementation plan, **not evidence that these controls are deployed**.

The inspected application is a React/Vite frontend, an Express API, a Gemini integration, and Vercel deployment configuration. The repository does not currently contain an identity provider integration, tenant database, shared quota store, or isolated execution service. The existing process-local IP throttle is only a bounded best-effort safeguard; it is not a shared quota system.

Until the mandatory controls below exist and are verified:
- Keep production AI analysis and mutation endpoints disabled.
- Do not accept or store customer credentials or persistent tenant data.
- Do not execute user- or model-supplied code in Express, Vercel functions, CI jobs, or the browser.
- Do not claim tenant isolation, sandboxing, or semantic equivalence.

## ADR-001 — Identity and authentication boundary

**Decision:** Use a provider-neutral OpenID Connect (OIDC) integration behind a server-side authentication adapter. Do not invent a local password system or trust identity fields supplied by the browser.

The identity provider is deliberately not selected in this repository. Selection requires an owner decision on account ownership, data residency, pricing, contractual terms, recovery/MFA requirements, and the provider's operational model. No new provider or database should be provisioned without that decision.

Required implementation contract:
1. Complete OIDC Authorization Code flow with PKCE, exact redirect URI allowlists, state and nonce validation, issuer/audience/signature/expiry checks, and strict algorithm allowlisting.
2. Establish an opaque, rotated, server-managed session. Store it in a Secure, HttpOnly, appropriately SameSite cookie; never put bearer credentials or long-lived tokens in browser storage.
3. Verify the session and its expiry on every protected server request. CSRF protection is required for cookie-authenticated state-changing requests; CORS is an explicit allowlist, not an authentication control.
4. Resolve the stable provider subject to an internal user record. Do not use email address, display name, or a client-provided user/tenant ID as an authorization key.
5. Require explicit tenant membership and role checks on every tenant-scoped operation. Deny by default and return no cross-tenant existence details.
6. Support session revocation, logout, account disablement, membership revocation, and security-event audit records.
7. Keep provider client secrets and signing/session keys in the hosting platform's encrypted server-side secret store. Never expose them to Vite client bundles or logs.

## ADR-002 — Tenant data isolation

**Decision:** If persistent workspaces are introduced, use an explicitly selected relational datastore with tenant scoping enforced in the data-access layer and reinforced by database policy where supported. No datastore is selected or provisioned yet.

Required data model and query rules:
- Every tenant-owned row carries a non-null tenant_id; tenant-owned uniqueness constraints include that tenant key.
- Resolve tenant context from a verified membership, never from request JSON, query parameters, URL path alone, or unsigned headers.
- Every read, write, update, delete, export, background job, and object-storage operation is scoped to the authenticated tenant and authorised membership.
- Use composite foreign keys or equivalent constraints so a row cannot reference a parent from another tenant.
- If the chosen database supports row-level security, enable it as defence in depth and set tenant context transaction-locally. Never rely on RLS as a substitute for application authorization.
- Background jobs carry a signed/verified tenant and actor context, use least-privilege service identities, and re-check membership/authorization at execution time.
- Add adversarial tests that attempt cross-tenant reads, writes, IDOR access, exports, job replay, and object-key substitution.

No customer-data persistence should be enabled until the datastore, migrations, backup/restore, deletion, retention, and tenant-isolation tests have been reviewed.

## ADR-003 — Shared quotas and abuse controls

**Decision:** Replace the process-local map as the authoritative control with an atomic shared limiter or edge-enforced service before enabling public AI operations. The specific service is an owner/deployment decision; no Redis, database, or paid service is assumed.

The limiter must support atomic increments and expiry across concurrent instances. Keys must combine verified tenant and user identity with operation class; anonymous pre-authentication limits must use a trusted network identity at the edge. Apply separate limits to request count, token/input size, provider spend, concurrency, and daily/monthly budgets. Use idempotency keys for billable retries where appropriate.

For costly AI operations, fail closed when the quota service is unavailable. Do not fall back to a per-instance counter and describe it as a shared limit. Emit privacy-safe metrics and audit events without logging submitted source or credentials.

## ADR-004 — Untrusted execution isolation

**Decision:** Execution belongs in a separate data plane, never in the web/API process or browser. The current Vercel deployment is a control-plane/UI host, not a suitable arbitrary-code sandbox.

A production runner must provide all of the following before it accepts a job:
- A disposable, single-job isolation boundary based on a reviewed microVM or equivalently strong isolation technology. A normal container alone is not accepted as proof of hostile-code isolation.
- Network egress denied by default, including access to metadata endpoints, private address ranges, control-plane APIs, databases, and other tenants. Any future network exception must be explicit, narrow, and independently tested.
- No application, provider, deployment, cloud, or customer credentials in the job environment; no inherited host environment; no mounted Docker socket or host filesystem.
- Non-root execution, dropped Linux capabilities, seccomp and mandatory-access-control policy, read-only base image, narrowly scoped temporary workspace, and cleanup after every job.
- Enforced CPU, memory, process-count, file-size, disk, wall-clock, output-size, and concurrency limits at the host/kernel boundary.
- Pinned runner image and compiler/toolchain versions by immutable digest, with a controlled update and vulnerability-remediation process.
- Authenticated control-plane-to-runner requests, short-lived job identity, tenant/job binding, replay protection, and strict response schema/size validation.
- Independent escape, filesystem, network, resource-exhaustion, metadata-service, cross-job, and cross-tenant testing before any production use.

The runner returns structured execution records only. It must not receive authority to deploy, merge, publish, or modify the control plane. A failed, timed-out, or partially completed job is not a pass.

## ADR-005 — Reproducible baseline/candidate verification

A candidate is not semantically equivalent merely because it compiles, passes one test, receives a positive AI review, or has matching hashes.

Required protocol:
1. Freeze the baseline revision, candidate patch, fixtures, test corpus, configuration, and toolchain manifests.
2. Run baseline and candidate in separate fresh runner instances with equivalent resource limits and identical declared inputs.
3. Pin compiler/interpreter, dependency lockfiles, OS/runtime image digests, test runner, and relevant environment variables.
4. Control randomness, clock, locale, filesystem ordering, and external services; where determinism is impossible, define and justify statistical methodology before collecting data.
5. Execute the same correctness, regression, security, and resource-behaviour suites against both revisions.
6. Preserve raw logs, exit codes, resource measurements, tool versions, source/fixture digests, runner image digest, and execution timestamps as tamper-evident evidence.
7. Report PASS, FAIL, or NOT_EVALUATED per declared gate. Missing evidence, runner faults, flaky tests, or unsupported environments cannot become a pass.
8. Require human review of the patch and evidence. Verification does not grant deployment permission.

## Required service boundaries

| Component | Trust and responsibility | Must not receive |
| --- | --- | --- |
| Browser | Untrusted UI; presents server-authorised data | Provider keys, signing keys, privileged tokens |
| API/control plane | Authenticates, authorises, quotas, schedules jobs | Arbitrary execution privileges |
| Identity provider | Authenticates account subject | Tenant data beyond provider contract |
| Tenant datastore | Persists authorised tenant records | Runner access or direct browser credentials |
| Shared quota service | Atomic usage and concurrency accounting | Source code unless explicitly required |
| Execution data plane | Executes one isolated, bounded job | Application secrets, customer database access, deployment authority |
| Evidence store | Stores immutable run metadata and outputs under tenant policy | Cross-tenant read/write authority |

## Implementation order and release gates

1. Owner selects identity provider, datastore, hosting/region, and cost ceiling.
2. Implement and test OIDC sessions, membership/roles, tenant-scoped data access, revocation, and shared quotas.
3. Deploy the isolated runner as a separate service; complete threat modelling and independent red-team review.
4. Add baseline/candidate protocol and reproducible evidence storage.
5. Add end-to-end tests for authentication, tenant isolation, quota races, runner isolation, and failure modes.
6. Complete privacy, retention/deletion, incident response, and customer acceptance work.
7. Only then may an owner-authorised release review consider enabling production AI or execution routes.

## Explicit non-decisions

This repository does not choose an identity vendor, database, shared limiter vendor, cloud runner, legal jurisdiction, retention period, or customer SLA. These decisions affect cost, privacy, legal obligations, and operational ownership and require owner input. Until selected, implementation must remain fail-closed rather than silently substituting local memory, browser storage, or an unisolated process.

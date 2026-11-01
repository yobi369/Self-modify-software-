# Commercial readiness and launch strategy

## Current product category

The current codebase is a browser-based research and educational prototype. Its defensible near-term offer is a **software transformation research and learning studio**: interactive architecture explanations, controlled examples, static pattern screening, built-in JavaScript/WebAssembly demonstrations, AI-assisted code review (when enabled), and reproducibility concepts.

It is not currently a secure autonomous code mutation service, an enterprise code execution sandbox, a production deployment controller, or a multi-tenant SaaS platform.

## Safe near-term offer

Until the remaining engineering gates are completed, describe the product as:
- A research/education tool for runtime transformation concepts.
- A browser-based demonstration of selected JavaScript and WebAssembly behaviours.
- An AI-assisted code review and candidate-generation interface, with candidates explicitly unverified.
- A local demonstration of evidence record structure and hash integrity concepts.

Do not promise:
- Secure execution of arbitrary or customer-supplied code.
- Semantic equivalence or automatic behaviour preservation.
- Native W^X enforcement or operating-system/kernel protection.
- Statistically proven performance improvements.
- Autonomous production promotion, canary deployment, or rollback.
- Enterprise-grade isolation, tenant data separation, or compliance certification.

## Commercial delivery models

### 1. Research/education licence

Potentially the fastest safe route once the owner chooses a licence and the product's claims are reviewed. Customers receive access to the demonstrator and documentation. The licence must clearly state the supported educational/research use and the lack of isolated untrusted-code execution.

### 2. Private installation or consulting engagement

A customer-specific installation can be offered only after defining the supported environment, data handling, AI-provider configuration, and support scope. Do not process confidential customer source through the AI integration until the privacy, provider-retention, and access controls have been reviewed.

### 3. Hosted multi-tenant SaaS

This is a later milestone. It requires authentication, tenant isolation, per-user quotas, shared rate limiting, secure persistence, billing, audit logs, privacy/retention controls, abuse response, backups, and service monitoring. The current repository does not implement those capabilities.

## Mandatory launch decisions

The owner must decide:
1. Commercial name and target customer segment.
2. Whether the first offer is a research/education licence, private installation, or hosted SaaS.
3. Proprietary/commercial licence terms and whether source redistribution is allowed.
4. Whether user source code may be sent to the configured AI provider.
5. Data retention and deletion policy.
6. Customer support contact, support hours, and service expectations.
7. Pricing, refunds, and any trial/usage limits.

Do not invent company registration details, certifications, customer testimonials, or security claims.

## Hosted product engineering gates

Before enabling production AI routes or onboarding paying SaaS customers:
- Implement authentication and authorisation.
- Implement tenant-scoped data access and server-side ownership checks.
- Enforce a shared/edge rate limiter and per-user quotas.
- Add billing/entitlement checks if usage is paid.
- Add persistent storage with encryption, backup, restore, and deletion workflows.
- Add privacy notice, terms, AI-provider disclosure, and retention controls.
- Add support and incident response processes.
- Complete an independent security review.

## Launch checklist

- [ ] Product positioning matches tested capabilities.
- [ ] Owner selects and adds a licence.
- [ ] Privacy, terms, and AI-provider disclosure are reviewed.
- [ ] Production AI routes remain disabled until access controls are complete.
- [ ] Demo and customer-facing claims have been reviewed for accuracy.
- [ ] Support and incident contacts are published.
- [ ] Pricing and refund terms are approved by the owner.
- [ ] A release candidate passes the production-readiness gates.

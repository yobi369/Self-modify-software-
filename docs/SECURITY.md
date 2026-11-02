# Security model and threat assessment

## Security objective

The Studio must safely inspect and propose code changes without becoming an execution host for untrusted code or a path to unauthorised production modification.

## Assets

- Gemini API credentials and deployment secrets.
- User-submitted source code and experiment data.
- Candidate source changes and baseline artefacts.
- CI credentials, deployment permissions, and release artefacts.
- Customer information if multi-user functionality is introduced.

## Threat actors and abuse cases

- Anonymous callers exhausting AI quotas or causing denial of service.
- Malicious input attempting prompt injection or parser abuse.
- Malformed provider responses causing unsafe UI state.
- Generated code containing destructive or exfiltrating behaviour.
- Compromised dependencies or GitHub Actions.
- Accidental secret exposure in logs, build artefacts, or frontend bundles.
- A mistaken promotion of an unverified candidate.
- Forged experiment evidence or misleading claims of a cryptographic signature.

## Mandatory controls

1. Enforce JSON body size limits and validate all request fields server-side.
2. Restrict supported language identifiers and mutation techniques to explicit allowlists.
3. Apply rate limiting at an edge gateway or shared store; per-process memory limits are only a development safeguard.
4. Keep provider keys exclusively in encrypted server-side environment variables.
5. Add security headers and a deliberate CORS policy.
6. Treat prompts and provider output as untrusted. Validate parsed responses against schemas and maximum output lengths.
7. Never execute user or model-generated code in the API process.
8. Use a disposable isolated runner for any execution-based evaluation. Deny network by default, mount only a temporary workspace, drop privileges, and enforce resource/time limits.
9. Require human approval for release promotion. Protect the production branch and restrict deployment credentials.
10. Scan dependencies, secrets, source, and workflow permissions on every pull request.
11. Redact credentials and submitted source from routine logs.
12. Make failure explicit. Do not silently replace a failed AI result with a fabricated result.

## Responsible mutation constraints

The product is a research and software assurance workspace. Candidate transformations must be explainable and reviewable. The UI and API must not assert semantic equivalence, W^X compliance, portability, or successful validation without the corresponding test evidence.

A generated hash is an integrity identifier only. Do not call a hash-derived string a digital signature. Signed provenance requires a real signing key, controlled key custody, and independent signature verification.

## Vulnerability reporting

Please do not disclose vulnerabilities publicly before maintainers have had a reasonable opportunity to assess them. Send a private report through GitHub's repository security reporting feature where available. Include affected commit, impact, reproduction steps, and a suggested mitigation. Do not include real customer data or live credentials.

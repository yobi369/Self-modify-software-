# Operations and incident response

## Operational signals

At minimum, monitor request volume, 4xx/5xx rates, AI-provider latency, timeout and quota failures, application health, deployment version, and rate-limit events. Avoid logging submitted source code or credentials.

## Incident severity

- **SEV-1:** credential exposure, unauthorised code execution or promotion, cross-customer data exposure, or active compromise.
- **SEV-2:** sustained outage, broad API failure, or material integrity failure in experiment evidence.
- **SEV-3:** isolated feature failure or degraded performance with a safe workaround.
- **SEV-4:** documentation, usability, or low-impact defects.

## Response procedure

1. Acknowledge the incident and assign an incident owner.
2. Contain the issue: disable the affected endpoint, revoke/rotate credentials, pause deployments, or roll back.
3. Preserve relevant deployment IDs, commit SHAs, timestamps, and redacted logs.
4. Assess customer, source-code, and credential exposure.
5. Notify affected parties where required by law or contract.
6. Restore from a known-good release only after validating the mitigation.
7. Document root cause, timeline, impact, and corrective actions.
8. Add a regression test and update this runbook.

## Credential response

If a provider or deployment key is exposed, revoke it at the provider immediately, issue a replacement, update encrypted environment variables, redeploy, and check repository history and logs. Removing a secret from the latest commit does not invalidate a previously exposed key.

## Rollback triggers

Roll back or disable the affected capability when health checks fail, unexpected execution occurs, sensitive data is exposed, candidate promotion bypasses approval, or error rates exceed the release's agreed threshold.

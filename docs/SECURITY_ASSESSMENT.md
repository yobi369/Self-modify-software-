# Security assessment — current prototype

## Assessment scope

This assessment describes the code in the current hardening branch. It is not an independent penetration test, certification, or claim that the application is secure for untrusted multi-tenant workloads.

## Critical design decision: browser execution disabled

The previous `runInHermeticSandbox` implementation executed candidate source through the JavaScript `Function` constructor in the page's own realm. Lexically shadowing names such as `window`, `globalThis`, `process`, `eval`, and `Function` does not create a security boundary. Constructor traversal, host object access, uninstrumented loops, memory exhaustion, and prototype side effects can bypass simplistic wrappers. Comparing prototype property counts after execution is not a reliable containment or rollback mechanism.

The hardening branch replaces that implementation with a fail-closed compatibility function. It returns `NOT_EXECUTED` and does not evaluate candidate source. The adversarial examples are screened with a conservative lexical pattern scanner only.

**The lexical scanner is not an AST parser, does not prove code is safe, and does not provide runtime containment.** A clean result means only that the configured patterns were not detected. All dynamic security verdicts are labelled `NOT_EVALUATED`.

## Evidence integrity corrections

The browser-side experiment generator previously contained hardcoded source hashes, commit identifiers, passing assertion counts, benchmark samples, production promotion states, and claims of independent reproduction. These were not evidence of real source artefacts or production executions.

The current hardening branch:
- Labels generated reports `SIMULATED`.
- Removes hardcoded passing test-suite assertions and reports zero recorded test suites unless supplied.
- Uses clearly named synthetic fixture digests rather than presenting them as source hashes.
- Removes claims of production promotion, watchdog monitoring, and rollback from generated evidence.
- Labels reproduction results `NOT_EVALUATED`.
- Replaces the generated candidate-execution script with a record self-consistency checker.
- Explains that a SHA-256 digest is not a digital signature, trusted timestamp, author identity, or proof that an experiment occurred.

## Benchmark limitations

The in-browser benchmark measures built-in JavaScript demo functions on the current browser/device. The current comparison uses descriptive timing and confidence-interval heuristics. It does not implement a validated Welch test, a formal p-value calculation, or runtime JIT-state inspection. It therefore cannot claim statistical significance or authorise automatic promotion.

## Remaining security requirements before customer production

1. Implement an isolated execution service outside the web/API process. It must use disposable workers/VMs or equivalent strong isolation, with CPU, memory, wall-clock, filesystem, syscall, and network controls.
2. Independently red-team the isolation boundary, including constructor escapes, prototype poisoning, side channels, denial of service, filesystem access, and network exfiltration.
3. Add authenticated users, per-user quotas, tenant isolation, and a shared/edge rate limiter before enabling public paid AI endpoints.
4. Add structured audit logs with redaction and retention controls.
5. Add dependency and secret scanning, signed build provenance, and protected production deployment.
6. Implement baseline/candidate regression execution in the isolated service. Use identical datasets and toolchain versions.
7. Require human approval, canary rollout, health metrics, and tested rollback before any deployment promotion.
8. Commission an independent security review and document the residual risks.

## Current release interpretation

The current software can be presented as a research and educational prototype for code transformation concepts, static pattern screening, and local simulations. It must not be sold or described as a secure autonomous code execution or production deployment platform until the requirements above have been implemented and independently validated.

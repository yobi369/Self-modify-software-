# Contributing

Thank you for helping improve Self-Modifying Software Studio.

## Before contributing

Read the [architecture](docs/ARCHITECTURE.md), [security model](docs/SECURITY.md), and [testing strategy](docs/TESTING.md). Keep simulations, generated suggestions, and independently verified results clearly distinguished.

## Development

```bash
bun install --frozen-lockfile
bun run dev
bun run check
```

## Pull requests

- Use a focused branch and small, reviewable commits.
- Explain the problem and intended user impact.
- Add tests for changed behaviour.
- Update docs and changelog when relevant.
- Include exact test commands and results.
- Describe security impact, data handling, and rollback.
- Do not include credentials, customer data, or generated build output.

## Safety requirements

Never add server-side execution of arbitrary user or model-generated code. Do not claim a mutation preserves behaviour unless baseline and candidate have passed the same declared verification suite. Do not represent a hash as a digital signature.

## Review

A maintainer may request changes when tests, evidence, documentation, or security controls are incomplete. All required CI checks must pass before merge.

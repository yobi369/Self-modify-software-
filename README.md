# Self-Modifying Software Studio

**Research and engineering workspace for studying software mutation, runtime transformation, verification, and execution safety.**

Self-Modifying Software Studio brings together interactive architecture visualisations, memory and virtual-memory simulations, controlled mutation experiments, security demonstrations, and reproducibility-oriented evidence tools. It is designed for engineers and researchers who need to reason about how software changes and how those changes should be evaluated.

> **Maturity notice:** This repository is under production-hardening review. The interface contains simulations and AI-assisted code suggestions. A generated mutation is not proof of semantic equivalence, a security audit, or permission to execute the result. Do not use this application to modify or execute production workloads. Production readiness is not claimed until the release gates in [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md) are satisfied.

## Product scope

- Explore self-modification concepts, memory permissions, runtime transformation, and code mutation.
- Inspect code for potential self-modification and execution-safety concerns.
- Generate candidate code transformations for human review.
- Compare baseline and candidate behaviour using explicit test evidence.
- Produce reproducibility-oriented experiment records and reports.
- Learn about W^X, DEP, ASLR, instruction-cache coherency, and rollback design.

## What this application does not guarantee

- AI-generated code is not guaranteed to compile, preserve behaviour, or be safe.
- A browser simulation is not equivalent to native execution or operating-system enforcement.
- A displayed test result is not independent proof unless the test actually ran against the stated artefact and environment.
- Hashes provide integrity identifiers, not digital signatures or identity authentication.
- No generated candidate should be promoted automatically to production.

## Technology

- React 19, TypeScript, Vite, Tailwind CSS
- Express API endpoints
- Google Gemini API for optional AI-assisted analysis and candidate generation
- Vercel deployment configuration
- Bun lockfile

## Quick start

Requirements: Node.js 22 or later and Bun (the version declared by the repository's CI workflow).

```bash
git clone https://github.com/yobi369/Self-modify-software-.git
cd Self-modify-software-
bun install --frozen-lockfile
cp .env.example .env
# Set GEMINI_API_KEY only if you want AI-assisted endpoints.
bun run dev
```

The local Vite/Express development server listens on port 3000. Never commit `.env` or paste API keys into issue reports.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the local development server |
| `bun run lint` | Run the TypeScript compiler without emitting files |
| `bun run test` | Run the automated Node test suite |
| `bun run build` | Build the browser application and server bundle |
| `bun run check` | Run lint, tests, and production build |

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for full setup and troubleshooting.

## Architecture

- `src/`: React application, interactive labs, types, visualisations, and client utilities.
- `api/index.ts`: Vercel serverless API entry point.
- `server.ts`: local Express + Vite development server.
- `public/`: static public assets.
- `docs/`: architecture, security, testing, deployment, release, and operations documentation.
- `.github/workflows/`: automated quality and security checks.

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before changing application boundaries.

## AI configuration

Set `GEMINI_API_KEY` in your local environment or deployment provider's encrypted environment-variable store. The key must remain server-side. The application should report AI-provider failures explicitly; it must not fabricate an AI result or represent an unverified candidate as behaviour-preserving.

## Safe mutation lifecycle

1. Preserve an immutable baseline and record its source hash.
2. Generate a candidate in an isolated workspace.
3. Review the diff and threat model.
4. Run formatting, type checks, static analysis, unit tests, integration tests, and workload-specific regression tests.
5. Compare baseline and candidate outputs using a declared test corpus.
6. Require an authorised human approval before promotion.
7. Deploy progressively with health monitoring and a tested rollback path.
8. Retain the candidate, test evidence, approval, and release metadata.

The current UI is a research and review environment. It is not yet a hardened autonomous production deployment controller.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Testing strategy](docs/TESTING.md)
- [Security model and threat assessment](docs/SECURITY.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Production-readiness gates](docs/PRODUCTION_READINESS.md)
- [Operations and incident response](docs/OPERATIONS.md)
- [Release process](docs/RELEASING.md)
- [Contributing](CONTRIBUTING.md)
- [Security reporting](SECURITY.md)

## Support and ownership

Maintained by [Brian Mutunga](https://github.com/yobi369). Report reproducible defects through GitHub Issues. Do not include secrets, private source code, personal data, or exploitable payloads in public issues.

## License

No license has been declared in this repository. Until the owner adds an explicit license, all rights are reserved by default; do not assume the project is open source or commercially reusable by third parties.

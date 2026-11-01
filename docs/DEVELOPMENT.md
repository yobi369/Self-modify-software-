# Development guide

## Prerequisites

- Node.js 22 or newer.
- Bun compatible with the repository lockfile.
- Git.
- A Gemini API key only when testing AI-assisted routes.

Confirm versions:

```bash
node --version
bun --version
git --version
```

## Install

```bash
git clone https://github.com/yobi369/Self-modify-software-.git
cd Self-modify-software-
bun install --frozen-lockfile
cp .env.example .env
```

Edit `.env` locally. Do not commit it. AI routes should remain usable in a clearly labelled non-AI or unavailable state when no provider key is configured; do not fabricate model output.

## Run locally

```bash
bun run dev
```

Open `http://localhost:3000`. The development server uses Vite middleware and Express. Stop it with Ctrl+C.

## Quality commands

```bash
bun run lint
bun run test
bun run build
bun run check
```

Run focused tests while developing, then run the complete check before opening a pull request. The CI workflow is the merge gate and must remain consistent with these commands.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | No for UI-only development | Server-side Gemini API credential |
| `AI_API_ENABLED` | No for local development | Production-only opt-in; defaults to disabled unless authentication and shared usage controls are ready |
| `NODE_ENV` | Provider/runtime-dependent | Runtime environment |
| `PORT` | Local server default | HTTP listen port where supported |

Never expose secrets through `VITE_*` variables, frontend source, logs, screenshots, or committed configuration.

## Pull request workflow

1. Branch from the latest `main`.
2. Make a focused change.
3. Add or update tests.
4. Update the relevant documentation and changelog.
5. Run `bun run check`.
6. Review the complete diff for accidental secrets and generated files.
7. Open a pull request with problem, solution, test evidence, risk, and rollback notes.
8. Merge only after required checks and human review pass.

## Troubleshooting

- **Dependency install fails:** verify Bun version and retry with the frozen lockfile; do not regenerate the lockfile without reviewing the diff.
- **Type checking fails:** run `bun run lint` and fix the first root error before proceeding.
- **AI request fails:** confirm the server-side secret is configured, the provider account is active, and the request is within provider quotas. Never paste the key into a public issue.
- **Build succeeds locally but fails in CI:** compare runtime versions, lockfile installation, environment variables, and exact commands.
- **Vercel API differs from local behaviour:** inspect `api/index.ts` independently of `server.ts` and run deployed smoke tests.

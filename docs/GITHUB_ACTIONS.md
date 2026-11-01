# GitHub Actions, CI, and repository automation

This document is the operational reference for the workflows and dependency automation stored in `.github/`. It describes what GitHub executes, when it executes, what permissions it receives, how to interpret results, and what repository administrators must configure separately.

## Automation inventory

| Automation | Definition | Trigger / cadence | Purpose |
| --- | --- | --- | --- |
| Continuous Integration | `.github/workflows/ci.yml` | Push to `main`, `production/**`, `feature/**`, `fix/**`; pull requests targeting `main`; manual dispatch | Install locked dependencies, typecheck, test, build, and retain build output |
| CodeQL | `.github/workflows/codeql.yml` | Push to `main`; pull requests targeting `main`; weekly schedule; manual dispatch | Static security analysis of JavaScript and TypeScript |
| Dependabot | `.github/dependabot.yml` | Weekly | Propose dependency and GitHub Actions version updates |

These automations are quality and security checks. **They do not deploy the application, provision infrastructure, run untrusted candidate code, or certify the product as production-ready.**

## 1. Continuous Integration

### Trigger behaviour

The workflow runs on:
- Pushes to `main`, `production/**`, `feature/**`, and `fix/**`.
- Pull requests whose target branch is `main`.
- A maintainer-triggered `workflow_dispatch` event.

A pull request opened against a branch other than `main` does not match the current pull-request trigger. Add the target branch deliberately if the repository adopts another integration branch.

### Permissions and concurrency

The workflow requests only `contents: read`. It does not receive deployment, package-publishing, issue-writing, or secret-management permissions. Third-party actions are pinned to immutable full commit SHAs; inline comments retain the human-readable upstream release tags. Dependabot is configured to propose action updates, which must be reviewed and tested.

Runs are grouped by workflow and Git ref. A newer run for the same group cancels an older in-progress run. This saves runner time but means a cancelled run is not a successful check; always inspect the newest run for the commit under review.

### Job: Typecheck, tests, and production build

The job runs on `ubuntu-latest` with a 15-minute timeout and executes these steps in order:

1. **Checkout source** using `actions/checkout@v5`.
2. **Set up Node.js 22** using `actions/setup-node@v7`.
3. **Set up Bun 1.4.4** using `oven-sh/setup-bun@v2` with an explicit `bun-version` input.
4. **Install locked dependencies** using `bun install --frozen-lockfile`. A lockfile mismatch fails the workflow rather than silently changing dependency resolution.
5. **Typecheck** using `bun run lint`, which runs `tsc --noEmit`.
6. **Automated tests** using `bun run test`, which runs the Node test runner with the `tsx` loader.
7. **Production build** using `bun run build`. This builds the Vite browser application and bundles the local Express server entry point.
8. **Upload build output** using `actions/upload-artifact@v4`. The `dist/` directory is retained for seven days. The artifact is a diagnostic/build handoff, not a deployment.

A failure stops subsequent steps. Read the first failing step and its log rather than treating later skipped steps as separate failures.

### Local reproduction

Use the same supported toolchain and commands before opening a pull request:

```bash
bun install --frozen-lockfile
bun run lint
bun run test
bun run build
```

Or run the repository convenience command:

```bash
bun run check
```

If the frozen install fails, do not delete or regenerate the lockfile blindly. Update dependencies intentionally, commit the corresponding lockfile change, and rerun the full check.

## 2. CodeQL

### Scope and triggers

The CodeQL workflow analyses `javascript-typescript`. It runs on:
- Pushes to `main`.
- Pull requests targeting `main`.
- A weekly schedule at 04:23 UTC on Monday.
- Manual dispatch.

It uses the official CodeQL action v4, pinned to an immutable commit SHA, to initialise the database, autobuild the project, and publish analysis results.

### Permissions

The workflow requests:
- `contents: read` to check out the repository.
- `security-events: write` to upload CodeQL findings.
- `actions: read` for workflow analysis support.

CodeQL is a static analysis tool. A successful run means the configured analysis completed; it is not a penetration test, a runtime sandbox assessment, or a guarantee that no vulnerabilities exist.

### Reviewing findings

1. Open the CodeQL run for the exact pull-request head SHA.
2. Confirm the run completed successfully.
3. Open the repository Security tab and inspect Code scanning alerts.
4. Triage each alert for reachability, impact, and exploitability.
5. Fix confirmed issues in a focused commit and add a regression test where practical.
6. Rerun CI and CodeQL against the updated head.
7. Document accepted residual risks; do not silently dismiss findings to make a check green.

## 3. Dependabot

The Dependabot configuration checks two ecosystems weekly:
- `bun` in the repository root, for application dependencies.
- `github-actions` in the repository root, for workflow action versions.

It opens at most five outstanding update pull requests per ecosystem and applies the `dependencies` label.

Review dependency updates rather than merging blindly:
- Inspect changelogs and breaking changes.
- Check lockfile changes.
- Run the complete CI suite.
- Inspect security advisories and licence implications.
- Review changes to third-party GitHub Actions, including permissions and tags.
- Keep runtime and build dependencies current without accepting unreviewed major upgrades.

## 4. Pull-request and release workflow

Recommended maintainer sequence:

1. Create a focused branch from the intended base.
2. Make a small, reviewable change and update tests and documentation.
3. Run the local quality commands.
4. Open a pull request to `main`.
5. Wait for the latest-head CI and CodeQL runs. A green run on an earlier commit does not validate a newer commit.
6. Review the diff, dependency changes, secrets/data handling, and product claims.
7. Require an independent human review for security-sensitive or execution-related changes.
8. Merge only after required checks and review are satisfied.
9. Create a tagged release only after the release checklist is complete.
10. Deploy through a separately protected deployment process and run post-deployment smoke tests.

The current CI workflow has no deploy step. A green build must never be described as proof that a live deployment was tested.

## 5. Repository settings administrators must configure

Workflow YAML cannot by itself enforce all repository governance. A repository administrator should review and configure the following under **Settings → Rules → Rulesets** or the applicable branch-protection settings:

- Protect `main` from direct pushes and force pushes.
- Require pull requests before merging.
- Require at least one independent approval where team size permits.
- Dismiss stale approvals when new commits are pushed.
- Require the latest successful status checks for the current commit, including **Typecheck, tests, and production build** and the CodeQL analysis check.
- Require branches to be up to date before merge where appropriate.
- Restrict who can bypass rules.
- Disable force pushes and branch deletion for protected branches.
- Restrict production deployment permissions and require approval for production environments.

**Observed repository state (1 November 2026):** GitHub reports the `main` branch as unprotected (`protected: false`), with branch-protection enforcement disabled and no required status checks. This is a confirmed release blocker, not an unverified assumption. The available repository connection can inspect but cannot administer branch protection. An owner with repository administration rights must configure the rules above in GitHub Settings and then re-read the branch protection state to confirm enforcement.

## 6. Secrets and environment variables

The current CI and CodeQL workflows do not require the Gemini API key and should not receive it. Do not add provider keys to workflow YAML, source code, test fixtures, or build-time browser variables.

Production AI routes are disabled by default. Do not set `AI_API_ENABLED=true` until authentication, per-user quotas, tenant isolation, and shared/edge rate limiting are implemented and verified.

If a future workflow requires deployment credentials:
- Use GitHub Environments and narrowly scoped secrets.
- Separate preview and production credentials.
- Require approval for production.
- Grant only the permissions needed by that job.
- Never print secrets or upload them as artifacts.
- Rotate any credential that appears in logs, commits, artifacts, or public issues.

## 7. Troubleshooting

| Symptom | Likely cause | Safe response |
| --- | --- | --- |
| Frozen dependency install fails | Lockfile and manifest are inconsistent | Reconcile dependencies intentionally, update lockfile, rerun CI |
| Typecheck fails | Type or API contract mismatch | Fix the reported source and add a test for changed behaviour |
| Tests fail | Regression or test assumption drift | Reproduce locally and inspect the first failing assertion |
| Build fails after tests pass | Vite/server bundle or environment-specific issue | Inspect build log and verify both browser and server entry points |
| Artifact upload fails | Missing or empty `dist/` output | Confirm build step succeeded and output directory is correct |
| CodeQL reports an alert | Potential source-level security issue | Triage the alert and test a mitigation; do not dismiss without review |
| A run is cancelled | A newer run superseded it under concurrency rules | Inspect the newest run for the current commit SHA |
| Workflow does not run for a PR | Target branch does not match the configured PR trigger | Confirm the PR base branch or deliberately update workflow triggers |

## 8. Current limitations

- No workflow deploys to Vercel or any other host.
- No browser E2E or accessibility automation is configured yet.
- No deployed preview smoke test is configured yet.
- No independent penetration test is run by CI.
- The repository's branch-protection and environment-approval settings have not been verified by this automation.
- A successful CodeQL run does not replace human review or a threat-model assessment.
- The application remains a research/education prototype; the current CI pipeline does not validate secure autonomous execution or production candidate promotion.

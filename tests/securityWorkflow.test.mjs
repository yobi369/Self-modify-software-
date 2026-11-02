import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workflow = await readFile(new URL("../.github/workflows/security.yml", import.meta.url), "utf8");

test("security workflow runs dependency and secret checks on pull requests and protected development branches", () => {
  assert.match(workflow, /pull_request:\n\s+branches: \[main\]/);
  assert.match(workflow, /push:\n\s+branches: \[main, "production\/\*\*"\]/);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
});

test("security workflow pins every third-party action to a full immutable commit SHA", () => {
  const actions = [...workflow.matchAll(/^\s+uses:\s+[^@\s]+@([0-9a-f]+)(?:\s+#.*)?$/gm)];
  assert.equal(actions.length, 4, "expected checkout x2, setup-bun, and dependency-review");
  for (const [, sha] of actions) assert.match(sha, /^[0-9a-f]{40}$/);
  assert.match(workflow, /gitleaks\/gitleaks-action@[0-9a-f]{40}/);
});

test("dependency audit blocks high and critical advisories without modifying the lockfile", () => {
  assert.match(workflow, /bun audit --audit-level=high/);
});

test("pull request dependency review blocks moderate and higher severity changes", () => {
  assert.match(workflow, /fail-on-severity: moderate/);
  assert.match(workflow, /comment-summary-in-pr: never/);
});

test("secret scanning checks full git history without granting write permissions", () => {
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /GITLEAKS_ENABLE_COMMENTS: "false"/);
  assert.match(workflow, /permissions:\n\s+contents: read\n\s+pull-requests: read/);
  assert.doesNotMatch(workflow, /pull_request_target/);
});

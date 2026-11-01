import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  checkCandidateExecutionAvailability,
  generateMachineReadableSecurityVerdict,
  runAdversarialPenetrationSuite,
  runFalsePositiveChallenge,
} from "../src/utils/adversarialSandbox.ts";
import {
  buildReproducibilityReport,
  clearExperimentChain,
  reproduceExperiment,
  verifyEvidenceIntegrity,
  verifyExperimentChainIntegrity,
  getExperimentChain,
} from "../src/utils/reproducibilityEvidence.ts";

beforeEach(() => clearExperimentChain());

test("candidate execution gate fails closed and never evaluates source", () => {
  globalThis.__sandboxProbe = false;
  const result = checkCandidateExecutionAvailability("globalThis.__sandboxProbe = true;", []);
  assert.equal(result.success, false);
  assert.equal(result.executionStatus, "NOT_EXECUTED");
  assert.match(result.error, /EXECUTION_DISABLED/);
  assert.equal(result.result, null);
  assert.equal(globalThis.__sandboxProbe, false);
  delete globalThis.__sandboxProbe;
});

test("a clean lexical scan is NOT_EVALUATED, not a security pass", () => {
  const result = generateMachineReadableSecurityVerdict("SAFE-EXAMPLE", "Simple function", "function add(a,b){ return a+b; }");
  assert.equal(result.verdict, "NOT_EVALUATED");
  assert.equal(result.machineReadablePayload.securityGates.runtimeExecution, "NOT_EXECUTED");
  assert.equal(result.machineReadablePayload.securityGates.isolationBoundary, "UNAVAILABLE");
});

test("known dangerous lexical patterns are flagged without executing payloads", () => {
  const result = generateMachineReadableSecurityVerdict("UNSAFE-EXAMPLE", "Dynamic code", "const f = eval(source);");
  assert.equal(result.verdict, "BLOCKED");
  assert.ok(result.staticPatternFindings.some((finding) => finding.includes("STATIC_PATTERN_EVAL")));
  assert.deepEqual(result.runtimeTrapsTriggered.length, 1);
});

test("adversarial vectors are screened but never executed", () => {
  const results = runAdversarialPenetrationSuite();
  assert.equal(results.length, 9);
  assert.ok(results.every((result) => result.executionStatus === "NOT_EXECUTED"));
  assert.ok(results.every((result) => result.quarantined === true));
  assert.ok(results.every((result) => result.runtimeErrorCaught?.includes("NOT_EXECUTED")));
});

test("false-positive challenge reports lexical findings, not runtime passes", () => {
  const result = runFalsePositiveChallenge();
  assert.equal(result.totalLegitimateSnippets, 5);
  assert.equal(result.passedCount, 0);
  assert.ok(result.snippets.every((snippet) => snippet.result === "NOT_EVALUATED" || snippet.result === "FALSE_POSITIVE"));
  assert.equal(typeof result.falsePositiveRatePercent, "number");
});

test("browser-generated evidence is explicitly simulated with no fabricated test results", () => {
  const report = buildReproducibilityReport({ experimentId: "TEST-SIMULATED-EVIDENCE" });
  assert.equal(report.evidenceMode, "SIMULATED");
  assert.equal(report.promotionDecision, "SIMULATED");
  assert.equal(report.finalDisposition, "SIMULATED");
  assert.equal(report.testResults.totalTests, 0);
  assert.equal(report.securityFindings.membraneVerdict, "NOT_EVALUATED");
  assert.match(report.baselineMutationHash, /^sha256:/);
  assert.equal(report.commitSha, "UNKNOWN");
});

test("local digest chain verifies internal consistency without claiming authenticity", () => {
  buildReproducibilityReport({ experimentId: "TEST-CHAIN-01" });
  const result = verifyExperimentChainIntegrity(getExperimentChain());
  assert.equal(result.isChainValid, true);
  assert.match(result.message, /does not authenticate the author/);
});

test("reproduction comparison remains NOT_EVALUATED for synthetic data", async () => {
  const original = buildReproducibilityReport({ experimentId: "TEST-ORIGINAL" });
  const comparison = await reproduceExperiment(original);
  assert.equal(comparison.evidenceMode, "SIMULATED");
  assert.equal(comparison.overallConvergence, "NOT_EVALUATED");
  assert.equal(comparison.tostEquivalence.status, "NOT_EVALUATED");
  assert.equal(comparison.reproductionReport.finalDisposition, "SIMULATED");
  assert.equal(comparison.reproductionReport.testResults.totalTests, 0);
});

test("record digest detects a changed report field", () => {
  const report = buildReproducibilityReport({ experimentId: "TEST-TAMPER-DETECTION" });
  report.candidateMutationHash = "tampered-value";
  const result = verifyEvidenceIntegrity(report);
  assert.equal(result.isValid, false);
  assert.equal(result.sealMatches, false);
});

test("browser playground does not evaluate editable JavaScript source", async () => {
  const source = await readFile(new URL("../src/components/LiveSandboxPlayground.tsx", import.meta.url), "utf8");
  assert.match(source, /readOnly/);
  assert.doesNotMatch(source, /new Function\s*\(/);
  assert.doesNotMatch(source, /eval\s*\(/);
});

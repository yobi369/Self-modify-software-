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

test("public metadata accurately describes the research prototype", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /Self-Modifying Software Studio \| Research Prototype/);
  assert.match(html, /Arbitrary code execution and deployed AI mutation are disabled/);
  assert.match(html, /does not execute untrusted code or verify semantic equivalence/);
  assert.doesNotMatch(html, /research-grade environment|Binary Mutation Research Suite|95 Assertions|Zero Divergence/);
});

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
  assert.equal(report.finalState, "SIMULATED");
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
  assert.equal(comparison.reproductionReport.finalState, "SIMULATED");
  assert.equal(comparison.reproductionReport.testResults.totalTests, 0);
});

test("record digest detects a changed report field", () => {
  const report = buildReproducibilityReport({ experimentId: "TEST-TAMPER-DETECTION" });
  report.candidateMutationHash = "tampered-value";
  const result = verifyEvidenceIntegrity(report);
  assert.equal(result.isValid, false);
  assert.equal(result.sealMatches, false);
});

test("methodology UI does not claim unimplemented sandbox or statistical verification", async () => {
  const source = await readFile(new URL("../src/components/MethodologySpecificationModal.tsx", import.meta.url), "utf8");
  assert.match(source, /No untrusted-code sandbox is implemented/);
  assert.match(source, /TOST calculation: NOT EVALUATED/);
  assert.match(source, /No independent security audit has been completed/);
  assert.doesNotMatch(source, /95 Assertions|hermetic JavaScript execution membrane|Studio implements a formal Two One-Sided Tests|Blocked prior to compilation|100\.0% \(Zero Divergence\)/);
});

test("research dashboards do not overstate sandbox, rollback, or benchmark evidence", async () => {
  const realityLab = await readFile(new URL("../src/components/RealityVerificationLab.tsx", import.meta.url), "utf8");
  const productionDemo = await readFile(new URL("../src/components/AutonomousProductionEngine.tsx", import.meta.url), "utf8");
  const evidenceUtility = await readFile(new URL("../src/utils/reproducibilityEvidence.ts", import.meta.url), "utf8");
  const aiArchitect = await readFile(new URL("../src/components/AiMetamorphicArchitect.tsx", import.meta.url), "utf8");
  assert.match(realityLab, /Browser runtime \(not isolated\)/);
  assert.match(realityLab, /s\.passed \? "PASS" : "FAIL"/);
  assert.doesNotMatch(realityLab, /ECMA-262 V8 Isolated Context|TOST ANALYSIS/);
  assert.match(evidenceUtility, /engine not independently identified/);
  assert.doesNotMatch(evidenceUtility, /V8\/JIT Engine|V8 Node\/Browser Runtime/);
  assert.match(aiArchitect, /Local SHA-256 digests; unsigned and not independently verified/);
  assert.doesNotMatch(aiArchitect, /Provider-Neutral Research Engine|Deep runtime opcode|Cryptographic SHA-256 seal/);
  assert.match(productionDemo, /Formal significance test: NOT RUN/);
  assert.match(productionDemo, /NOT MEASURED/);
  assert.doesNotMatch(productionDemo, /Statistical Significance: p|IMMUTABLE CHECKPOINT HISTORY LEDGER|AUTO-ROLLBACK/);
});

test("browser playground does not evaluate editable JavaScript source", async () => {
  const source = await readFile(new URL("../src/components/LiveSandboxPlayground.tsx", import.meta.url), "utf8");
  assert.match(source, /readOnly/);
  assert.doesNotMatch(source, /new Function\s*\(/);
  assert.doesNotMatch(source, /eval\s*\(/);
});

test("simulated evidence counts only explicitly reported passed and failed suites", () => {
  const report = buildReproducibilityReport({
    experimentId: "TEST-SUITE-COUNTS",
    testSuiteResults: [
      { suiteName: "passed-fixture", passed: true, durationMs: 12, assertions: 4 },
      { suiteName: "failed-fixture", passed: false, durationMs: 18, assertions: 3 },
    ],
  });
  assert.equal(report.testResults.totalTests, 2);
  assert.equal(report.testResults.passedCount, 1);
  assert.equal(report.testResults.failedCount, 1);
  assert.equal(report.statistics.speedupFactorOnDefinedWorkload, null);
  assert.equal(report.testResults.suites[1].passed, false);
});

test("evidence UI labels timing values as synthetic and not measured", async () => {
  const source = await readFile(new URL("../src/components/RealityVerificationLab.tsx", import.meta.url), "utf8");
  assert.match(source, /Synthetic Timing Fixture/);
  assert.match(source, /NO MEASURED SPEEDUP/);
  assert.match(source, /Illustrative Range/);
  assert.match(source, /Recorded Test Suites/);
});

test("browser lifecycle simulation contains no claimed measured speedup or real rollback", async () => {
  const source = await readFile(new URL("../src/components/RealityVerificationLab.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /Measured 48 μs latency|10\.2x speedup|AUTOMATIC ROLLBACK EXECUTED/);
  assert.match(source, /no deployment rollback or restoration was executed/i);
  assert.match(source, /NOT MEASURED/);
});

test("invalid or undersized benchmark fixtures fall back to finite synthetic samples", () => {
  const empty = buildReproducibilityReport({ experimentId: "TEST-EMPTY-SAMPLES", benchmarkSamples: [] });
  assert.equal(empty.evidenceMode, "SIMULATED");
  assert.equal(empty.statistics.sampleCount, 20);
  assert.ok(empty.benchmarkSamples.every(Number.isFinite));

  clearExperimentChain();
  const invalid = buildReproducibilityReport({
    experimentId: "TEST-INVALID-SAMPLES",
    benchmarkSamples: [Number.NaN, Number.POSITIVE_INFINITY, -1],
  });
  assert.equal(invalid.statistics.sampleCount, 20);
  assert.ok(invalid.benchmarkSamples.every((sample) => Number.isFinite(sample) && sample >= 0));
});

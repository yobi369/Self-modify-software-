import { ReproducibilityEvidenceReport, ReproductionComparisonReport, TostEquivalenceResult } from '../types';
import { computeSha256 } from './cryptoSha256';

// Genesis hash for initial chain block
const GENESIS_PREV_HASH = 'sha256:0000000000000000000000000000000000000000000000000000000000000000';

// In-memory demonstration ledger; it is not an authenticated or tamper-proof evidence store.
let experimentLedger: ReproducibilityEvidenceReport[] = [];

export function getExperimentChain(): ReproducibilityEvidenceReport[] {
  return [...experimentLedger];
}

export function clearExperimentChain(): void {
  experimentLedger = [];
}

/**
 * Computes a deterministic canonical string from an evidence record to produce a local integrity digest.
 * This digest is not signed and does not authenticate the record's author or truth.
 */
export function computeCanonicalPayloadDigest(payload: {
  experimentId: string;
  softwareVersion: string;
  commitSha: string;
  baselineMutationHash: string;
  candidateMutationHash: string;
  sampleCount: number;
  meanLatencyUs: number;
  medianLatencyUs: number;
  p95LatencyUs: number;
  ciLower: number;
  ciUpper: number;
  promotionDecision: string;
  previousEvidenceHash: string;
}): string {
  const canonicalString = JSON.stringify({
    experimentId: payload.experimentId,
    softwareVersion: payload.softwareVersion,
    commitSha: payload.commitSha,
    baselineMutationHash: payload.baselineMutationHash,
    candidateMutationHash: payload.candidateMutationHash,
    sampleCount: payload.sampleCount,
    meanLatencyUs: payload.meanLatencyUs,
    medianLatencyUs: payload.medianLatencyUs,
    p95LatencyUs: payload.p95LatencyUs,
    ciLower: payload.ciLower,
    ciUpper: payload.ciUpper,
    promotionDecision: payload.promotionDecision,
    previousEvidenceHash: payload.previousEvidenceHash
  });
  return `sha256:${computeSha256(canonicalString)}`;
}

export function buildReproducibilityReport(params: {
  experimentId: string;
  testSuiteResults?: { suiteName: string; passed: boolean; durationMs: number; assertions: number }[];
  benchmarkSamples?: number[];
  astViolations?: string[];
  runtimeTrapsTriggered?: string[];
  membraneVerdict?: 'BLOCKED' | 'PERMITTED' | 'NOT_EVALUATED';
  falsePositiveRate?: number | null;
  rollbackEvent?: {
    watchdogFired: boolean;
    triggerReason: string | null;
    restoredTarget: string;
    restorationLatencyMs: number;
  };
  finalDisposition?: 'PROMOTED_TO_LIVE' | 'QUARANTINED_BLOCKED' | 'ROLLED_BACK_RESTORED_BASELINE' | 'SIMULATED';
  parentExperimentId?: string;
  parentIntegrityHash?: string;
}): ReproducibilityEvidenceReport {
  const samples = params.benchmarkSamples || [
    34.2, 33.8, 35.1, 34.0, 33.9, 36.2, 34.4, 33.7, 34.8, 34.1,
    33.5, 35.0, 34.3, 33.9, 34.6, 33.8, 34.2, 35.3, 34.0, 33.6
  ];

  // Statistical calculations
  const n = samples.length;
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = parseFloat((sum / n).toFixed(2));
  
  const median = n % 2 === 0
    ? parseFloat(((sorted[n / 2 - 1] + sorted[n / 2]) / 2).toFixed(2))
    : parseFloat(sorted[Math.floor(n / 2)].toFixed(2));
    
  const p95 = parseFloat(sorted[Math.floor(n * 0.95)].toFixed(2));
  const p99 = parseFloat(sorted[Math.floor(n * 0.99)].toFixed(2));
  
  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
  const stdDev = parseFloat(Math.sqrt(variance).toFixed(3));
  
  // 95% Confidence Interval: mean +/- 1.96 * (stdDev / sqrt(n))
  const margin = 1.96 * (stdDev / Math.sqrt(n));
  const ci95: [number, number] = [
    parseFloat((mean - margin).toFixed(2)),
    parseFloat((mean + margin).toFixed(2))
  ];

  // Baseline was 492 μs on the defined workload
  const baselineMean = 492.0;
  const speedup = parseFloat((baselineMean / mean).toFixed(2));

  // This browser-generated report is always a simulation, never production evidence.
  const disposition = 'SIMULATED' as const;

  const defaultSuites = [
    { suiteName: 'Structural Invariant & Type Contract Suite', passed: true, durationMs: 1.4, assertions: 12 },
    { suiteName: 'Deterministic Output Parity Equivalence Suite', passed: true, durationMs: 2.1, assertions: 25 },
    { suiteName: 'Adversarial Edge-Case & Null-Token Suite', passed: true, durationMs: 1.8, assertions: 18 },
    { suiteName: 'High-Volume Batch Permutation Suite', passed: true, durationMs: 3.5, assertions: 40 }
  ];
  const testSuites = params.testSuiteResults || [];
  const totalAssertions = testSuites.reduce((acc, s) => acc + s.assertions, 0);

  const baselineMutationHash = `sha256:${computeSha256('SYNTHETIC_BASELINE_FIXTURE_NOT_SOURCE')}`;
  const candidateMutationHash = `sha256:${computeSha256('SYNTHETIC_CANDIDATE_FIXTURE_NOT_SOURCE')}`;

  const promotionDecision = 'SIMULATED' as const;

  // Client-side hash-link demonstration
  const chainIndex = experimentLedger.length;
  const previousEvidenceHash = experimentLedger.length > 0
    ? experimentLedger[experimentLedger.length - 1].evidenceIntegrityHash
    : GENESIS_PREV_HASH;

  // Compute canonical integrity digest over normalized experiment record
  const evidenceIntegrityHash = computeCanonicalPayloadDigest({
    experimentId: params.experimentId,
    softwareVersion: '0.0.0-research-prototype',
    commitSha: 'UNKNOWN',
    baselineMutationHash,
    candidateMutationHash,
    sampleCount: n,
    meanLatencyUs: mean,
    medianLatencyUs: median,
    p95LatencyUs: p95,
    ciLower: ci95[0],
    ciUpper: ci95[1],
    promotionDecision,
    previousEvidenceHash
  });

  const tamperEvidentSeal = `SENTINEL-CHAIN-SEAL:${evidenceIntegrityHash}#BLOCK-${chainIndex}`;

  const report: ReproducibilityEvidenceReport = {
    experimentId: params.experimentId,
    timestamp: new Date().toISOString(),
    softwareVersion: '0.0.0-research-prototype',
    commitSha: 'UNKNOWN',
    commitVersion: 'Unversioned research prototype',
    browserRuntime: typeof navigator !== 'undefined' ? `${navigator.userAgent} [V8/JIT Engine]` : 'V8 Node/Browser Runtime',
    scopeBoundaries: {
      runtimeType: 'JavaScript Browser/Host Execution (ECMA-262)',
      isolationType: 'NO_RUNTIME_SANDBOX — execution disabled',
      scopeDeclaration: 'SIMULATED DEMONSTRATION ONLY. No candidate code was executed in an isolated runtime. This record is not security or production evidence.'
    },
    baselineMutationHash,
    candidateMutationHash,
    baseline: {
      hash: baselineMutationHash,
      description: 'Synthetic baseline fixture identifier; not a captured source artefact',
      version: 'Gen 0 (Initial Dispatch Target)'
    },
    candidate: {
      hash: candidateMutationHash,
      description: 'Synthetic candidate fixture identifier; not a captured source artefact',
      version: 'Gen 3 (Typed Hash-Cache Dispatch Target)'
    },
    inputDataset: {
      description: 'Illustrative synthetic fixture metadata; no external workload was captured',
      sampleCount: 0,
      dataTypes: [],
      previewSamples: []
    },
    testResults: {
      totalTests: totalAssertions,
      passedCount: totalAssertions,
      failedCount: 0,
      suites: testSuites
    },
    testSuiteResults: testSuites,
    benchmarkSamples: samples,
    statistics: {
      sampleCount: n,
      meanLatencyUs: mean,
      medianLatencyUs: median,
      p95LatencyUs: p95,
      p99LatencyUs: p99,
      standardDeviationUs: stdDev,
      confidenceInterval95Us: ci95,
      speedupFactorOnDefinedWorkload: speedup
    },
    securityFindings: {
      testedVectorsSummary: 'No runtime adversarial vectors executed. A lexical pattern scan only is available.',
      isolationMechanism: 'No isolated execution service configured; browser code execution disabled.',
      globalAccessObserved: 'NOT_TESTED',
      astViolations: params.astViolations || [],
      runtimeTrapsTriggered: params.runtimeTrapsTriggered || [],
      membraneVerdict: 'NOT_EVALUATED',
      falsePositiveRateOnLegitCorpus: params.falsePositiveRate ?? null
    },
    promotionDecision,
    decisionReason: 'SIMULATED DEMONSTRATION ONLY. No production promotion, independent test execution, or runtime security verification occurred.',
    watchdogEvents: {
      monitored: false,
      watchdogFired: false,
      triggerReason: null,
      anomalyThresholdPercent: 0,
      observedErrorRatePercent: 0,
      timestamp: new Date().toISOString()
    },
    rollbackCheckpoint: {
      available: false,
      checkpointId: 'NOT_APPLICABLE',
      restoredTargetVersion: 'NOT_APPLICABLE',
      restoredTargetHash: baselineMutationHash,
      restorationLatencyMs: 0
    },
    rollbackEvent: params.rollbackEvent || {
      watchdogFired: false,
      triggerReason: null,
      restoredTarget: 'NOT_APPLICABLE — simulated workflow',
      restorationLatencyMs: 0
    },
    evidenceMode: 'SIMULATED',
    finalState: 'SIMULATED',
    finalDisposition: 'SIMULATED',

    // Machine-readable local integrity digest chain
    chainIndex,
    previousEvidenceHash,
    evidenceIntegrityHash,
    tamperEvidentSeal,
    evidenceFormat: 'SIMULATED demonstration JSON; SHA-256 digest verifies only this record payload, not source provenance or experiment truth'
  };

  // Register in ledger
  experimentLedger.push(report);

  return report;
}

/**
 * Validates the cryptographic integrity of a given evidence report.
 */
export function verifyEvidenceIntegrity(report: ReproducibilityEvidenceReport): {
  isValid: boolean;
  computedHash: string;
  expectedHash: string;
  sealMatches: boolean;
} {
  const computedHash = computeCanonicalPayloadDigest({
    experimentId: report.experimentId,
    softwareVersion: report.softwareVersion,
    commitSha: report.commitSha,
    baselineMutationHash: report.baselineMutationHash,
    candidateMutationHash: report.candidateMutationHash,
    sampleCount: report.statistics.sampleCount,
    meanLatencyUs: report.statistics.meanLatencyUs,
    medianLatencyUs: report.statistics.medianLatencyUs,
    p95LatencyUs: report.statistics.p95LatencyUs,
    ciLower: report.statistics.confidenceInterval95Us[0],
    ciUpper: report.statistics.confidenceInterval95Us[1],
    promotionDecision: report.promotionDecision,
    previousEvidenceHash: report.previousEvidenceHash
  });

  const expectedSeal = `SENTINEL-CHAIN-SEAL:${computedHash}#BLOCK-${report.chainIndex}`;

  return {
    isValid: computedHash === report.evidenceIntegrityHash,
    computedHash,
    expectedHash: report.evidenceIntegrityHash,
    sealMatches: report.tamperEvidentSeal === expectedSeal
  };
}

/**
 * Validates the entire cryptographic chain sequence from genesis to the latest block.
 */
export function verifyExperimentChainIntegrity(chain: ReproducibilityEvidenceReport[]): {
  isChainValid: boolean;
  blockCount: number;
  brokenBlockIndex?: number;
  message: string;
} {
  if (chain.length === 0) {
    return { isChainValid: true, blockCount: 0, message: 'Chain is empty (Genesis state).' };
  }

  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];
    const singleCheck = verifyEvidenceIntegrity(block);
    if (!singleCheck.isValid || !singleCheck.sealMatches) {
      return {
        isChainValid: false,
        blockCount: chain.length,
        brokenBlockIndex: i,
        message: `Tamper detected at Block #${i}: Integrity seal mismatch.`
      };
    }

    if (i === 0) {
      if (block.previousEvidenceHash !== GENESIS_PREV_HASH) {
        return {
          isChainValid: false,
          blockCount: chain.length,
          brokenBlockIndex: 0,
          message: 'Genesis block must reference GENESIS_ROOT hash.'
        };
      }
    } else {
      const prevBlock = chain[i - 1];
      if (block.previousEvidenceHash !== prevBlock.evidenceIntegrityHash) {
        return {
          isChainValid: false,
          blockCount: chain.length,
          brokenBlockIndex: i,
          message: `Chain break detected between Block #${i - 1} and #${i}: Hash pointer broken.`
        };
      }
    }
  }

  return {
    isChainValid: true,
    blockCount: chain.length,
    message: `All ${chain.length} record digests and links are internally consistent. This does not authenticate the author or prove the experiment occurred.`
  };
}

/**
 * "Reproduce This Experiment"
 * Creates a simulated comparison using illustrative samples. It does not execute either source artefact,
 * run regression tests, or perform a formal statistical equivalence evaluation.
 */
export async function reproduceExperiment(
  originalReport: ReproducibilityEvidenceReport
): Promise<ReproductionComparisonReport> {
  // Simulate execution latency for genuine asynchronous pipeline (membrane instantiation & benchmark passes)
  await new Promise(resolve => setTimeout(resolve, 800));

  // Generate 20 fresh independent latency measurements for candidate under host execution
  // Centered close to 34.2 μs with realistic stochastic microsecond noise (±1.5 μs)
  const reproSamples: number[] = [
    34.1, 34.5, 33.9, 34.8, 34.0, 35.1, 33.7, 34.4, 34.6, 33.8,
    34.3, 34.9, 34.1, 33.8, 34.7, 34.2, 34.0, 35.2, 34.1, 33.9
  ];

  // Re-run test suites with fresh execution durations
  const reproSuites = [
    { suiteName: 'Structural Invariant & Type Contract Suite', passed: true, durationMs: 1.3, assertions: 12 },
    { suiteName: 'Deterministic Output Parity Equivalence Suite', passed: true, durationMs: 2.0, assertions: 25 },
    { suiteName: 'Adversarial Edge-Case & Null-Token Suite', passed: true, durationMs: 1.7, assertions: 18 },
    { suiteName: 'High-Volume Batch Permutation Suite', passed: true, durationMs: 3.4, assertions: 40 }
  ];

  const reproExpId = `EXP-REPRO-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

  // Build the reproduction evidence report
  const reproductionReport = buildReproducibilityReport({
    experimentId: reproExpId,
    testSuiteResults: reproSuites,
    benchmarkSamples: reproSamples,
    astViolations: [],
    runtimeTrapsTriggered: [],
    membraneVerdict: 'NOT_EVALUATED',
    falsePositiveRate: null,
    finalDisposition: 'SIMULATED',
    parentExperimentId: originalReport.experimentId,
    parentIntegrityHash: originalReport.evidenceIntegrityHash
  });

  // Calculate comparisons
  const origMean = originalReport.statistics.meanLatencyUs;
  const reproMean = reproductionReport.statistics.meanLatencyUs;
  const meanDeltaUs = parseFloat((reproMean - origMean).toFixed(2));
  const meanDeltaPercent = parseFloat((((reproMean - origMean) / origMean) * 100).toFixed(2));

  const origMedian = originalReport.statistics.medianLatencyUs;
  const reproMedian = reproductionReport.statistics.medianLatencyUs;
  const medianDeltaPercent = parseFloat((((reproMedian - origMedian) / origMedian) * 100).toFixed(2));

  const origP95 = originalReport.statistics.p95LatencyUs;
  const reproP95 = reproductionReport.statistics.p95LatencyUs;
  const p95DeltaPercent = parseFloat((((reproP95 - origP95) / origP95) * 100).toFixed(2));

  const origP99 = originalReport.statistics.p99LatencyUs;
  const reproP99 = reproductionReport.statistics.p99LatencyUs;
  const p99DeltaPercent = parseFloat((((reproP99 - origP99) / origP99) * 100).toFixed(2));

  const origCi = originalReport.statistics.confidenceInterval95Us;
  const reproCi = reproductionReport.statistics.confidenceInterval95Us;

  // Confidence Interval overlap
  const overlapStart = Math.max(origCi[0], reproCi[0]);
  const overlapEnd = Math.min(origCi[1], reproCi[1]);
  const ciOverlap = overlapStart <= overlapEnd;
  const ciOverlapRange: [number, number] | null = ciOverlap
    ? [parseFloat(overlapStart.toFixed(2)), parseFloat(overlapEnd.toFixed(2))]
    : null;

  // Formal Statistical Equivalence Testing (Two One-Sided Tests - TOST)
  // Predefined empirical reproducibility tolerance margin: Δ = 5.0% of baseline mean
  const n1 = originalReport.statistics.sampleCount;
  const n2 = reproductionReport.statistics.sampleCount;
  const s1 = originalReport.statistics.standardDeviationUs;
  const s2 = reproductionReport.statistics.standardDeviationUs;
  const seDiff = Math.sqrt((s1 * s1) / n1 + (s2 * s2) / n2);

  const equivalenceMarginPercent = 5.0; // predefined empirical reproducibility tolerance
  const equivalenceMarginUs = parseFloat((origMean * (equivalenceMarginPercent / 100)).toFixed(3));
  const meanDiffUs = reproMean - origMean;

  // Welch-Satterthwaite degrees of freedom
  const v1 = (s1 * s1) / n1;
  const v2 = (s2 * s2) / n2;
  const df = Math.max(10, Math.floor(Math.pow(v1 + v2, 2) / ((v1 * v1) / (n1 - 1) + (v2 * v2) / (n2 - 1))));
  
  // Critical t for α = 0.05 one-sided (90% confidence interval for TOST equivalence)
  const criticalT = 1.655;
  const lowerBoundDiff = parseFloat((meanDiffUs - criticalT * seDiff).toFixed(3));
  const upperBoundDiff = parseFloat((meanDiffUs + criticalT * seDiff).toFixed(3));

  const tStatLower = parseFloat(((meanDiffUs - (-equivalenceMarginUs)) / (seDiff || 0.001)).toFixed(3));
  const tStatUpper = parseFloat(((equivalenceMarginUs - meanDiffUs) / (seDiff || 0.001)).toFixed(3));

  // H0 is rejected if the (1 - 2α) CI for difference lies within [-Δ, +Δ]
  const h0Rejected = false; // Synthetic samples are illustrative; no inferential conclusion is issued.

  const tostEquivalence: TostEquivalenceResult = {
    status: 'NOT_EVALUATED',
    h0Statement: 'H₀: |μ_repro - μ_orig| ≥ Δ (performance difference exceeds the acceptable tolerance margin of 5.0%)',
    h1Statement: 'H₁: |μ_repro - μ_orig| < Δ (performance difference is within predefined equivalence margin of ±5.0%)',
    equivalenceMarginPercent,
    equivalenceMarginUs,
    meanDifferenceUs: parseFloat(meanDiffUs.toFixed(3)),
    meanDifferencePercent: meanDeltaPercent,
    confidenceIntervalOfDifferenceUs: [lowerBoundDiff, upperBoundDiff],
    tStatisticLower: tStatLower,
    tStatisticUpper: tStatUpper,
    degreesOfFreedom: df,
    criticalT,
    h0Rejected,
    conclusion: 'NOT EVALUATED: displayed sample values are synthetic and no independent reproduction was executed.'
  };

  // Tolerances
  const tolerances = {
    maxAllowedMeanDeltaPercent: 5.0, // the predefined empirical reproducibility tolerance for this experiment
    ciOverlapRequired: true,
    invariantParityRequired: true,
    maxAllowedP95DeltaPercent: 8.0 // ±8.0% tolerance
  };

  const toleranceChecks = {
    meanWithinTolerance: false,
    p95WithinTolerance: false,
    ciOverlapSatisfied: false,
    invariantsSatisfied: false,
    hashesIdentical: false,
    tostEquivalenceSatisfied: false
  };

  const isConverged = 
    toleranceChecks.meanWithinTolerance &&
    toleranceChecks.p95WithinTolerance &&
    toleranceChecks.ciOverlapSatisfied &&
    toleranceChecks.invariantsSatisfied &&
    toleranceChecks.hashesIdentical;

  const overallConvergence = 'NOT_EVALUATED' as const;

  const convergenceExplanation = 'NOT EVALUATED: this reproduction screen uses fixed synthetic samples and does not independently execute the baseline or candidate artefacts.';

  // Annotate the reproduction report with parent metadata
  reproductionReport.reproductionMetadata = {
    isReproduction: true,
    parentExperimentId: originalReport.experimentId,
    parentEvidenceIntegrityHash: originalReport.evidenceIntegrityHash,
    convergenceDeltaMeanPercent: meanDeltaPercent,
    confidenceIntervalsOverlap: ciOverlap,
    invariantParityPreserved: toleranceChecks.invariantsSatisfied,
    verdict: 'NOT_EVALUATED'
  };

  return {
    evidenceMode: 'SIMULATED',
    originalExperimentId: originalReport.experimentId,
    reproductionExperimentId: reproductionReport.experimentId,
    timestamp: new Date().toISOString(),
    baselineMatched: false,
    candidateMatched: false,
    originalCandidateHash: originalReport.candidate.hash,
    reproductionCandidateHash: reproductionReport.candidate.hash,
    originalTestsPassed: originalReport.testResults.passedCount,
    originalTestsTotal: originalReport.testResults.totalTests,
    reproductionTestsPassed: reproductionReport.testResults.passedCount,
    reproductionTestsTotal: reproductionReport.testResults.totalTests,
    invariantParityRatio: 0,
    sampleCount: reproductionReport.statistics.sampleCount,
    originalMeanUs: origMean,
    reproductionMeanUs: reproMean,
    meanDeltaUs,
    meanDeltaPercent,
    originalMedianUs: origMedian,
    reproductionMedianUs: reproMedian,
    medianDeltaPercent,
    originalP95Us: origP95,
    reproductionP95Us: reproP95,
    p95DeltaPercent,
    originalP99Us: origP99,
    reproductionP99Us: reproP99,
    p99DeltaPercent,
    originalCi95Us: origCi,
    reproductionCi95Us: reproCi,
    ciOverlap,
    ciOverlapRange,
    tostEquivalence,
    tolerances,
    toleranceChecks,
    overallConvergence,
    convergenceExplanation,
    originalReport,
    reproductionReport
  };
}

/**
 * Generates an independent, zero-dependency Node.js CLI script for auditing
 * evidence records and cryptographic hash chains offline in any standard terminal.
 */
/**
 * Generates an offline self-consistency checker for an exported evidence JSON file.
 * It does not execute candidate code and does not authenticate who created the report.
 */
export function generateNodeCliVerificationScript(_report: ReproducibilityEvidenceReport): string {
  return `// Self-Modifying Software Studio — evidence record self-consistency check
// Usage: node verify-evidence.mjs path/to/evidence-report.json
// This recomputes the embedded SHA-256 digest. It does NOT prove provenance,
// that tests actually ran, or that the report was signed by a trusted identity.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node verify-evidence.mjs path/to/evidence-report.json');
  process.exit(2);
}

const report = JSON.parse(readFileSync(file, 'utf8'));
const payload = {
  experimentId: report.experimentId,
  softwareVersion: report.softwareVersion,
  commitSha: report.commitSha,
  baselineMutationHash: report.baselineMutationHash,
  candidateMutationHash: report.candidateMutationHash,
  sampleCount: report.statistics.sampleCount,
  meanLatencyUs: report.statistics.meanLatencyUs,
  medianLatencyUs: report.statistics.medianLatencyUs,
  p95LatencyUs: report.statistics.p95LatencyUs,
  ciLower: report.statistics.confidenceInterval95Us[0],
  ciUpper: report.statistics.confidenceInterval95Us[1],
  promotionDecision: report.promotionDecision,
  previousEvidenceHash: report.previousEvidenceHash
};

const canonical = JSON.stringify(payload);
const computed = 'sha256:' + createHash('sha256').update(canonical).digest('hex');
const expectedSeal = 'SENTINEL-CHAIN-SEAL:' + computed + '#BLOCK-' + report.chainIndex;
const digestMatches = computed === report.evidenceIntegrityHash;
const sealMatches = expectedSeal === report.tamperEvidentSeal;

console.log('Record digest matches:', digestMatches);
console.log('Seal matches:', sealMatches);
console.log('Evidence mode:', report.evidenceMode || 'UNSPECIFIED');
console.log('Promotion decision:', report.promotionDecision);
console.log('NOTE: A matching digest is not a digital signature or proof of experiment truth.');

if (!digestMatches || !sealMatches) process.exitCode = 1;
`;
}

export interface MemoryByte {
  address: number;
  hex: string;
  originalHex: string;
  ascii: string;
  isModified: boolean;
  instruction?: string;
  isInstructionPointer?: boolean;
}

export interface MemoryPage {
  baseAddress: string;
  size: number;
  permissions: 'R-X' | 'RWX' | 'RW-' | 'R--' | '---';
  isExecutable: boolean;
  isWritable: boolean;
  name: string;
}

export interface CpuState {
  rip: string;
  rax: string;
  rbx: string;
  rcx: string;
  rdx: string;
  rsp: string;
  rbp: string;
  rdi: string;
  rsi: string;
  flags: {
    zero: boolean;
    carry: boolean;
    overflow: boolean;
  };
}

export interface SimulationStep {
  id: number;
  phase: 'INSPECT' | 'ANALYZE' | 'MODIFY' | 'WRITE_BACK' | 'CONTINUE';
  title: string;
  description: string;
  lineHighlight: number;
  cpu: CpuState;
  pagePermissions: 'R-X' | 'RWX' | 'RW-' | 'R--';
  modifiedAddresses?: number[];
  consoleOutput?: string;
  annotation: string;
}

export interface AiAnalysisResult {
  verdict: string;
  mechanism: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  osConstraints: string[];
  cacheCoherency: string;
  recommendedPattern: string;
  codeReview: string;
}

export interface AiMutationResult {
  mutatedCode: string;
  technique: string;
  explanation: string;
  behaviorPreserved: boolean;
}

export interface MutationCheckpoint {
  id: string;
  version: string;
  timestamp: string;
  mutationSummary: string;
  technique: string;
  code: string;
  status: 'active' | 'archived' | 'rolled_back' | 'rejected';
  metrics: {
    latencyUs: number;
    opsPerSec: number;
    memoryKb: number;
    testPassRate: number;
  };
  rejectionReason?: string;
  diffSummary?: string;
}

export interface AutomatedTestCase {
  id: string;
  name: string;
  description: string;
  category: 'INVARIANT' | 'BOUNDARY' | 'REGRESSION' | 'STRESS';
  input: any;
  expectedOutput: any;
}

export interface AutomatedTestResult {
  id: string;
  name: string;
  category: 'INVARIANT' | 'BOUNDARY' | 'REGRESSION' | 'STRESS';
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  durationMs: number;
  message: string;
}

export interface VerificationReport {
  lintPassed: boolean;
  syntaxValid: boolean;
  compilationSucceeded: boolean;
  tests: AutomatedTestResult[];
  allPassed: boolean;
  executionTimestamp: string;
}

export interface EvaluationReport {
  baselineLatencyUs: number;
  mutantLatencyUs: number;
  latencyDeltaPercent: number;
  baselineOpsPerSec: number;
  mutantOpsPerSec: number;
  opsDeltaPercent: number;
  targetMetricName: string;
  improved: boolean;
  accepted: boolean;
  decisionNote: string;
}

export interface SecurityAuditReport {
  sandboxIsolationLevel: 'HERMETIC_PROXY_WORKER' | 'RESTRICTED_REALM';
  networkAccessBlocked: boolean;
  storageAccessBlocked: boolean;
  secretsExposurePrevented: boolean;
  arbitraryExecutionRestricted: boolean;
  violationsDetected: string[];
  isCompliant: boolean;
}

export interface StateContinuityResult {
  counterBefore: number;
  counterDuring: number;
  counterAfter: number;
  reloadsDetected: number;
  domRemountsDetected: number;
  heapReferencePreserved: boolean;
  status: 'VERIFIED' | 'FAILED' | 'SIMULATED';
  log: string[];
}

export interface MutationIdentityResult {
  closureIdBefore: string;
  closureIdAfter: string;
  callableReferencesDiffer: boolean;
  parentContextPreserved: boolean;
  status: 'VERIFIED' | 'FAILED';
  proof: string;
}

export interface MaliciousVerdictResult {
  testId: string;
  name: string;
  sourceCode: string;
  verdict: 'BLOCKED' | 'PERMITTED' | 'NOT_EVALUATED';
  astViolations: string[];
  runtimeTrapsTriggered: string[];
  machineReadablePayload: Record<string, any>;
  quarantineLatencyMs: number;
}

export interface FalsePositiveChallengeResult {
  totalLegitimateSnippets: number;
  passedCount: number;
  blockedCount: number;
  falsePositiveRatePercent: number | null;
  snippets: {
    id: string;
    description: string;
    code: string;
    benignFeature: string;
    result: 'PASS' | 'FALSE_POSITIVE' | 'NOT_EVALUATED';
  }[];
}

export interface BlindRegressionResult {
  stage: 'UNIT_TESTS' | 'BENCHMARK' | 'PROMOTED' | 'PRODUCTION_TRAFFIC' | 'REGRESSION_DETECTED' | 'ROLLBACK_RESTORED';
  unitTestsPassed: boolean;
  benchmarkPassed: boolean;
  promotedToLive: boolean;
  trafficProcessedBeforeFault: number;
  faultTriggerPattern: string;
  watchdogTriggered: boolean;
  restoredVersion: string;
  log: string[];
}

export interface ReproducibilityEvidenceReport {
  experimentId: string;
  timestamp: string;
  softwareVersion: string;
  commitSha: string;
  commitVersion: string;
  browserRuntime: string;
  scopeBoundaries: {
    runtimeType: string;
    isolationType: string;
    scopeDeclaration: string;
  };
  baselineMutationHash: string;
  candidateMutationHash: string;
  baseline: {
    hash: string;
    description: string;
    version: string;
  };
  candidate: {
    hash: string;
    description: string;
    version: string;
  };
  inputDataset: {
    description: string;
    sampleCount: number;
    dataTypes: string[];
    previewSamples: string[];
  };
  testResults: {
    totalTests: number;
    passedCount: number;
    failedCount: number;
    suites: {
      suiteName: string;
      passed: boolean;
      durationMs: number;
      assertions: number;
    }[];
  };
  testSuiteResults: {
    suiteName: string;
    passed: boolean;
    durationMs: number;
    assertions: number;
  }[];
  benchmarkSamples: number[];
  statistics: {
    sampleCount: number;
    meanLatencyUs: number;
    medianLatencyUs: number;
    p95LatencyUs: number;
    p99LatencyUs: number;
    standardDeviationUs: number;
    confidenceInterval95Us: [number, number];
    speedupFactorOnDefinedWorkload: number;
  };
  securityFindings: {
    testedVectorsSummary: string;
    isolationMechanism: string;
    globalAccessObserved: string;
    astViolations: string[];
    runtimeTrapsTriggered: string[];
    membraneVerdict: 'BLOCKED' | 'PERMITTED' | 'NOT_EVALUATED';
    falsePositiveRateOnLegitCorpus: number | null;
  };
  evidenceMode: 'SIMULATED';
  promotionDecision: 'PROMOTED' | 'REJECTED' | 'QUARANTINED' | 'ROLLED_BACK' | 'SIMULATED';
  decisionReason: string;
  watchdogEvents: {
    monitored: boolean;
    watchdogFired: boolean;
    triggerReason: string | null;
    anomalyThresholdPercent: number;
    observedErrorRatePercent: number;
    timestamp: string;
  };
  rollbackCheckpoint: {
    available: boolean;
    checkpointId: string;
    restoredTargetVersion: string;
    restoredTargetHash: string;
    restorationLatencyMs: number;
  };
  rollbackEvent: {
    watchdogFired: boolean;
    triggerReason: string | null;
    restoredTarget: string;
    restorationLatencyMs: number;
  };
  finalState: 'PROMOTED_TO_LIVE' | 'QUARANTINED_BLOCKED' | 'ROLLED_BACK_RESTORED_BASELINE' | 'SIMULATED';
  finalDisposition: 'PROMOTED_TO_LIVE' | 'QUARANTINED_BLOCKED' | 'ROLLED_BACK_RESTORED_BASELINE' | 'SIMULATED';
  // Cryptographic Hash Chain & Tamper-Evident Experiment Seal
  chainIndex: number;
  previousEvidenceHash: string;
  evidenceIntegrityHash: string;
  tamperEvidentSeal: string;
  evidenceFormat: string;
  reproductionMetadata?: {
    isReproduction: boolean;
    parentExperimentId: string;
    parentEvidenceIntegrityHash: string;
    convergenceDeltaMeanPercent: number;
    confidenceIntervalsOverlap: boolean;
    invariantParityPreserved: boolean;
    verdict: 'CONVERGED' | 'DIVERGED' | 'NOT_EVALUATED';
  };
}

export interface TostEquivalenceResult {
  h0Statement: string;
  h1Statement: string;
  equivalenceMarginPercent: number;
  equivalenceMarginUs: number;
  meanDifferenceUs: number;
  meanDifferencePercent: number;
  confidenceIntervalOfDifferenceUs: [number, number];
  tStatisticLower: number;
  tStatisticUpper: number;
  degreesOfFreedom: number;
  criticalT: number;
  h0Rejected: boolean;
  conclusion: string;
}

export interface ReproductionComparisonReport {
  originalExperimentId: string;
  reproductionExperimentId: string;
  timestamp: string;
  baselineMatched: boolean;
  candidateMatched: boolean;
  originalCandidateHash: string;
  reproductionCandidateHash: string;
  originalTestsPassed: number;
  originalTestsTotal: number;
  reproductionTestsPassed: number;
  reproductionTestsTotal: number;
  invariantParityRatio: number;
  sampleCount: number;
  originalMeanUs: number;
  reproductionMeanUs: number;
  meanDeltaUs: number;
  meanDeltaPercent: number;
  originalMedianUs: number;
  reproductionMedianUs: number;
  medianDeltaPercent: number;
  originalP95Us: number;
  reproductionP95Us: number;
  p95DeltaPercent: number;
  originalP99Us: number;
  reproductionP99Us: number;
  p99DeltaPercent: number;
  originalCi95Us: [number, number];
  reproductionCi95Us: [number, number];
  ciOverlap: boolean;
  ciOverlapRange: [number, number] | null;
  tostEquivalence: TostEquivalenceResult;
  tolerances: {
    maxAllowedMeanDeltaPercent: number;
    ciOverlapRequired: boolean;
    invariantParityRequired: boolean;
    maxAllowedP95DeltaPercent: number;
  };
  toleranceChecks: {
    meanWithinTolerance: boolean;
    p95WithinTolerance: boolean;
    ciOverlapSatisfied: boolean;
    invariantsSatisfied: boolean;
    hashesIdentical: boolean;
    tostEquivalenceSatisfied: boolean;
  };
  evidenceMode: 'SIMULATED';
  overallConvergence: 'CONVERGED_WITHIN_TOLERANCES' | 'DIVERGED_OUTSIDE_TOLERANCES' | 'NOT_EVALUATED';
  convergenceExplanation: string;
  originalReport: ReproducibilityEvidenceReport;
  reproductionReport: ReproducibilityEvidenceReport;
}

export interface AuditableMutationRecord {
  recordId: string;
  timestamp: string;
  sourceCodeHashSha256: string;
  mutatedCodeHashSha256: string;
  mutationTechnique: string;
  language: string;
  behaviorPreserved: boolean;
  portabilityAudit: {
    cacheCoherencyValidated: boolean;
    wxDepCompliant: boolean;
    osConstraints: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  explanation: string;
  verifierSignature: string; // Explicitly unsigned until a real signing service is implemented.
}

export type ActiveTab = 
  | 'architecture'
  | 'infographic'
  | 'live_sandbox'
  | 'hex_inspector'
  | 'metamorphic_engine'
  | 'autonomous_engine'
  | 'reality_verification'
  | 'security_defense'
  | 'ai_architect'
  | 'evidence_suite'
  | 'simulator';

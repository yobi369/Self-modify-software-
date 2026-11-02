// Descriptive browser microbenchmark for fixed built-in demo functions. JIT tier state and statistical significance are not established.

export interface StatisticalMetric {
  sampleCount: number;
  warmupRuns: number;
  meanUs: number;
  medianUs: number;
  p99Us: number;
  stdDevUs: number;
  confidenceInterval95: [number, number];
  coefficientOfVariationPercent: number; // CV % = (stdDev / mean) * 100
  opsPerSec: number;
  jitState: 'NOT_OBSERVED';
  isStatisticallySignificant: boolean;
}

export interface ComparativeBenchmarkReport {
  baseline: StatisticalMetric;
  mutant: StatisticalMetric;
  speedupMultiplier: number;
  latencyDeltaPercent: number;
  pValueEstimate: number | null;
  confidenceOverlap: boolean;
  recommendation: 'PROMOTE' | 'REJECT' | 'INCONCLUSIVE_NOISE';
  diagnosticNote: string;
}

// Generates a deterministic synthetic token fixture; it is not a captured real-world workload.
export function generateBenchmarkDataset(size: number = 500): string[] {
  const dictionary = [
    'syscall', 'mprotect', 'rip', 'rax', 'rbx', 'rcx', 'rdx', 'rsp', 'rbp', 'rsi',
    'rdi', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15', 'flags',
    'nop', 'push', 'pop', 'ret', 'jmp', 'call', 'add', 'sub', 'xor', 'mov'
  ];
  const dataset: string[] = [];
  for (let i = 0; i < size; i++) {
    dataset.push(dictionary[i % dictionary.length]);
  }
  return dataset;
}

// Collects descriptive timing samples in the current browser session; results are environment-dependent and not production evidence.
export function runStatisticalBenchmark(
  fn: (items: any[]) => any,
  dataset: string[],
  warmupIterations: number = 150,
  trialEpochs: number = 5,
  samplesPerEpoch: number = 40
): StatisticalMetric {
  // 1. Warm-up phase. This does not guarantee or observe any particular JavaScript engine JIT tier.
  for (let w = 0; w < warmupIterations; w++) {
    fn(dataset);
  }

  // 2. Multi-Trial Sampling
  const samplesUs: number[] = [];

  for (let epoch = 0; epoch < trialEpochs; epoch++) {
    for (let s = 0; s < samplesPerEpoch; s++) {
      const t0 = performance.now();
      fn(dataset);
      const t1 = performance.now();
      const elapsedUs = (t1 - t0) * 1000;
      // Filter out extreme micro-pauses from garbage collector
      if (elapsedUs > 0) {
        samplesUs.push(elapsedUs);
      }
    }
  }

  // Sort samples for percentile calculation
  samplesUs.sort((a, b) => a - b);
  const n = samplesUs.length;

  // Mean
  const sum = samplesUs.reduce((acc, val) => acc + val, 0);
  const meanUs = sum / n;

  // Variance & Standard Deviation
  const variance = samplesUs.reduce((acc, val) => acc + Math.pow(val - meanUs, 2), 0) / (n - 1);
  const stdDevUs = Math.sqrt(variance);

  // Median & P99
  const medianUs = samplesUs[Math.floor(n * 0.5)];
  const p99Us = samplesUs[Math.min(n - 1, Math.floor(n * 0.99))];

  // 95% Confidence Interval: mean +/- 1.96 * (stdDev / sqrt(n))
  const marginOfError = 1.96 * (stdDevUs / Math.sqrt(n));
  const ciLower = Math.max(0, parseFloat((meanUs - marginOfError).toFixed(2)));
  const ciUpper = parseFloat((meanUs + marginOfError).toFixed(2));

  // Coefficient of Variation: (stdDev / mean) * 100
  const cvPercent = parseFloat(((stdDevUs / (meanUs || 1)) * 100).toFixed(1));

  const opsPerSec = Math.round(1000000 / (meanUs || 1));

  return {
    sampleCount: n,
    warmupRuns: warmupIterations,
    meanUs: parseFloat(meanUs.toFixed(2)),
    medianUs: parseFloat(medianUs.toFixed(2)),
    p99Us: parseFloat(p99Us.toFixed(2)),
    stdDevUs: parseFloat(stdDevUs.toFixed(2)),
    confidenceInterval95: [ciLower, ciUpper],
    coefficientOfVariationPercent: cvPercent,
    opsPerSec,
    jitState: 'NOT_OBSERVED',
    isStatisticallySignificant: false
  };
}

// Compare descriptive timing summaries. This is not a Welch test, formal significance test, or promotion gate.
export function compareBenchmarks(
  baseline: StatisticalMetric,
  mutant: StatisticalMetric
): ComparativeBenchmarkReport {
  const speedup = parseFloat((baseline.meanUs / (mutant.meanUs || 1)).toFixed(2));
  const latencyDelta = parseFloat((((mutant.meanUs - baseline.meanUs) / baseline.meanUs) * 100).toFixed(1));

  // Confidence Interval overlap check
  // Non-overlapping descriptive intervals are not a formal inferential test.
  const isConfidenceDistinct = mutant.confidenceInterval95[1] < baseline.confidenceInterval95[0];
  const pValue: number | null = null;

  let recommendation: 'PROMOTE' | 'REJECT' | 'INCONCLUSIVE_NOISE' = 'INCONCLUSIVE_NOISE';
  let diagnostic = '';

  if (latencyDelta < -10 && isConfidenceDistinct) {
    recommendation = 'INCONCLUSIVE_NOISE';
    diagnostic = `Provisional apparent speedup (+${speedup}x) on this browser workload. Confidence intervals are descriptive only; no formal significance test or JIT-state inspection was performed. Not eligible for automatic promotion.`;
  } else if (latencyDelta > 5) {
    recommendation = 'REJECT';
    diagnostic = `The second built-in demo function was slower by ${latencyDelta}%. This descriptive heuristic labels the comparison REJECT; no inferential test or production promotion decision was performed.`;
  } else {
    recommendation = 'INCONCLUSIVE_NOISE';
    diagnostic = `Delta is within noise envelope (CV: ${mutant.coefficientOfVariationPercent}% vs ${baseline.coefficientOfVariationPercent}%). Inconclusive variance.`;
  }

  return {
    baseline,
    mutant,
    speedupMultiplier: speedup,
    latencyDeltaPercent: latencyDelta,
    pValueEstimate: pValue,
    confidenceOverlap: !isConfidenceDistinct,
    recommendation,
    diagnosticNote: diagnostic
  };
}

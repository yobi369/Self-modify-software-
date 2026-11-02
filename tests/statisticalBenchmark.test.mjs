import test from "node:test";
import assert from "node:assert/strict";
import {
  compareBenchmarks,
  generateBenchmarkDataset,
  runStatisticalBenchmark,
} from "../src/utils/statisticalBenchmark.ts";

test("benchmark fixture is deterministic and explicitly synthetic", () => {
  const first = generateBenchmarkDataset(60);
  const second = generateBenchmarkDataset(60);
  assert.equal(first.length, 60);
  assert.deepEqual(first, second);
});

test("browser benchmark reports descriptive timings without claiming JIT or significance", () => {
  const dataset = generateBenchmarkDataset(50);
  const baseline = runStatisticalBenchmark((items) => items.filter(Boolean).length, dataset, 2, 1, 8);
  const candidate = runStatisticalBenchmark((items) => new Set(items).size, dataset, 2, 1, 8);
  const comparison = compareBenchmarks(baseline, candidate);

  assert.ok(baseline.sampleCount >= 2);
  assert.equal(baseline.jitState, "NOT_OBSERVED");
  assert.equal(baseline.isStatisticallySignificant, false);
  assert.equal(comparison.pValueEstimate, null);
  assert.notEqual(comparison.recommendation, "PROMOTE");
  assert.match(comparison.diagnosticNote, /no formal significance test|inconclusive/i);
});

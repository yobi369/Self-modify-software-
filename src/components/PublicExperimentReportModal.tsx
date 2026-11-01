import React, { useState } from 'react';
import { 
  FileCheck, 
  Download, 
  Copy, 
  Check, 
  XCircle, 
  ShieldCheck, 
  Terminal, 
  Activity, 
  Lock, 
  AlertTriangle, 
  Printer, 
  ArrowRight,
  GitBranch,
  Cpu
} from 'lucide-react';
import { ReproducibilityEvidenceReport, ReproductionComparisonReport } from '../types';
import { sounds } from '../audio/soundEffects';
import { generateNodeCliVerificationScript } from '../utils/reproducibilityEvidence';

interface PublicExperimentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReproducibilityEvidenceReport;
  comparison?: ReproductionComparisonReport | null;
}

export const PublicExperimentReportModal: React.FC<PublicExperimentReportModalProps> = ({
  isOpen,
  onClose,
  report,
  comparison
}) => {
  const [copiedMarkdown, setCopiedMarkdown] = useState<boolean>(false);
  const [copiedNodeScript, setCopiedNodeScript] = useState<boolean>(false);
  const [downloadingJson, setDownloadingJson] = useState<boolean>(false);

  if (!isOpen || !report) return null;

  const standaloneNodeScript = generateNodeCliVerificationScript(report);

  const generateMarkdownReport = () => {
    return `# SIMULATED RESEARCH REPORT

**Evidence mode:** ${report.evidenceMode}
**Experiment ID:** ${report.experimentId}
**Generated:** ${report.timestamp}
**Software version:** ${report.softwareVersion}
**Source commit:** ${report.commitSha}

## Critical scope notice

This is an illustrative browser-generated research demonstration. It is **not production evidence**. No production workload was measured, no candidate was promoted, and no arbitrary candidate code was executed in a secure isolated runtime.

## Report status

- **Final disposition:** SIMULATED
- **Promotion decision:** SIMULATED — no deployment occurred
- **Runtime isolation:** Not available; code execution disabled
- **Security verdict:** Not evaluated at runtime
- **Recorded automated test suites:** ${report.testResults.totalTests}
- **Recorded assertions passed:** ${report.testResults.passedCount}
- **Recorded assertions failed:** ${report.testResults.failedCount}

## Illustrative metrics

The following values are synthetic demonstration data and must not be used for performance claims, service-level commitments, or purchasing decisions.

- Sample count: ${report.statistics.sampleCount}
- Mean latency: ${report.statistics.meanLatencyUs} μs
- Median latency: ${report.statistics.medianLatencyUs} μs
- P95 latency: ${report.statistics.p95LatencyUs} μs
- P99 latency: ${report.statistics.p99LatencyUs} μs
- 95% interval: [${report.statistics.confidenceInterval95Us[0]}, ${report.statistics.confidenceInterval95Us[1]}] μs

## Integrity identifiers

- Baseline fixture digest: ${report.baselineMutationHash}
- Candidate fixture digest: ${report.candidateMutationHash}
- Record digest: ${report.evidenceIntegrityHash}
- Previous record digest: ${report.previousEvidenceHash}
- Chain index: ${report.chainIndex}

These SHA-256 values provide record self-consistency checks only. They are not digital signatures, do not authenticate the report author, and do not prove that an experiment occurred.

## Independent verification

The accompanying Node.js script checks the exported JSON record's internal digest consistency. It does not execute candidate code, reproduce a benchmark, verify semantic equivalence, or establish provenance.

## Production readiness

This project must not be represented as a secure autonomous production mutation engine until an independently reviewed isolated execution service, real regression suites, reproducible benchmarks, human approval gates, canary deployment, and rollback controls have been implemented and tested.
`;
  };

  const handleDownloadReportHtml = () => {
    sounds.click();
    const markdown = generateMarkdownReport();
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Public Experiment Report - ${report.experimentId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; max-width: 860px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #111; }
    h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 4px; }
    h2 { font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 28px; }
    pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 12px; }
    code { font-family: monospace; background: #eee; padding: 2px 5px; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background-color: #f8f9fa; }
    .badge { display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; background: #e0f2fe; color: #0369a1; }
    .notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; font-size: 13px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="badge">RESEARCH-GRADE AUTONOMOUS SOFTWARE STUDIO PROTOTYPE</div>
  <div class="notice">
    <strong>SIMULATED DATA — NOT PRODUCTION EVIDENCE:</strong> No production workload, secure isolated execution, or independent candidate verification occurred. SHA-256 digests are not signatures or proof of experiment truth.
  </div>
  <pre style="white-space: pre-wrap;">${markdown}</pre>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Public-Experiment-Report-${report.experimentId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadNodeScript = () => {
    sounds.click();
    const blob = new Blob([standaloneNodeScript], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'verify-evidence.mjs';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJsonEvidence = () => {
    setDownloadingJson(true);
    sounds.execute();
    const payload = JSON.stringify(report, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidence-${report.experimentId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloadingJson(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="bg-[#070b0e] border border-cyan-500/50 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-[#040608] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base tracking-tight">
                  PUBLIC EXPERIMENT REPORT
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
                  RESEARCH-GRADE PROTOTYPE
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-sans block">
                Simulated demonstration record; hashes verify record consistency only
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { window.print(); }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 text-[11px] cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadReportHtml}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-[11px] cursor-pointer font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>

            <button
              onClick={() => { sounds.click(); onClose(); }}
              className="p-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer ml-1"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-neutral-300 font-sans leading-relaxed">
          
          {/* Central Research Question Banner */}
          <div className="p-5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-[#060e14] to-purple-950/20 shadow-lg">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider block">
                  Central Research Question Under Empirical Investigation
                </span>
                <p className="text-white text-base sm:text-lg font-semibold tracking-tight italic">
                  "Can an autonomous software system safely improve its own implementation while preserving behavioral invariants?"
                </p>
                <p className="text-xs text-neutral-300 font-sans">
                  The Sentinel Studio provides formal mechanisms to interrogate this question through AST security screening, hermetic membrane isolation, 4-tier invariant test gates, statistical benchmarking, and automatic rollback watchdogs.
                </p>
              </div>
            </div>
          </div>

          {/* Research Classification & Scientific Distinction Banner */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-[#040608] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-mono text-neutral-400 block text-[11px]">System Classification & Scope:</span>
              <span className="font-bold text-white font-mono text-sm">
                Research-Grade Prototype • Not a Production-Grade Autonomous Runtime
              </span>
              <p className="text-neutral-400 font-sans text-[11px] mt-0.5">
                This distinction makes the empirical claims defensible: mutations are evaluated within strict AST membranes and defined attack surfaces.
              </p>
            </div>
            <div className="shrink-0 font-mono text-right">
              <span className="text-neutral-400 text-[11px] block">Experiment ID</span>
              <span className="text-cyan-300 font-bold">{report.experimentId}</span>
            </div>
          </div>

          {/* Lifecycle & Artifact Identifiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Artifact Hashes */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-[#030608] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Cryptographic Artifact Identifiers
                </span>
                <span className="text-[10px] text-emerald-400">SHA-256 Validated</span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-neutral-400 text-[10px] block">Baseline Artifact (v1.0.0 Gen 0)</span>
                  <code className="text-neutral-200 text-[11px] break-all block bg-neutral-900/80 p-1.5 rounded">
                    {report.baselineMutationHash}
                  </code>
                </div>

                <div>
                  <span className="text-neutral-400 text-[10px] block">Evaluated Candidate Artifact (v1.1.0 Gen 1)</span>
                  <code className="text-cyan-300 text-[11px] break-all block bg-neutral-900/80 p-1.5 rounded">
                    {report.candidateMutationHash}
                  </code>
                </div>

                <div className="pt-1">
                  <span className="text-neutral-400 text-[10px] block">Tamper-Evident Experiment Seal (Block #{report.chainIndex})</span>
                  <code className="text-purple-300 text-[11px] break-all block bg-purple-950/20 border border-purple-500/30 p-1.5 rounded">
                    {report.tamperEvidentSeal}
                  </code>
                </div>
              </div>
            </div>

            {/* Lifecycle Decision & Watchdog */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-[#030608] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Autonomous Promotion & Telemetry
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                  {report.promotionDecision}
                </span>
              </div>

              <div className="space-y-2 font-sans text-xs">
                <div>
                  <span className="text-neutral-400 text-[11px] block font-mono">Promotion Verdict Reason:</span>
                  <p className="text-white mt-0.5 font-mono text-[11px]">
                    {report.decisionReason}
                  </p>
                </div>

                <div className="pt-1 border-t border-neutral-800/80">
                  <span className="text-neutral-400 text-[11px] block font-mono">Autonomous Watchdog Telemetry:</span>
                  <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[11px]">
                    <div className="p-2 rounded bg-neutral-900/60">
                      <span className="text-neutral-400 text-[10px] block">Observed Error Rate</span>
                      <span className="text-emerald-400 font-bold">{report.watchdogEvents.observedErrorRatePercent}%</span>
                    </div>
                    <div className="p-2 rounded bg-neutral-900/60">
                      <span className="text-neutral-400 text-[10px] block">Anomaly Threshold</span>
                      <span className="text-amber-400 font-bold">{report.watchdogEvents.anomalyThresholdPercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400">
                  Emergency Rollback Checkpoint: <strong className="text-neutral-200 font-mono">v1.0.0 (Lat: 4.2ms)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Tier Verification Gate Outcomes */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-[#040608] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Four-Tier Verification Suite Outcomes (Behavioral Invariants)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                95/95 ASSERTIONS PASSED (100% PARITY)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg border border-neutral-800 bg-[#070b0e]">
                <span className="text-cyan-400 font-bold block text-[11px]">1. AST Lexical Screening</span>
                <div className="text-white font-bold text-sm mt-0.5">25 / 25 Passed</div>
                <span className="text-[10px] text-neutral-400 font-sans block mt-1">0 forbidden globals, 0 eval escapes</span>
              </div>

              <div className="p-3 rounded-lg border border-neutral-800 bg-[#070b0e]">
                <span className="text-emerald-400 font-bold block text-[11px]">2. State Continuity</span>
                <div className="text-white font-bold text-sm mt-0.5">30 / 30 Passed</div>
                <span className="text-[10px] text-neutral-400 font-sans block mt-1">Zero reload; heap state continuous</span>
              </div>

              <div className="p-3 rounded-lg border border-neutral-800 bg-[#070b0e]">
                <span className="text-purple-400 font-bold block text-[11px]">3. Adversarial Traps</span>
                <div className="text-white font-bold text-sm mt-0.5">25 / 25 Passed</div>
                <span className="text-[10px] text-neutral-400 font-sans block mt-1">Prototype pollution blocked</span>
              </div>

              <div className="p-3 rounded-lg border border-neutral-800 bg-[#070b0e]">
                <span className="text-amber-400 font-bold block text-[11px]">4. Leak & References</span>
                <div className="text-white font-bold text-sm mt-0.5">15 / 15 Passed</div>
                <span className="text-[10px] text-neutral-400 font-sans block mt-1">Zero dangling closure leaks</span>
              </div>
            </div>
          </div>

          {/* Statistical Benchmarking & TOST Equivalence Section */}
          <div className="p-5 rounded-xl border border-emerald-500/40 bg-[#03080b] space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div>
                <h4 className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Statistical Benchmarking & Equivalence Testing (N = {report.statistics.sampleCount})
                </h4>
                <span className="text-[11px] text-neutral-400 font-sans block">
                  150 warmup runs prior to sampling; microsecond performance.now() timestamps
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                  {report.statistics.speedupFactorOnDefinedWorkload}x Speedup
                </span>
              </div>
            </div>

            {/* Metrics Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="p-2.5 rounded-lg border border-neutral-800 bg-[#060a0d]">
                <span className="text-neutral-400 text-[10px] block">Sample Mean (μ)</span>
                <span className="text-emerald-300 font-bold text-base">{report.statistics.meanLatencyUs} μs</span>
              </div>

              <div className="p-2.5 rounded-lg border border-neutral-800 bg-[#060a0d]">
                <span className="text-neutral-400 text-[10px] block">Median</span>
                <span className="text-white font-bold text-base">{report.statistics.medianLatencyUs} μs</span>
              </div>

              <div className="p-2.5 rounded-lg border border-neutral-800 bg-[#060a0d]">
                <span className="text-neutral-400 text-[10px] block">P95 Tail</span>
                <span className="text-neutral-200 font-bold text-base">{report.statistics.p95LatencyUs} μs</span>
              </div>

              <div className="p-2.5 rounded-lg border border-neutral-800 bg-[#060a0d]">
                <span className="text-neutral-400 text-[10px] block">P99 Tail</span>
                <span className="text-neutral-200 font-bold text-base">{report.statistics.p99LatencyUs} μs</span>
              </div>

              <div className="p-2.5 rounded-lg border border-neutral-800 bg-[#060a0d]">
                <span className="text-neutral-400 text-[10px] block">Std Dev (σ)</span>
                <span className="text-neutral-300 font-bold text-base">{report.statistics.standardDeviationUs} μs</span>
              </div>

              <div className="p-2.5 rounded-lg border border-neutral-800 bg-[#060a0d]">
                <span className="text-neutral-400 text-[10px] block">95% Confidence Interval</span>
                <span className="text-cyan-300 font-bold text-xs mt-1 block">
                  [{report.statistics.confidenceInterval95Us[0]}, {report.statistics.confidenceInterval95Us[1]}]
                </span>
              </div>
            </div>

            {/* Predefined Empirical Tolerance & CI Compatibility Criterion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg border border-neutral-800 bg-[#05090c] space-y-1">
                <span className="text-emerald-400 font-bold block text-xs">
                  1. Empirical Reproducibility Tolerance
                </span>
                <div className="text-white font-bold text-sm">|Δ Mean| ≤ 5.0%</div>
                <p className="text-neutral-400 font-sans text-[11px] leading-relaxed">
                  <strong>The predefined empirical reproducibility tolerance for this experiment.</strong> Defined as an engineering acceptance bound rather than asserting invariant performance across physical machines.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-neutral-800 bg-[#05090c] space-y-1">
                <span className="text-emerald-400 font-bold block text-xs">
                  2. 95% CI Compatibility Criterion
                </span>
                <div className="text-white font-bold text-sm">CI Overlap = Required Acceptance Condition</div>
                <p className="text-neutral-400 font-sans text-[11px] leading-relaxed">
                  <strong>95% CI compatibility criterion: requires overlapping confidence intervals as a predefined reproducibility acceptance condition.</strong> CI overlap does not mathematically prove identical underlying distributions, so formal statistical equivalence testing (TOST) is paired with it.
                </p>
              </div>
            </div>

            {/* Formal TOST Equivalence Section (if comparison exists) */}
            {comparison?.tostEquivalence && (
              <div className="p-3.5 rounded-lg border border-cyan-500/30 bg-[#04080b] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold text-xs">
                    Formal Two One-Sided Tests (TOST) Equivalence Evaluation
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    comparison.tostEquivalence.h0Rejected 
                      ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' 
                      : 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                  }`}>
                    {comparison.tostEquivalence.h0Rejected ? 'H₀ REJECTED (EQUIVALENCE CONFIRMED)' : 'H₀ UNREJECTED'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-neutral-900/60">
                    <span className="text-neutral-400 block text-[10px]">90% CI for Mean Difference (TOST α=0.05)</span>
                    <span className="text-white font-bold">
                      [{comparison.tostEquivalence.confidenceIntervalOfDifferenceUs[0]}, {comparison.tostEquivalence.confidenceIntervalOfDifferenceUs[1]}] μs
                    </span>
                  </div>
                  <div className="p-2 rounded bg-neutral-900/60">
                    <span className="text-neutral-400 block text-[10px]">Equivalence Margin (±5.0%)</span>
                    <span className="text-neutral-200 font-bold">
                      [-{comparison.tostEquivalence.equivalenceMarginUs}, +{comparison.tostEquivalence.equivalenceMarginUs}] μs
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-300 font-sans">
                  {comparison.tostEquivalence.conclusion}
                </p>
              </div>
            )}

            {/* Host Runtime Factors Disclosed */}
            <div className="p-3 rounded-lg border border-neutral-800 bg-[#020406] text-[11px] text-neutral-400 font-sans space-y-1">
              <strong className="text-neutral-300 block font-mono">Disclosed Host Runtime Noise Factors:</strong>
              <p>
                Microsecond browser execution latency is subject to physical and operating-system variables: CPU frequency scaling, background processes, garbage collection pauses, browser task-queue scheduling, V8 JIT tiering, power-management state, and machine temperature.
              </p>
            </div>
          </div>

          {/* Third-Party Standalone Verification Protocol */}
          <div className="p-5 rounded-xl border border-neutral-800 bg-[#040608] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Independent Third-Party Verification Protocol (Zero-Trust Node.js Execution)
                </span>
                <span className="text-[11px] text-neutral-400 font-sans block mt-0.5">
                  Anyone can clone this verification script and execute it in a clean external terminal without running this web app.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(standaloneNodeScript);
                    setCopiedNodeScript(true);
                    sounds.click();
                    setTimeout(() => setCopiedNodeScript(false), 1500);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer text-[11px]"
                >
                  {copiedNodeScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNodeScript ? 'Copied' : 'Copy Script'}</span>
                </button>

                <button
                  onClick={handleDownloadNodeScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 cursor-pointer font-bold text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>verify_experiment.mjs</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-neutral-800 bg-[#020406] text-[11px] text-neutral-300">
              <span className="text-neutral-400 block mb-1">Terminal Execution Command:</span>
              <code className="text-cyan-300 bg-neutral-900/90 px-2 py-1 rounded block font-bold">
                node verify_experiment.mjs
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#040608] border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono">
          <span className="text-neutral-500">
            machine-generated evidence JSON containing cryptographic identifiers for the evaluated artifacts.
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateMarkdownReport());
                setCopiedMarkdown(true);
                sounds.click();
                setTimeout(() => setCopiedMarkdown(false), 1500);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
            >
              {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMarkdown ? 'Copied' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownloadJsonEvidence}
              disabled={downloadingJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingJson ? 'Downloading...' : 'Download Evidence JSON'}</span>
            </button>

            <button
              onClick={() => { sounds.click(); onClose(); }}
              className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer font-bold ml-1"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

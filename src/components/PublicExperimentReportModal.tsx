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
                  SIMULATED RESEARCH DEMO
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
        <div className="p-6 overflow-y-auto space-y-5 text-neutral-300 font-sans leading-relaxed">
          <div className="rounded-xl border border-amber-500/50 bg-amber-950/30 p-4 text-amber-100" role="status">
            <strong className="block font-mono text-xs uppercase mb-1">SIMULATED DATA — NOT PRODUCTION EVIDENCE</strong>
            No production workload was measured. No arbitrary candidate was executed in a secure isolated runtime. No candidate was promoted, and no rollback was performed. This report must not be used to certify software or support commercial performance claims.
          </div>

          <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-2">
            <h4 className="font-mono text-white font-bold">Research question</h4>
            <p className="text-sm">Can a software system propose implementation changes while preserving observable behaviour?</p>
            <p className="text-xs text-neutral-400">This interface demonstrates concepts and illustrative lifecycle states. The required isolated execution and independent verification services are not implemented.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div><span className="block text-[10px] text-neutral-500">Evidence mode</span><strong className="text-amber-300">SIMULATED</strong></div>
              <div><span className="block text-[10px] text-neutral-500">Promotion</span><strong className="text-amber-300">NOT PERFORMED</strong></div>
              <div><span className="block text-[10px] text-neutral-500">Runtime security</span><strong className="text-amber-300">NOT EVALUATED</strong></div>
              <div><span className="block text-[10px] text-neutral-500">Test suites recorded</span><strong className="text-white">{report.testResults.totalTests}</strong></div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-3">
            <h4 className="font-mono text-white font-bold">Record integrity identifiers</h4>
            <p className="text-xs text-neutral-400">These hashes are generated for a demonstration record. A matching digest checks internal consistency only; it is not a digital signature, author authentication, or proof that an experiment occurred.</p>
            <div className="space-y-2 text-[11px] font-mono">
              <div><span className="text-neutral-500 block">Baseline fixture digest</span><code className="break-all">{report.baselineMutationHash}</code></div>
              <div><span className="text-neutral-500 block">Candidate fixture digest</span><code className="break-all">{report.candidateMutationHash}</code></div>
              <div><span className="text-neutral-500 block">Record digest</span><code className="break-all">{report.evidenceIntegrityHash}</code></div>
              <div><span className="text-neutral-500 block">Previous record digest</span><code className="break-all">{report.previousEvidenceHash}</code></div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-3">
            <h4 className="font-mono text-white font-bold">Illustrative metrics — not measured</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div><span className="block text-neutral-500">Sample count</span><strong>{report.statistics.sampleCount}</strong></div>
              <div><span className="block text-neutral-500">Mean latency</span><strong>{report.statistics.meanLatencyUs} μs</strong></div>
              <div><span className="block text-neutral-500">P95 latency</span><strong>{report.statistics.p95LatencyUs} μs</strong></div>
              <div><span className="block text-neutral-500">Speedup field</span><strong>{report.statistics.speedupFactorOnDefinedWorkload}×</strong></div>
            </div>
            <p className="text-[11px] text-amber-200">These values are synthetic placeholders from the demonstration generator. They are not benchmark results and must not be quoted as product performance.</p>
            <div className="border-t border-neutral-800 pt-3 text-xs">
              <strong className="text-white block mb-1">Reproduction status</strong>
              <span className="text-amber-300">{comparison?.overallConvergence || 'NOT_EVALUATED'}</span>
              <p className="text-neutral-400 mt-1">The reproduction panel uses fixed illustrative values; it does not independently execute or compare source artefacts.</p>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-3">
            <h4 className="font-mono text-white font-bold flex items-center gap-2"><Terminal className="w-4 h-4 text-cyan-400" /> Offline record self-consistency checker</h4>
            <p className="text-xs text-neutral-400">The script recomputes the SHA-256 digest in an exported JSON record. It does not execute candidate code, reproduce benchmarks, verify semantic equivalence, or establish provenance.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { navigator.clipboard.writeText(standaloneNodeScript); setCopiedNodeScript(true); sounds.click(); setTimeout(() => setCopiedNodeScript(false), 1500); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer text-[11px]">
                {copiedNodeScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNodeScript ? 'Copied' : 'Copy script'}</span>
              </button>
              <button onClick={handleDownloadNodeScript} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 cursor-pointer font-bold text-[11px]">
                <Download className="w-3.5 h-3.5" />
                <span>verify-evidence.mjs</span>
              </button>
            </div>
            <code className="block text-cyan-300 bg-neutral-900/90 px-2 py-2 rounded text-[11px] break-all">node verify-evidence.mjs evidence-report.json</code>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#040608] border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono">
          <span className="text-neutral-500">
            Simulated report. SHA-256 digests are not signed attestations or proof of test execution.
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

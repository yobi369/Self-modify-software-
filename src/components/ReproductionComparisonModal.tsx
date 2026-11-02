import React, { useState } from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Lock, 
  Activity, 
  ShieldCheck, 
  Database,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { ReproductionComparisonReport } from '../types';
import { sounds } from '../audio/soundEffects';

interface ReproductionModalProps {
  comparison: ReproductionComparisonReport | null;
  isOpen: boolean;
  onClose: () => void;
  onReRun: () => void;
  isReRunning: boolean;
  onOpenPublicReport?: () => void;
}

export const ReproductionComparisonModal: React.FC<ReproductionModalProps> = ({
  comparison,
  isOpen,
  onClose,
  onReRun,
  isReRunning,
  onOpenPublicReport
}) => {
  const [copiedComparison, setCopiedComparison] = useState<boolean>(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState<boolean>(false);

  if (!isOpen || !comparison) return null;

  const isConverged = comparison.overallConvergence === 'CONVERGED_WITHIN_TOLERANCES';

  const generateMarkdownReport = () => {
    return `# SIMULATED COMPARISON REPORT

**Evidence mode:** SIMULATED  
**Original demo record:** ${comparison.originalExperimentId}  
**Comparison demo record:** ${comparison.reproductionExperimentId}  
**Status:** NOT EVALUATED

## Scope

Neither source artefact was executed. No independent reproduction, regression suite, runtime security test, or formal statistical equivalence evaluation occurred. The displayed values are synthetic fixtures and must not be used as product performance claims.

## Illustrative values (not measured)

- Original mean: ${comparison.originalMeanUs} μs
- Comparison mean: ${comparison.reproductionMeanUs} μs
- Original P95: ${comparison.originalP95Us} μs
- Comparison P95: ${comparison.reproductionP95Us} μs
- TOST status: ${comparison.tostEquivalence.status}
- TOST conclusion: ${comparison.tostEquivalence.conclusion}

## Record integrity digests

- Original record digest: ${comparison.originalReport.evidenceIntegrityHash}
- Comparison record digest: ${comparison.reproductionReport.evidenceIntegrityHash}
- Parent digest pointer: ${comparison.reproductionReport.previousEvidenceHash}

SHA-256 digests check internal record consistency only. They are not signatures or proof that an experiment occurred.
`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="bg-[#070b0e] border border-emerald-500/50 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-[#040608] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center">
              <GitCompare className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base tracking-tight flex items-center gap-2">
                SIMULATED EXPERIMENT COMPARISON
              </h3>
              <span className="text-[10px] text-neutral-400 font-sans block">
                synthetic demonstration data; no source execution or statistical conclusion
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPublicReport && (
              <button
                onClick={() => { sounds.click(); onOpenPublicReport(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 font-bold cursor-pointer text-[11px]"
                title="View simulated research report"
              >
                <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Public Report</span>
              </button>
            )}

            <button
              onClick={onReRun}
              disabled={isReRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-bold cursor-pointer disabled:opacity-50 text-[11px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReRunning ? 'animate-spin' : ''}`} />
              <span>{isReRunning ? 'Refreshing Demo...' : 'Refresh Simulated Comparison'}</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(comparison, null, 2));
                setCopiedComparison(true);
                sounds.click();
                setTimeout(() => setCopiedComparison(false), 1500);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 cursor-pointer text-[11px]"
            >
              {copiedComparison ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedComparison ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generateMarkdownReport());
                setCopiedMarkdown(true);
                sounds.click();
                setTimeout(() => setCopiedMarkdown(false), 1500);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 cursor-pointer text-[11px]"
            >
              {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCheck className="w-3.5 h-3.5" />}
              <span>{copiedMarkdown ? 'Copied MD' : 'Copy MD'}</span>
            </button>

            <button
              onClick={() => {
                sounds.execute();
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(comparison, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `REPRO_${comparison.reproductionExperimentId}_vs_${comparison.originalExperimentId}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold cursor-pointer text-[11px]"
              title="Download simulated comparison record"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
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
        <div className="p-5 overflow-y-auto space-y-5 text-neutral-300">
          <div className="rounded-xl border border-amber-500/50 bg-amber-950/30 p-4 text-amber-100" role="status">
            <strong className="block font-mono text-xs uppercase mb-1">SIMULATED COMPARISON — NOT A REPRODUCTION RESULT</strong>
            Neither baseline nor candidate source was executed. The values below are synthetic fixtures. No semantic equivalence, security containment, benchmark convergence, or production readiness has been established.
          </div>

          <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-2">
            <h4 className="font-mono font-bold text-white">Comparison status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div><span className="block text-neutral-500">Evidence mode</span><strong className="text-amber-300">SIMULATED</strong></div>
              <div><span className="block text-neutral-500">Reproduction</span><strong className="text-amber-300">NOT EVALUATED</strong></div>
              <div><span className="block text-neutral-500">Test suites executed</span><strong>{comparison.originalTestsTotal + comparison.reproductionTestsTotal}</strong></div>
              <div><span className="block text-neutral-500">Runtime isolation</span><strong className="text-amber-300">NOT AVAILABLE</strong></div>
            </div>
            <p className="text-xs text-neutral-400">{comparison.convergenceExplanation}</p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-3">
            <h4 className="font-mono font-bold text-white">Illustrative records</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-neutral-900 p-3 space-y-1">
                <strong className="text-neutral-200 block">Original demo record</strong>
                <span className="block text-neutral-500">{comparison.originalExperimentId}</span>
                <span className="block break-all text-neutral-300">Fixture digest: {comparison.originalCandidateHash}</span>
                <span className="block text-neutral-400">Synthetic samples: {comparison.originalReport.statistics.sampleCount}</span>
              </div>
              <div className="rounded-lg bg-neutral-900 p-3 space-y-1">
                <strong className="text-neutral-200 block">Comparison demo record</strong>
                <span className="block text-neutral-500">{comparison.reproductionExperimentId}</span>
                <span className="block break-all text-neutral-300">Fixture digest: {comparison.reproductionCandidateHash}</span>
                <span className="block text-neutral-400">Synthetic samples: {comparison.reproductionReport.statistics.sampleCount}</span>
              </div>
            </div>
            <p className="text-xs text-amber-200">Fixture digests identify demonstration strings, not captured source files. Similar digest values do not prove that the same candidate was independently reproduced.</p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-2">
            <h4 className="font-mono font-bold text-white">Illustrative timing values — not measured</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div><span className="block text-neutral-500">Original mean</span><strong>{comparison.originalMeanUs} μs</strong></div>
              <div><span className="block text-neutral-500">Comparison mean</span><strong>{comparison.reproductionMeanUs} μs</strong></div>
              <div><span className="block text-neutral-500">Original P95</span><strong>{comparison.originalP95Us} μs</strong></div>
              <div><span className="block text-neutral-500">Comparison P95</span><strong>{comparison.reproductionP95Us} μs</strong></div>
            </div>
            <p className="text-xs text-amber-200">These figures are generated from fixed synthetic samples. They are not performance measurements and cannot support a speedup or equivalence claim.</p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-2">
            <h4 className="font-mono font-bold text-white">Statistical evaluation</h4>
            <span className="text-amber-300 text-xs font-bold">TOST STATUS: {comparison.tostEquivalence.status}</span>
            <p className="text-xs text-neutral-300">{comparison.tostEquivalence.conclusion}</p>
            <p className="text-xs text-neutral-400">No inferential p-value or equivalence conclusion is issued for synthetic sample data.</p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-2">
            <h4 className="font-mono font-bold text-white">Local record digest links</h4>
            <div className="text-[11px] font-mono space-y-2">
              <div><span className="block text-neutral-500">Original record digest</span><code className="break-all">{comparison.originalReport.evidenceIntegrityHash}</code></div>
              <div><span className="block text-neutral-500">Comparison record digest</span><code className="break-all">{comparison.reproductionReport.evidenceIntegrityHash}</code></div>
              <div><span className="block text-neutral-500">Previous digest pointer</span><code className="break-all">{comparison.reproductionReport.previousEvidenceHash}</code></div>
            </div>
            <p className="text-xs text-neutral-400">The browser keeps this chain in memory. SHA-256 links can detect accidental changes to the current record snapshot, but are not signed, authenticated, durable, or resistant to an attacker who can recompute them.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#040608] border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>Simulated comparison record; no source execution or independent reproduction was performed</span>
          <button
            onClick={() => { sounds.click(); onClose(); }}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer font-bold"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

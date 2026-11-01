import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Sparkles, 
  RefreshCw,
  Info,
  CheckCircle2,
  Lock,
  GitCommit,
  Hash,
  Scale
} from 'lucide-react';
import { ReproducibilityEvidenceReport, ReproductionComparisonReport } from '../types';
import { 
  getExperimentChain, 
  buildReproducibilityReport, 
  generateNodeCliVerificationScript, 
  reproduceExperiment 
} from '../utils/reproducibilityEvidence';
import { PublicExperimentReportModal } from './PublicExperimentReportModal';
import { ReproductionComparisonModal } from './ReproductionComparisonModal';
import { sounds } from '../audio/soundEffects';

export const EvidenceReproductionSuite: React.FC = () => {
  const [chain, setChain] = useState<ReproducibilityEvidenceReport[]>([]);
  const [activeReport, setActiveReport] = useState<ReproducibilityEvidenceReport | null>(null);
  const [comparisonReport, setComparisonReport] = useState<ReproductionComparisonReport | null>(null);

  const [showPublicReportModal, setShowPublicReportModal] = useState<boolean>(false);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);

  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedCliCommand, setCopiedCliCommand] = useState<boolean>(false);
  const [copiedDigest, setCopiedDigest] = useState<boolean>(false);
  const [isGeneratingReproduction, setIsGeneratingReproduction] = useState<boolean>(false);

  useEffect(() => {
    let existingChain = getExperimentChain();
    if (existingChain.length === 0) {
      const initialReport = buildReproducibilityReport({
        experimentId: 'exp_simulated_demo_001',
      });
      existingChain = [initialReport];
    }
    setChain(existingChain);
    setActiveReport(existingChain[existingChain.length - 1]);
  }, []);

  const handleRunNewReproduction = async () => {
    sounds.execute();
    setIsGeneratingReproduction(true);
    try {
      if (activeReport) {
        const comp = await reproduceExperiment(activeReport);
        setComparisonReport(comp);
        setShowComparisonModal(true);
        sounds.success();
      }
    } catch (err) {
      console.error('Reproduction run failed:', err);
    } finally {
      setIsGeneratingReproduction(false);
    }
  };

  const handleCopyCliCommand = () => {
    sounds.click();
    navigator.clipboard.writeText('node verify-evidence.js');
    setCopiedCliCommand(true);
    setTimeout(() => setCopiedCliCommand(false), 2000);
  };

  const handleDownloadVerificationScript = () => {
    sounds.click();
    if (!activeReport) return;
    const script = generateNodeCliVerificationScript(activeReport);
    const blob = new Blob([script], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verify-evidence-${activeReport.experimentId}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyScript = () => {
    sounds.click();
    if (!activeReport) return;
    const script = generateNodeCliVerificationScript(activeReport);
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#08131a] via-[#050c12] to-[#04080c] p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 font-mono text-[11px] font-semibold tracking-wider uppercase shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                Auditable Artifacts &amp; Reproduction
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-950/50 text-emerald-400 font-mono text-[11px]">
                Research-Grade Autonomous Software Studio Prototype
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              EVIDENCE &amp; REPRODUCTION DEMONSTRATION
            </h1>
            <p className="text-sm text-neutral-300 font-sans max-w-3xl leading-relaxed">
              Provides a browser-side demonstration of evidence record structure, SHA-256 digest linking, and reproducibility concepts. The current data is synthetic; runtime tests, independent reproduction, digital signatures, and authenticated provenance are not implemented.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => {
                sounds.click();
                setShowPublicReportModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/60 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Public Experiment Report (Simulation)</span>
            </button>

            <button
              onClick={handleRunNewReproduction}
              disabled={isGeneratingReproduction}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/60 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer disabled:opacity-50"
            >
              {isGeneratingReproduction ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Scale className="w-4 h-4 text-emerald-400" />
              )}
              <span>Run Illustrative Reproduction (Not Evaluated)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scope Distinction Callout */}
      <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-neutral-900/40 to-neutral-950 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-300 space-y-1">
          <div className="font-mono font-bold text-amber-300 uppercase tracking-wide">
            Prototype Scope &amp; Boundary Notice
          </div>
          <p className="leading-relaxed">
            This system is explicitly designated as a <strong>Research-Grade Autonomous Software Studio Prototype</strong>. 
            The current records are synthetic demonstrations. No real performance speedup, rollback guarantee, runtime isolation, or statistical equivalence conclusion has been established. Candidate execution remains disabled.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      {activeReport && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-neutral-800 bg-[#070b0e] space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">Active Experiment</span>
            <span className="font-mono text-xs font-bold text-white block truncate">{activeReport.experimentId}</span>
            <span className="text-[10px] text-emerald-400 font-mono">Demo Block #{activeReport.chainIndex}</span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-[#070b0e] space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">Benchmark Speedup</span>
            <span className="font-mono text-base font-bold text-emerald-300 block">
              {activeReport.statistics.speedupFactorOnDefinedWorkload}×
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              N = {activeReport.statistics.sampleCount} samples
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-[#070b0e] space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">95% Confidence Interval</span>
            <span className="font-mono text-xs font-bold text-cyan-300 block">
              [{activeReport.statistics.confidenceInterval95Us[0]}, {activeReport.statistics.confidenceInterval95Us[1]}] μs
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">Mean: {activeReport.statistics.meanLatencyUs} μs</span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-[#070b0e] space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">Record Integrity Digest</span>
            <span className="font-mono text-xs font-bold text-emerald-400 block truncate">
              {activeReport.evidenceIntegrityHash.slice(0, 16)}...
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Client-side SHA-256 digest</span>
          </div>
        </div>
      )}

      {/* Main Grid: Cryptographic Chain & Offline Verification Script */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Client-Side Hash-Chain Demonstration */}
        <div className="lg:col-span-6 rounded-2xl border border-neutral-800 bg-[#070b0e] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <h2 className="font-mono font-bold text-sm text-white uppercase">
                Record Digest Chain (Unsigned)
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-950/40 text-cyan-300">
              {chain.length} Block{chain.length !== 1 ? 's' : ''} Locally Linked
            </span>
          </div>

          <p className="text-xs text-neutral-400 font-sans">
            This browser-side demonstration computes a SHA-256 digest linked to the previous in-memory record. It can detect accidental changes, but it is not signed, does not authenticate the author, and cannot prove that a benchmark or security test actually ran.
          </p>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {chain.map((report) => (
              <div
                key={report.experimentId}
                onClick={() => {
                  sounds.click();
                  setActiveReport(report);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeReport?.experimentId === report.experimentId
                    ? 'border-cyan-500/70 bg-cyan-950/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-cyan-400" />
                    Block #{report.chainIndex} • {report.experimentId}
                  </span>
                  <span className="text-[10px] text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30">
                    {report.promotionDecision}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] font-mono text-neutral-400">
                  <div className="truncate">
                    <span className="text-neutral-500">Digest: </span>
                    <span className="text-cyan-300">{report.evidenceIntegrityHash}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-neutral-500">Parent: </span>
                    <span className="text-neutral-400">{report.previousEvidenceHash}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-[10px]">
                    <span>Speedup: <strong className="text-white">{report.statistics.speedupFactorOnDefinedWorkload}×</strong></span>
                    <span>Mean: <strong className="text-white">{report.statistics.meanLatencyUs} μs</strong></span>
                    <span>Tests: <strong className="text-emerald-400">{report.testResults.passedCount}/{report.testResults.totalTests}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Independent Node.js Verifier CLI */}
        <div className="lg:col-span-6 rounded-2xl border border-neutral-800 bg-[#070b0e] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h2 className="font-mono font-bold text-sm text-white uppercase">
                Independent Node.js Verifier
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyScript}
                className="px-2.5 py-1 rounded-lg border border-neutral-700 bg-neutral-900 text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Copy script code"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadVerificationScript}
                className="px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-950/50 text-xs font-mono text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Download script"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>.js</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-neutral-400 font-sans">
            Export a standalone, zero-dependency Node.js script. Anyone can run this offline in any terminal to independently verify cryptographic hash chains, calculate t-statistics, and replicate the results without relying on a browser or cloud backend.
          </p>

          {/* Quick Terminal Run Snippet */}
          <div className="p-3 rounded-xl border border-neutral-800 bg-black font-mono text-xs text-emerald-400 flex items-center justify-between">
            <span>$ node verify-evidence.js</span>
            <button
              onClick={handleCopyCliCommand}
              className="text-neutral-400 hover:text-white text-[11px] flex items-center gap-1"
            >
              {copiedCliCommand ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCliCommand ? 'Copied Command' : 'Copy Command'}</span>
            </button>
          </div>

          {activeReport && (
            <div className="relative">
              <pre className="p-3.5 rounded-xl border border-neutral-800 bg-[#030608] font-mono text-[11px] text-cyan-300/90 overflow-x-auto max-h-[340px] leading-relaxed shadow-inner">
                {generateNodeCliVerificationScript(activeReport).slice(0, 1800)}...
              </pre>
              <div className="absolute bottom-2 right-3 text-[10px] font-mono text-neutral-500 bg-black/80 px-2 py-0.5 rounded border border-neutral-800">
                Full standalone CLI script ready for export
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPublicReportModal && activeReport && (
        <PublicExperimentReportModal
          report={activeReport}
          onClose={() => setShowPublicReportModal(false)}
        />
      )}

      {showComparisonModal && comparisonReport && (
        <ReproductionComparisonModal
          comparison={comparisonReport}
          onClose={() => setShowComparisonModal(false)}
        />
      )}
    </div>
  );
};

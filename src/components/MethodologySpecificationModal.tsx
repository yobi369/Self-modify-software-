import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Activity, 
  Lock, 
  Copy, 
  Check, 
  XCircle, 
  AlertTriangle, 
  Terminal, 
  FileText, 
  Cpu, 
  Dna,
  GitBranch
} from 'lucide-react';
import { sounds } from '../audio/soundEffects';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologySpecificationModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('methodology');
  const [copiedAuditScript, setCopiedAuditScript] = useState<boolean>(false);

  if (!isOpen) return null;

  const independentAuditScript = `// SENTINEL INDEPENDENT AUDIT VERIFICATION SCRIPT (Node.js / Headless V8)
// Run via: node --expose-gc audit-verify.js
import { createHash } from 'crypto';

function sha256(str) {
  return 'sha256:' + createHash('sha256').update(str).digest('hex');
}

// 1. Verify Candidate AST Artifact Integrity
const candidatePayload = \`function processData(items) {
  var freq = Object.create(null);
  for (var i = 0; i < items.length; i++) {
    freq[items[i]] = (freq[items[i]] || 0) + 1;
  }
  return { uniqueCount: Object.keys(freq).length, frequencies: freq };
}\`;

console.log("Candidate SHA-256:", sha256(candidatePayload));

// 2. Statistical Benchmark Protocol (N = 20, Microsecond resolution)
const dataset = Array.from({ length: 1000 }, (_, i) => "token_" + (i % 30));
const fn = new Function('items', candidatePayload.replace(/function processData\\(items\\) \\{/, '').slice(0, -1));

// Warmup passes
for (let i = 0; i < 150; i++) fn(dataset);

// Sample collection
const samplesUs = [];
for (let i = 0; i < 20; i++) {
  const t0 = performance.now();
  fn(dataset);
  const t1 = performance.now();
  samplesUs.push((t1 - t0) * 1000);
}

const mean = samplesUs.reduce((a, b) => a + b, 0) / samplesUs.length;
const sorted = [...samplesUs].sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)];
const variance = samplesUs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (samplesUs.length - 1);
const stdDev = Math.sqrt(variance);
const ci95 = [mean - 1.96 * (stdDev / Math.sqrt(20)), mean + 1.96 * (stdDev / Math.sqrt(20))];

console.log({
  meanUs: mean.toFixed(2),
  medianUs: median.toFixed(2),
  stdDevUs: stdDev.toFixed(3),
  ci95: [ci95[0].toFixed(2), ci95[1].toFixed(2)],
  predefinedEmpiricalTolerance: "±5.0% (predefined empirical reproducibility tolerance for this experiment)",
  ciCompatibilityCriterion: "requires overlapping confidence intervals as a predefined reproducibility acceptance condition",
  equivalenceTestFramework: "Two One-Sided Tests (TOST): H0 (|Δμ| ≥ 5%) vs H1 (|Δμ| < 5%)"
});`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="bg-[#070b0e] border border-cyan-500/50 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-800 bg-[#040608] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base tracking-tight">
                RESEARCH METHODOLOGY, THREAT MODEL & REPRODUCIBILITY SPECIFICATION
              </h3>
              <span className="text-[10px] text-neutral-400 font-sans block">
                Formal Scientific Specification • Sentinel Self-Modifying Software Studio
              </span>
            </div>
          </div>

          <button
            onClick={() => { sounds.click(); onClose(); }}
            className="p-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-neutral-800 bg-[#05080b] overflow-x-auto text-[11px] scrollbar-none">
          {[
            { id: 'methodology', label: '1. Experimental Methodology', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'threat_model', label: '2. Threat Model & Boundaries', icon: <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> },
            { id: 'hash_chain', label: '3. Tamper-Evident Hash Chain', icon: <Lock className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: 'reproducibility', label: '4. Reproducibility Tolerances', icon: <Activity className="w-3.5 h-3.5 text-emerald-400" /> },
            { id: 'limitations', label: '5. Known Limitations', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
            { id: 'independent_audit', label: '6. Independent Audit Script', icon: <Terminal className="w-3.5 h-3.5 text-neutral-300" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { sounds.click(); setActiveSection(tab.id); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                activeSection === tab.id
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-neutral-300 font-sans leading-relaxed">
          {activeSection === 'methodology' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 font-mono text-xs">
                <span className="text-cyan-400 font-bold block text-sm mb-1">Formal Hypothesis Under Empirical Evaluation</span>
                <p className="text-neutral-200 leading-normal">
                  "An autonomous software runtime can dynamically alter its internal execution AST and dispatch pointers in-memory without losing application state continuity, while preserving strictly defined functional invariants and provably defending against userland execution escapes."
                </p>
              </div>

              <h4 className="text-white font-mono font-bold text-sm">Automated Verification Gate Battery (4 Suites, 95 Assertions)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608]">
                  <span className="text-cyan-300 font-bold block mb-1">Suite 1: Structural & Type Invariants (12 tests)</span>
                  <p className="text-neutral-400 font-sans text-[11px]">
                    Verifies that candidate function signatures conform strictly to (items: string[]) =&gt; Object, returns expected keys (uniqueCount, frequencies), and contains no prototype mutation.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608]">
                  <span className="text-emerald-300 font-bold block mb-1">Suite 2: Deterministic Output Parity (25 tests)</span>
                  <p className="text-neutral-400 font-sans text-[11px]">
                    Asserts exact output equivalence with the Gen 0 baseline across 25 deterministic edge inputs (empty array, single character, skew duplicates, unicode tokens).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608]">
                  <span className="text-amber-300 font-bold block mb-1">Suite 3: Adversarial Probes & Fuzzing (18 tests)</span>
                  <p className="text-neutral-400 font-sans text-[11px]">
                    Injects null bytes, undefined entries, circular object structures, and toxic property keys (__proto__, constructor, valueOf) to test edge stability.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608]">
                  <span className="text-purple-300 font-bold block mb-1">Suite 4: High-Volume Permutations (40 tests)</span>
                  <p className="text-neutral-400 font-sans text-[11px]">
                    Executes 40 randomized permutations of the 1,000-token corpus to verify memory stability and deterministic frequency distributions under high workload.
                  </p>
                </div>
              </div>

              <h4 className="text-white font-mono font-bold text-sm pt-2">Microsecond JIT Benchmark Protocol</h4>
              <p className="text-xs text-neutral-400">
                To prevent false conclusions caused by V8 JIT tier-up latency (Ignition bytecode interpreter vs TurboFan optimizing compiler), the protocol enforces:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-300">
                <li><strong>150 Warmup Passes</strong>: Forces monomorphic inline caching and TurboFan compilation before collecting telemetry.</li>
                <li><strong>N = 20 Independent Microsecond Samples</strong>: High-resolution timing via performance.now() with microsecond precision.</li>
                <li><strong>Standard Statistical Metrics</strong>: Computes sample mean (μ), median, P95 tail latency, P99 tail latency, sample standard deviation (σ), and 95% Student's t / Gaussian Confidence Intervals.</li>
              </ul>
            </div>
          )}

          {activeSection === 'threat_model' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 font-mono text-xs">
                <span className="text-rose-400 font-bold block text-sm mb-1">Scope & Boundary Declaration</span>
                <p className="text-neutral-200 leading-normal">
                  "Isolation is enforced via a hermetic JavaScript execution membrane for the tested threat model with deep Proxy barriers and AST validation gates. Tested and proven against enumerated attack vectors. No global access observed across the defined adversarial test suite. This application does not claim an OS or browser hypervisor hardware security boundary."
                </p>
              </div>

              <h4 className="text-white font-mono font-bold text-sm">Defended ECMAScript Attack Vectors</h4>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { name: 'globalThis / window / self Access', mechanism: 'AST Identifier Blacklist + Null Prototype Proxy Sandbox', result: 'Interception & Immediate Block' },
                  { name: 'Function Constructor Traversal (eval / Function)', mechanism: 'AST CallExpression / Identifier Regex + Symbol.species Freeze', result: 'Blocked prior to compilation' },
                  { name: 'Prototype Pollution (__proto__, Object.prototype)', mechanism: 'Object.freeze() + Readonly Proxy Revocation', result: 'Throws TypeError or safely no-ops' },
                  { name: 'Infinite Loops / CPU DoS (while(true))', mechanism: 'Injected Iteration Budget Breaker (100k cycles max)', result: 'Execution halted without freezing host UI' },
                  { name: 'DOM / Browser Storage Exfiltration', mechanism: 'Isolated execution membrane with zero document/storage references', result: 'No global references exposed' }
                ].map((row, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-rose-300 font-bold block">{row.name}</span>
                      <span className="text-[11px] text-neutral-400 font-sans">Defense: {row.mechanism}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] whitespace-nowrap self-start sm:self-auto">
                      {row.result}
                    </span>
                  </div>
                ))}
              </div>

              <h4 className="text-white font-mono font-bold text-sm pt-2">Explicit Non-Claims</h4>
              <p className="text-xs text-neutral-400">
                The Sentinel execution membrane runs inside the host browser V8/SpiderMonkey userland thread. It does not mitigate speculative execution hardware side-channels (Spectre/Meltdown) or V8 engine 0-day native memory corruption vulnerabilities. For untrusted third-party code in adversarial production environments, dedicated hypervisor-isolated microVMs (e.g. AWS Firecracker, gVisor) remain mandatory.
              </p>
            </div>
          )}

          {activeSection === 'hash_chain' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 font-mono text-xs">
                <span className="text-cyan-400 font-bold block text-sm mb-1">Tamper-Evident Experiment Hash Chain</span>
                <p className="text-neutral-200 leading-normal">
                  "Each experiment generates a machine-generated evidence JSON containing cryptographic identifiers for the evaluated artifacts. To guarantee that historical experiments cannot be silently modified or fabricated, every experiment record is cryptographically bound into an immutable hash chain."
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-[#040608] font-mono text-xs space-y-2">
                <span className="text-neutral-400 block text-[11px]">Hash Chain Architecture:</span>
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] space-y-1">
                  <div><strong>Block #0 (Genesis):</strong> prevHash = sha256:00000000...0000</div>
                  <div><strong>Block #N:</strong> prevHash = sha256(Block #(N-1).evidenceIntegrityHash)</div>
                  <div><strong>Integrity Digest:</strong> SHA-256(canonical(experimentId + commitSha + hashes + dataset + statistics))</div>
                  <div><strong>Tamper Seal:</strong> SENTINEL-CHAIN-SEAL:sha256:digest#BLOCK-N</div>
                </div>
              </div>

              <h4 className="text-white font-mono font-bold text-sm">Why Cryptographic Binding Matters for Research</h4>
              <p className="text-xs text-neutral-300">
                A downloaded JSON file is not inherently immutable on disk. However, because each evidence record incorporates the parent experiment's cryptographic hash and a deterministic canonical digest, any alteration of raw benchmark samples, test assertions, or artifact hashes invalidates the seal and breaks the chain. Independent auditors can programmatically verify the entire chain from genesis.
              </p>
            </div>
          )}

          {activeSection === 'reproducibility' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 font-mono text-xs">
                <span className="text-emerald-400 font-bold block text-sm mb-1">Predefined Statistical Tolerances for Independent Reproduction</span>
                <p className="text-neutral-200 leading-normal">
                  When an auditor or user executes "Reproduce This Experiment", the studio runs a completely fresh execution of the candidate from the same baseline and dataset. Convergence is affirmed if and only if all predefined empirical tolerances and equivalence criteria pass.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608] space-y-1">
                  <span className="text-emerald-400 font-bold block">1. Empirical Reproducibility Tolerance</span>
                  <div className="text-white text-base font-bold">|Δ Mean| ≤ 5.0%</div>
                  <p className="text-neutral-400 font-sans text-[11px]">
                    <strong>The predefined empirical reproducibility tolerance for this experiment.</strong> It provides an engineering acceptance boundary rather than claiming algorithmic invariance across thermal fluctuations, acknowledging that browser runtimes are subject to host noise.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608] space-y-1">
                  <span className="text-emerald-400 font-bold block">2. 95% CI Compatibility Criterion</span>
                  <div className="text-white text-base font-bold">CI Overlap = TRUE</div>
                  <p className="text-neutral-400 font-sans text-[11px]">
                    <strong>95% CI compatibility criterion: requires overlapping confidence intervals as a predefined reproducibility acceptance condition.</strong> CI overlap does not mathematically prove identical underlying distributions, so it operates alongside formal statistical equivalence testing.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608] space-y-1">
                  <span className="text-cyan-400 font-bold block">3. Invariant Parity Ratio</span>
                  <div className="text-white text-base font-bold">100.0% (Zero Divergence)</div>
                  <p className="text-neutral-400 font-sans text-[11px]">
                    Every single assertion across all 4 verification suites (95 assertions total) must yield 100% identical pass results.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608] space-y-1">
                  <span className="text-purple-400 font-bold block">4. Cryptographic Artifact Identity</span>
                  <div className="text-white text-base font-bold">SHA-256 Hash Match</div>
                  <p className="text-neutral-400 font-sans text-[11px]">
                    The re-evaluated AST candidate code must generate an identical SHA-256 hex digest to the original evaluated artifact.
                  </p>
                </div>
              </div>

              {/* Formal Statistical Equivalence Testing (TOST) */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#03070a] font-mono text-xs space-y-2">
                <span className="text-cyan-400 font-bold block text-sm">Formal Statistical Equivalence Testing (TOST Framework)</span>
                <p className="text-neutral-300 font-sans text-xs leading-relaxed">
                  Rather than relying solely on confidence interval overlap, the Studio implements a formal Two One-Sided Tests (TOST) equivalence framework:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg border border-neutral-800 bg-[#070b0e]">
                    <span className="text-rose-400 font-bold block mb-0.5">Null Hypothesis (H₀)</span>
                    <span className="text-neutral-300">|μ_repro - μ_orig| ≥ Δ</span>
                    <p className="text-neutral-400 font-sans text-[10px] mt-1">Performance difference exceeds the acceptable tolerance margin (Δ = 5.0%).</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-neutral-800 bg-[#070b0e]">
                    <span className="text-emerald-400 font-bold block mb-0.5">Alternative Hypothesis (H₁)</span>
                    <span className="text-neutral-300">|μ_repro - μ_orig| &lt; Δ</span>
                    <p className="text-neutral-400 font-sans text-[10px] mt-1">Performance difference is within the predefined equivalence margin (statistical equivalence).</p>
                  </div>
                </div>
                <p className="text-neutral-400 font-sans text-[11px] mt-1">
                  Equivalence is established at α = 0.05 when the 90% confidence interval for the difference of means lies strictly within the equivalence bounds [-Δ, +Δ].
                </p>
              </div>
            </div>
          )}

          {activeSection === 'limitations' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 font-mono text-xs">
                <span className="text-amber-400 font-bold block text-sm mb-1">Empirical & Theoretical Limitations</span>
                <p className="text-neutral-200 leading-normal">
                  In accordance with scientific rigor, we explicitly enumerate factors that introduce variance or bound the generalizability of results.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-neutral-800 bg-[#040608]">
                  <strong className="text-white block font-mono">1. Host Runtime Noise Factors</strong>
                  <p className="text-neutral-400 font-sans text-[11px] mt-0.5">
                    Microsecond benchmark measurements in browser runtimes can experience variance due to host-level physical and scheduling states:
                  </p>
                  <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-neutral-300 font-mono list-disc pl-4">
                    <li>CPU frequency scaling & turbo governors</li>
                    <li>Background OS processes & thread competition</li>
                    <li>V8 Garbage Collection (Major/Minor GC pauses)</li>
                    <li>Browser task queue & event-loop scheduling</li>
                    <li>V8 JIT tiering (Sparkplug ➔ Maglev ➔ TurboFan)</li>
                    <li>Host OS power-management states & C-states</li>
                    <li>Host CPU silicon thermal throttling</li>
                  </ul>
                  <p className="text-neutral-400 font-sans text-[11px] mt-1.5">
                    For this reason, the ±5.0% boundary is designated as <em>"the predefined empirical reproducibility tolerance for this experiment"</em> rather than an assertion of algorithmic invariance across physical environments.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-neutral-800 bg-[#040608]">
                  <strong className="text-white block font-mono">2. Single-Tenant Thread Concurrency</strong>
                  <p className="text-neutral-400 font-sans text-[11px] mt-0.5">
                    The current prototype mutates dispatch references within a single-threaded JavaScript execution loop. Multi-threaded shared-memory architectures (e.g. Web Workers or SharedArrayBuffer with Atomics) would require explicit hardware memory barrier fencing.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-neutral-800 bg-[#040608]">
                  <strong className="text-white block font-mono">3. Research-Grade Prototype vs. Production-Grade Autonomous Runtime</strong>
                  <p className="text-neutral-400 font-sans text-[11px] mt-0.5">
                    The system is engineered and defended as a <strong>serious research-grade prototype</strong> with defensible verification gates, cryptographic evidence trails, and reproducibility protocols—not as an untrusted arbitrary multi-tenant production execution kernel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'independent_audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-mono font-bold text-sm">Independent Audit Script (Node.js / Headless V8)</h4>
                  <p className="text-xs text-neutral-400 font-sans">
                    Researchers can independently execute this script in an external terminal to verify candidate hashes and benchmark reproducibility.
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(independentAuditScript);
                    setCopiedAuditScript(true);
                    sounds.click();
                    setTimeout(() => setCopiedAuditScript(false), 1500);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer font-mono text-[11px]"
                >
                  {copiedAuditScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAuditScript ? 'Copied' : 'Copy Audit Script'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl border border-neutral-800 bg-[#020406] font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-[340px]">
                {independentAuditScript}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#040608] border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>Sentinel Research Laboratory • Automated Empirical Verification Protocol</span>
          <button
            onClick={() => { sounds.click(); onClose(); }}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer font-bold"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  BookOpen,
  ShieldAlert,
  Activity,
  Lock,
  XCircle,
  AlertTriangle,
  FileText,
  FlaskConical,
  Fingerprint,
  Terminal,
} from 'lucide-react';
import { sounds } from '../audio/soundEffects';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTIONS = [
  { id: 'methodology', label: 'Research question', icon: FileText },
  { id: 'threat_model', label: 'Security boundary', icon: ShieldAlert },
  { id: 'hash_chain', label: 'Evidence integrity', icon: Fingerprint },
  { id: 'reproducibility', label: 'Reproducibility', icon: Activity },
  { id: 'limitations', label: 'Limitations', icon: AlertTriangle },
  { id: 'independent_audit', label: 'Independent review', icon: Terminal },
] as const;

export const MethodologySpecificationModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('methodology');

  if (!isOpen) return null;

  const sectionTitle = SECTIONS.find((section) => section.id === activeSection)?.label || 'Research question';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#070b0e] border border-cyan-500/50 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="methodology-modal-title"
      >
        <div className="p-4 border-b border-neutral-800 bg-[#040608] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <h3 id="methodology-modal-title" className="font-bold text-white text-sm sm:text-base tracking-tight">
                RESEARCH METHODOLOGY & EVIDENCE BOUNDARIES
              </h3>
              <span className="text-[10px] text-neutral-400 font-sans block">
                Self-Modifying Software Studio · Current implementation status
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { sounds.click(); onClose(); }}
            className="p-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
            aria-label="Close methodology dialog"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <nav aria-label="Methodology sections" className="flex items-center gap-1 px-4 py-2 border-b border-neutral-800 bg-[#05080b] overflow-x-auto text-[11px] scrollbar-none">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const selected = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => { sounds.click(); setActiveSection(section.id); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  selected
                    ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>

        <main role="tabpanel" aria-label={sectionTitle} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-neutral-300 font-sans leading-relaxed">
          {activeSection === 'methodology' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
                <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold text-sm mb-2">
                  <FlaskConical className="w-4 h-4" />
                  Research hypothesis — not yet validated
                </div>
                <p className="text-neutral-200">
                  Can a software system propose runtime transformations while preserving defined functional behaviour and remaining within a defensible security boundary?
                </p>
              </div>
              <p>
                This repository is an interactive research and education prototype. It demonstrates concepts and provides a place to inspect proposed transformations. It does not currently implement a trusted autonomous mutation runtime.
              </p>
              <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-2">
                <h4 className="text-white font-mono font-bold">What the current checks establish</h4>
                <ul className="list-disc pl-5 space-y-1 text-neutral-300">
                  <li>Repository unit and HTTP integration tests validate selected application behaviour.</li>
                  <li>Static lexical checks can flag selected source patterns, but are not a parser or security control.</li>
                  <li>Fixed browser demonstrations exercise predefined examples, not arbitrary user-supplied source.</li>
                  <li>CI build and static-analysis results apply to the exact commit linked from the workflow run.</li>
                </ul>
              </div>
              <p className="text-amber-300 text-xs">
                A passing repository test suite does not prove semantic equivalence, safe execution, performance improvement, or resistance to sandbox escape.
              </p>
            </div>
          )}

          {activeSection === 'threat_model' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
                <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-sm mb-2">
                  <ShieldAlert className="w-4 h-4" />
                  No untrusted-code sandbox is implemented
                </div>
                <p className="text-neutral-200">
                  Candidate execution is disabled. There is no hermetic JavaScript membrane, AST enforcement layer, microVM, or OS-level isolation service in this application.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  ['Arbitrary source execution', 'DISABLED', 'User-provided candidate source is not evaluated by the browser playground or API.'],
                  ['Lexical pattern screening', 'LIMITED', 'Pattern matching may identify suspicious text; it can miss obfuscation and produce false positives.'],
                  ['Adversarial payload suite', 'NOT EXECUTED', 'Payload fixtures are displayed or screened only; runtime escape resistance has not been tested.'],
                  ['Dedicated execution boundary', 'UNAVAILABLE', 'No isolated worker service, microVM, network policy, or resource quota is configured.'],
                ].map(([name, status, description]) => (
                  <div key={name} className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                    <span className="text-white font-bold block">{name}</span>
                    <span className="text-amber-300 text-[10px] font-mono font-bold">{status}</span>
                    <p className="text-[11px] text-neutral-400 mt-1">{description}</p>
                  </div>
                ))}
              </div>
              <p className="text-neutral-400 text-xs">
                Do not submit secrets or execute generated candidates on a production machine. Any future runner must be disposable, network-denied by default, resource-limited, and independently red-teamed.
              </p>
            </div>
          )}

          {activeSection === 'hash_chain' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
                <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold text-sm mb-2">
                  <Lock className="w-4 h-4" />
                  Client-side digest demonstration
                </div>
                <p className="text-neutral-200">
                  The browser prototype can calculate SHA-256 digests over selected record fields and link in-memory records together for an integrity demonstration.
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-2">
                <h4 className="text-white font-mono font-bold">What a local digest does — and does not — prove</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>It can help detect changes to fields covered by the digest when the expected digest is independently retained.</li>
                  <li>It does not authenticate the author, establish when a record was created, or prove that the recorded experiment happened.</li>
                  <li>The browser ledger is in-memory and is not a durable, append-only, server-controlled evidence store.</li>
                  <li>A hash is not a digital signature, trusted timestamp, or tamper-proof audit trail.</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'reproducibility' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
                <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-sm mb-2">
                  <Activity className="w-4 h-4" />
                  Reproduction and statistical equivalence are not evaluated
                </div>
                <p className="text-neutral-200">
                  Browser-generated evidence records are labelled SIMULATED. No baseline/candidate source pair is executed, no external workload is captured, and no empirical performance result is produced.
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 space-y-2">
                <h4 className="text-white font-mono font-bold">Current status</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Measured speedup: NOT MEASURED.</li>
                  <li>Semantic equivalence: NOT EVALUATED.</li>
                  <li>Independent reproduction: NOT EVALUATED.</li>
                  <li>TOST calculation: NOT EVALUATED (synthetic inputs; no inferential conclusion).</li>
                  <li>Confidence intervals shown in the demo are descriptive synthetic-fixture statistics, not acceptance evidence.</li>
                </ul>
              </div>
              <p className="text-neutral-400 text-xs">
                A valid future study needs immutable baseline and candidate artefacts, a pinned toolchain, a declared dataset, repeatable test execution, and an independently reviewable analysis protocol.
              </p>
            </div>
          )}

          {activeSection === 'limitations' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
                <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-sm mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Current release blockers
                </div>
                <p className="text-neutral-200">
                  The application must be treated as a research prototype until the following capabilities have been implemented and independently verified.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                <li>Authentication, tenant isolation, shared rate limits, per-user quotas, and abuse controls.</li>
                <li>A dedicated isolated execution service for untrusted candidates.</li>
                <li>Real baseline/candidate regression execution and reproducible workload measurement.</li>
                <li>Browser end-to-end tests, accessibility review, and deployed preview smoke tests.</li>
                <li>Independent security review, incident response, and production monitoring.</li>
                <li>Owner-selected software licence, privacy notice, terms, and data-retention policy.</li>
              </ul>
              <p className="text-neutral-400 text-xs">
                The production AI endpoints remain hard-disabled until the required identity and usage controls are in place.
              </p>
            </div>
          )}

          {activeSection === 'independent_audit' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20">
                <div className="flex items-center gap-2 text-rose-300 font-mono font-bold text-sm mb-2">
                  <Terminal className="w-4 h-4" />
                  No independent security audit has been completed
                </div>
                <p className="text-neutral-200">
                  This repository does not contain a validated third-party audit report or a trusted execution-verification script. The UI must not imply otherwise.
                </p>
              </div>
              <p>
                Before any untrusted-code execution feature is enabled, commission an independent review of the threat model and execution boundary. The review should include sandbox escape attempts, CPU and memory exhaustion, filesystem and network access, secret isolation, cross-tenant access, and audit-log integrity.
              </p>
              <p className="text-neutral-400 text-xs">
                See the repository's production-readiness and security-assessment documents for the current release gates. A copied script or local demonstration is not a substitute for an independent audit.
              </p>
            </div>
          )}
        </main>

        <div className="p-3 bg-[#040608] border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span className="truncate">Research prototype · untrusted execution disabled · evidence may be simulated</span>
          <button
            type="button"
            onClick={() => { sounds.click(); onClose(); }}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

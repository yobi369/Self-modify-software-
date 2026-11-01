import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  Code, 
  Terminal, 
  Layers,
  ArrowRight,
  Info,
  FileCheck,
  Download,
  Lock,
  CheckCircle2,
  Hash
} from 'lucide-react';
import { AiAnalysisResult, AiMutationResult, AuditableMutationRecord } from '../types';
import { sounds } from '../audio/soundEffects';
import { computeSha256 } from '../utils/cryptoSha256';
import { C_CODE_EXAMPLE } from '../data/infographicContent';

const PRESET_SNIPPETS = {
  c_mprotect: {
    label: 'C (mprotect Opcode Patch)',
    lang: 'c',
    code: C_CODE_EXAMPLE,
  },
  x86_trampoline: {
    label: 'x86_64 ASM (Trampoline Detour Hook)',
    lang: 'assembly',
    code: `; Detour Hook: Replace 5 bytes with JMP rel32
mov rax, target_function
mov byte ptr [rax], 0xE9          ; JMP opcode
mov dword ptr [rax + 1], hook_offset ; Relative 32-bit displacement
; Flush instruction cache
clflush [rax]`,
  },
  python_bytecode: {
    label: 'Python (co_code Bytecode Mutation)',
    lang: 'python',
    code: `import types

def secret_logic():
    return "Original Static Logic"

# Mutate code object directly in memory at runtime
original_code = secret_logic.__code__
# Swap bytecodes or replace function object
mutated_code = original_code.replace(
    co_consts=(None, "Mutated Runtime Logic!"),
)
secret_logic.__code__ = mutated_code
print(secret_logic())`,
  },
  js_metaprogramming: {
    label: 'JavaScript (Dynamic JIT Constructor)',
    lang: 'javascript',
    code: `// Dynamic runtime function synthesis
function createAdaptivePipeline(strategy) {
  const op = strategy === 'fast' ? 'a + b' : 'Math.hypot(a, b)';
  return new Function('a', 'b', \`
    "use strict";
    // Synthesized at runtime based on telemetry
    return \${op};
  \`);
}`,
  },
};

interface AiMetamorphicArchitectProps {
  initialCode?: string;
}

export const AiMetamorphicArchitect: React.FC<AiMetamorphicArchitectProps> = ({ initialCode }) => {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESET_SNIPPETS>('c_mprotect');
  const [inputCode, setInputCode] = useState<string>(initialCode || C_CODE_EXAMPLE);
  const [language, setLanguage] = useState<string>('c');
  const [mutationType, setMutationType] = useState<string>('instruction_substitution');

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);

  const [mutating, setMutating] = useState<boolean>(false);
  const [mutationResult, setMutationResult] = useState<AiMutationResult | null>(null);
  const [auditableRecord, setAuditableRecord] = useState<AuditableMutationRecord | null>(null);

  const [copiedOriginal, setCopiedOriginal] = useState<boolean>(false);
  const [copiedMutated, setCopiedMutated] = useState<boolean>(false);
  const [copiedRecord, setCopiedRecord] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectPreset = (key: keyof typeof PRESET_SNIPPETS) => {
    sounds.click();
    setSelectedPreset(key);
    setInputCode(PRESET_SNIPPETS[key].code);
    setLanguage(PRESET_SNIPPETS[key].lang);
    setAnalysisResult(null);
    setMutationResult(null);
    setAuditableRecord(null);
    setErrorMessage(null);
  };

  const generateAuditableRecord = (
    src: string, 
    mut: string, 
    tech: string, 
    analysis: AiAnalysisResult | null, 
    explanation: string
  ): AuditableMutationRecord => {
    const srcHash = computeSha256(src);
    const mutHash = computeSha256(mut);
    const recordId = `rec_mut_${Date.now()}_${srcHash.slice(0, 8)}`;
    const timestamp = new Date().toISOString();
    
    return {
      recordId,
      timestamp,
      sourceCodeHashSha256: `sha256:${srcHash}`,
      mutatedCodeHashSha256: `sha256:${mutHash}`,
      mutationTechnique: tech,
      language,
      behaviorPreserved: false,
      portabilityAudit: {
        cacheCoherencyValidated: false,
        wxDepCompliant: false,
        osConstraints: analysis?.osConstraints || [
          'Linux: mprotect() 4096-byte page boundary alignment',
          'Windows: VirtualProtect() with PAGE_EXECUTE_READWRITE',
          'ARM64/macOS: __builtin___clear_cache() or FlushInstructionCache()',
        ],
        riskLevel: analysis?.riskLevel || 'MEDIUM',
      },
      explanation,
      verifierSignature: 'UNSIGNED — SHA-256 is an integrity digest, not a digital signature.',
    };
  };

  const handleAnalyze = async () => {
    sounds.execute();
    setAnalyzing(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          language,
          focus: 'security, cache coherency, and self-modifying software architecture',
        }),
      });

      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(failure.error || `Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        // If a mutation exists, auto-update auditable record
        if (mutationResult) {
          const rec = generateAuditableRecord(
            inputCode, 
            mutationResult.mutatedCode, 
            mutationType, 
            data.analysis, 
            mutationResult.explanation
          );
          setAuditableRecord(rec);
        }
      } else {
        throw new Error('No analysis data received');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMutate = async () => {
    sounds.memoryWrite();
    setMutating(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/ai/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          language,
          mutationType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (typeof data.mutatedCode !== 'string' || !data.mutatedCode.trim() || data.verificationStatus !== 'NOT_VERIFIED') {
        throw new Error('The provider did not return a valid, explicitly unverified candidate.');
      }
      const mutatedCode = data.mutatedCode;
      const technique = data.technique;
      const explanation = data.explanation;
      // Behavioural equivalence is never inferred from an AI response.
      const behaviorPreserved = false;

      setMutationResult({
        mutatedCode,
        technique,
        explanation,
        behaviorPreserved,
      });

      // Generate the auditable mutation record
      const record = generateAuditableRecord(inputCode, mutatedCode, technique, analysisResult, explanation);
      setAuditableRecord(record);
      sounds.success();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate mutation');
    } finally {
      setMutating(false);
    }
  };

  const handleDownloadRecordJson = () => {
    sounds.click();
    if (!auditableRecord) return;
    const jsonStr = JSON.stringify(auditableRecord, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditable-mutation-record-${auditableRecord.recordId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-emerald-500/30 bg-[#080d10]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              AI Metamorphic Intelligence
            </span>
            <span className="text-xs font-mono text-neutral-400">Provider-Neutral Research Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">
            AI METAMORPHIC ARCHITECT
          </h1>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(Object.keys(PRESET_SNIPPETS) as Array<keyof typeof PRESET_SNIPPETS>).map((key) => (
            <button
              key={key}
              onClick={() => handleSelectPreset(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedPreset === key
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              {PRESET_SNIPPETS[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Stage Capability Workflow Banner */}
      <div className="rounded-xl border border-neutral-800 bg-[#060a0d] p-4">
        <div className="text-[11px] font-mono text-neutral-400 font-semibold mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-white">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            AI Metamorphic Architect Capabilities
          </span>
          <span className="text-emerald-400 font-normal text-[10px]">Deterministic Pipeline</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 font-mono text-xs">
          <div className="p-2.5 rounded-lg border border-emerald-950 bg-emerald-950/20 text-neutral-300 flex items-start gap-2">
            <span className="text-emerald-400 font-bold shrink-0">→</span>
            <div>
              <span className="text-emerald-300 font-bold block text-[11px]">Analyze code</span>
              <span className="text-[10px] text-neutral-400">Deep runtime opcode &amp; AST analysis</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-300 flex items-start gap-2">
            <span className="text-emerald-400 font-bold shrink-0">→</span>
            <div>
              <span className="text-white font-bold block text-[11px]">Identify portability/security issues</span>
              <span className="text-[10px] text-neutral-400">W^X DEP, cache coherency, OS constraints</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-300 flex items-start gap-2">
            <span className="text-emerald-400 font-bold shrink-0">→</span>
            <div>
              <span className="text-cyan-300 font-bold block text-[11px]">Suggest candidate code variants</span>
              <span className="text-[10px] text-neutral-400">Instruction substitution &amp; dead-code jitter</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-300 flex items-start gap-2">
            <span className="text-emerald-400 font-bold shrink-0">→</span>
            <div>
              <span className="text-teal-300 font-bold block text-[11px]">Explain the transformation</span>
              <span className="text-[10px] text-neutral-400">Requires independent semantic and regression testing</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-300 flex items-start gap-2">
            <span className="text-emerald-400 font-bold shrink-0">→</span>
            <div>
              <span className="text-amber-300 font-bold block text-[11px]">Generate an auditable mutation record</span>
              <span className="text-[10px] text-neutral-400">Cryptographic SHA-256 seal &amp; JSON digest</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor & Action Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-emerald-950/80 bg-[#070b0e] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <h2 className="font-mono font-bold text-sm text-white uppercase">
                SOURCE INPUT ({language.toUpperCase()})
              </h2>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(inputCode);
                setCopiedOriginal(true);
                sounds.click();
                setTimeout(() => setCopiedOriginal(false), 2000);
              }}
              className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOriginal ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            rows={14}
            className="w-full rounded-xl border border-neutral-800 bg-[#040608] p-4 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500/60 leading-relaxed resize-none shadow-inner"
            placeholder="Paste C, Assembly, Python, JavaScript, or Rust self-modifying code snippet..."
          />

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-mono font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{analyzing ? 'Analyzing with AI...' : 'Analyze with AI'}</span>
            </button>

            <div className="flex items-center gap-2">
              <select
                value={mutationType}
                onChange={(e) => setMutationType(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 text-emerald-300 text-xs font-mono px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="instruction_substitution">Instruction Substitution</option>
                <option value="dead_code_insertion">Dead Code Jitter</option>
                <option value="dynamic_jit_wrapper">Dynamic JIT Wrapper</option>
                <option value="self_healing_guard">Self-Healing Guard</option>
              </select>

              <button
                onClick={handleMutate}
                disabled={mutating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/50 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer disabled:opacity-50"
              >
                {mutating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>{mutating ? 'Evolving...' : 'Generate Mutation'}</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg border border-rose-500/50 bg-rose-950/40 text-xs font-mono text-rose-300">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Analysis View */}
          {analysisResult ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-[#080d10] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-mono font-bold text-sm text-white uppercase">
                    COMPILER &amp; KERNEL SAFETY AUDIT
                  </h3>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  analysisResult.riskLevel === 'LOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                  analysisResult.riskLevel === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' :
                  'bg-rose-950 text-rose-400 border border-rose-500/40'
                }`}>
                  RISK: {analysisResult.riskLevel}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <span className="text-neutral-500 block text-[10px]">VERDICT</span>
                  <span className="text-emerald-300 font-bold">{analysisResult.verdict}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <span className="text-neutral-500 block text-[10px]">IDENTIFIED MECHANISM</span>
                  <span className="text-white">{analysisResult.mechanism}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <span className="text-neutral-500 block text-[10px]">CACHE COHERENCY FLUSH</span>
                  <span className="text-cyan-300">{analysisResult.cacheCoherency}</span>
                </div>
              </div>

              {analysisResult.osConstraints && analysisResult.osConstraints.length > 0 && (
                <div className="space-y-1 text-xs font-mono">
                  <span className="text-neutral-400 text-[10px] uppercase">OS-Specific Constraints:</span>
                  <ul className="space-y-1">
                    {analysisResult.osConstraints.map((c, i) => (
                      <li key={i} className="text-[11px] text-neutral-300 flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 rounded-lg border border-emerald-900/50 bg-emerald-950/20 text-[11px] text-neutral-300 font-sans leading-relaxed">
                <strong className="text-emerald-300 font-mono">Architect Review: </strong>
                {analysisResult.codeReview}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-800 bg-[#060a0c] p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                <Sparkles className="w-6 h-6 text-emerald-500/40" />
              </div>
              <h3 className="font-mono font-bold text-sm text-neutral-300">Ready for Code Audit</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Click &ldquo;Analyze with AI&rdquo; to evaluate W^X DEP violations, processor instruction cache coherency, and porting hurdles.
              </p>
            </div>
          )}

          {/* Mutated Variant View */}
          {mutationResult && (
            <div className="rounded-2xl border border-cyan-500/30 bg-[#060d10] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-mono font-bold text-sm text-white uppercase">
                    EVOLVED METAMORPHIC VARIANT
                  </h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(mutationResult.mutatedCode);
                    setCopiedMutated(true);
                    sounds.click();
                    setTimeout(() => setCopiedMutated(false), 2000);
                  }}
                  className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedMutated ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMutated ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl border border-neutral-800 bg-black font-mono text-xs text-cyan-300/90 overflow-x-auto max-h-[200px] leading-relaxed shadow-inner">
                {mutationResult.mutatedCode}
              </pre>

              <p className="text-xs text-neutral-400 font-sans">
                <strong className="text-cyan-400 font-mono">Transformation: </strong>
                {mutationResult.explanation}
              </p>
            </div>
          )}

          {/* Auditable Mutation Record */}
          {auditableRecord && (
            <div className="rounded-2xl border border-amber-500/30 bg-[#0c0d08] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <h3 className="font-mono font-bold text-sm text-white uppercase">
                    AUDITABLE MUTATION RECORD
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(auditableRecord, null, 2));
                      setCopiedRecord(true);
                      sounds.click();
                      setTimeout(() => setCopiedRecord(false), 2000);
                    }}
                    className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedRecord ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedRecord ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadRecordJson}
                    className="px-2 py-0.5 rounded border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-amber-400" />
                    <span>.json</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Record ID: <strong className="text-white">{auditableRecord.recordId}</strong></span>
                  <span className="text-amber-400">Equivalence: NOT VERIFIED</span>
                </div>

                <div className="p-2.5 rounded-lg bg-black/60 border border-neutral-800 space-y-1 text-[11px]">
                  <div className="truncate">
                    <span className="text-neutral-500">Source SHA-256: </span>
                    <span className="text-neutral-300">{auditableRecord.sourceCodeHashSha256}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-neutral-500">Mutant SHA-256: </span>
                    <span className="text-cyan-300">{auditableRecord.mutatedCodeHashSha256}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-neutral-500">Signing status: </span>
                    <span className="text-amber-400">{auditableRecord.verifierSignature}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                  <span>Technique: <strong className="text-emerald-300">{auditableRecord.mutationTechnique}</strong></span>
                  <span>W^X Status: <strong className="text-amber-400">Not audited</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

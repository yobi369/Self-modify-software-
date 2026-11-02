import React, { useState } from 'react';
import { 
  PIPELINE_STEPS, 
  MODIFICATION_TYPES, 
  REAL_WORLD_USE_CASES, 
  DETECTION_AND_DEFENSE,
  C_CODE_EXAMPLE,
  PSEUDOCODE_LOOP 
} from '../data/infographicContent';
import { 
  Play, 
  Search, 
  Code2, 
  Edit3, 
  Save, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Sliders,
  Gamepad2,
  ShieldAlert,
  HeartPulse,
  Lock,
  Eye,
  FileCheck,
  Layers,
  Download,
  Dna
} from 'lucide-react';
import { sounds } from '../audio/soundEffects';

interface InfographicViewProps {
  onLoadInSimulator: () => void;
  onOpenAiArchitect: (snippet?: string) => void;
  onOpenAutonomousEngine?: () => void;
}

export const InfographicView: React.FC<InfographicViewProps> = ({ 
  onLoadInSimulator,
  onOpenAiArchitect,
  onOpenAutonomousEngine
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [selectedModType, setSelectedModType] = useState<string>('code_patching');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [downloadedSpec, setDownloadedSpec] = useState<boolean>(false);
  const [highlightedCodeLine, setHighlightedCodeLine] = useState<number | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    sounds.click();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadSpec = () => {
    sounds.click();
    const markdown = `# CREATING SELF-MODIFYING SOFTWARE (SMS)
## Architectural Specification & Engineering Reference
Conceptualized by Tuchii Hunnid 👑

> "The program is both the script and the author. — Code evolves as it executes."

---

### 1. THE FIVE-STAGE EVOLUTION PIPELINE
1. **RUN (Execute Baseline Code)**: Program initializes execution in normal memory space under initial OS page permissions.
2. **INSPECT (Examine Own Code)**: Program reads its own memory, instruction pointers ($RIP), and code segment structures.
3. **DECIDE (Choose How to Modify)**: Internal logic, profiling metrics, or AI models determine optimal mutations.
4. **MODIFY (Rewrite Code in Memory)**: Modifies memory permissions via kernel syscalls (mprotect, VirtualProtect) and writes new opcodes.
5. **CONTINUE (Run the New Code)**: Pipeline resumes execution with newly synthesized instructions.

---

### 2. CORE MODIFICATION ARCHETYPES
- **In-Place Code Patching**: Overwrites existing machine code opcodes directly (e.g. injecting NOPs 0x9090 or detour jumps).
- **Dynamic JIT Generation**: Allocates RW buffer, compiles AST or IR to native machine instructions, seals page to RX, and invokes via function pointer.
- **Data-Driven Code Generation**: Synthesizes logic dynamically based on runtime input streams, configuration rules, or telemetry.
- **Evolutionary / Genetic Code**: Generates algorithmic variations, measures fitness (latency, memory footprint), and keeps winning mutants.
- **Metamorphic Code Generation**: Changes internal binary instruction signatures every run (register permutation, dead code insertion) while preserving exact semantics.

---

### 3. HARDWARE & KERNEL MITIGATION COMPLIANCE (W^X / DEP)
- **Linux**: Requires \`mprotect(page_aligned_addr, size, PROT_READ | PROT_WRITE | PROT_EXEC)\` (4096-byte alignment).
- **Windows**: Requires \`VirtualProtect(lpAddress, dwSize, PAGE_EXECUTE_READWRITE, &flOldProtect)\`.
- **Apple Silicon / macOS**: Requires \`pthread_jit_write_protect_np()\` with \`com.apple.security.cs.allow-jit\` entitlement.
- **CPU Cache Coherency**: On ARM64 / RISC-V, L1-I cache does not snoop L1-D writes. Software MUST call \`__builtin___clear_cache()\` or \`FlushInstructionCache()\` to prevent stale instruction pipeline execution.

---

### 4. CANONICAL C IN-PLACE PATCH IMPLEMENTATION
\`\`\`c
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <unistd.h>

void modify() {
    printf("[*] Running original code...\\n");
    unsigned char *p = (unsigned char*)modify;
    long page_size = sysconf(_SC_PAGESIZE);
    void *page = (void*)((long)p & ~(page_size - 1));

    if (mprotect(page, page_size, PROT_READ | PROT_WRITE | PROT_EXEC) != 0) {
        perror("mprotect failed");
        return;
    }

    // Hotpatch preamble: Replace first two bytes with NOPs (0x90)
    p[0] = 0x90;
    p[1] = 0x90;

    __builtin___clear_cache((char*)p, (char*)p + 2);
    printf("[+] Code modified successfully!\\n");
}

int main() {
    modify(); // First run: performs self-patch
    modify(); // Second run: executes modified instructions directly
    return 0;
}
\`\`\`

---
Exported from Self-Modifying Software Studio
`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Self-Modifying-Software-Architecture-Spec.md';
    link.click();
    URL.revokeObjectURL(url);
    setDownloadedSpec(true);
    setTimeout(() => setDownloadedSpec(false), 2500);
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return <Search className="w-5 h-5 text-emerald-400" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'Edit3': return <Edit3 className="w-5 h-5 text-emerald-400" />;
      case 'Save': return <Save className="w-5 h-5 text-emerald-400" />;
      case 'Play': return <Play className="w-5 h-5 text-emerald-400" />;
      default: return <Zap className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getUseCaseIcon = (icon: string) => {
    switch (icon) {
      case 'Rocket': return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'Sliders': return <Sliders className="w-5 h-5 text-cyan-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-purple-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-rose-400" />;
      default: return <Cpu className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getDefenseIcon = (icon: string) => {
    switch (icon) {
      case 'Lock': return <Lock className="w-5 h-5 text-emerald-400" />;
      case 'Eye': return <Eye className="w-5 h-5 text-cyan-400" />;
      case 'FileCheck': return <FileCheck className="w-5 h-5 text-amber-400" />;
      case 'Layers': return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-emerald-400" />;
      default: return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  const codeAnnotations = [
    { line: 6, label: 'Get pointer to our own code', text: 'Cast function address to raw byte pointer (unsigned char*).' },
    { line: 9, label: 'Change memory protection to allow writing', text: 'mprotect() aligns to 4096-byte page boundary and grants PROT_WRITE.' },
    { line: 11, label: 'Overwrite instructions', text: 'Replaces opcode with 0x90 (NOP - No Operation).' },
    { line: 22, label: 'Run again with the new code', text: 'Second invocation executes the modified instructions directly.' },
  ];

  const currentStep = PIPELINE_STEPS.find(s => s.number === selectedStep) || PIPELINE_STEPS[0];
  const currentMod = MODIFICATION_TYPES.find(m => m.id === selectedModType) || MODIFICATION_TYPES[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Poster Header */}
      <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#091512] via-[#070c0f] to-[#05080a] p-6 sm:p-8 overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.08)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-mono tracking-widest uppercase px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                Research and Education Prototype
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                ARCHITECTURE VISUALIZER &amp; GUIDE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-mono font-black tracking-tight text-white leading-tight">
              SELF-MODIFYING SOFTWARE STUDIO &amp; <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200">
                BINARY MUTATION RESEARCH CONCEPTS
              </span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 font-mono leading-relaxed">
              An interactive research and education prototype for exploring software mutation concepts, runtime transformation models, memory architecture, static pattern screening, and simulated evidence. Arbitrary candidate execution is disabled; the interface does not provide a verified sandbox or empirical performance certification.
            </p>

            <div className="p-3.5 rounded-xl border border-emerald-900/60 bg-emerald-950/30 max-w-2xl">
              <p className="text-xs sm:text-sm font-mono text-emerald-300/90 italic">
                &ldquo;The program is both the script and the author. — Code evolves as it executes.&rdquo;
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                sounds.execute();
                onLoadInSimulator();
              }}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Virtual CPU Simulator</span>
            </button>

            {onOpenAutonomousEngine && (
              <button
                onClick={() => {
                  sounds.click();
                  onOpenAutonomousEngine();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 font-mono text-xs transition-colors cursor-pointer"
              >
                <Dna className="w-3.5 h-3.5 text-cyan-400" />
                <span>Metamorphic Mutation Engine</span>
              </button>
            )}

            <button
              onClick={() => {
                sounds.click();
                onOpenAiArchitect(C_CODE_EXAMPLE);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 font-mono text-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Analyze with AI</span>
            </button>

            <button
              onClick={handleDownloadSpec}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{downloadedSpec ? '✓ Spec Downloaded!' : 'Download Spec (.md)'}</span>
            </button>

            <div className="text-right sm:text-left lg:text-right pt-1">
              <span className="text-xs font-mono text-neutral-500">
                Conceptualized by <span className="text-emerald-400 font-semibold">Tuchii Hunnid 👑</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Distinction Callout */}
      <div className="rounded-xl border border-neutral-800 bg-[#060a0d] p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-300 space-y-1">
          <div className="font-mono font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <span>Research-Grade Autonomous Software Studio Prototype</span>
            <span className="text-[10px] text-emerald-400 font-normal border border-emerald-500/30 px-1.5 py-0.2 rounded bg-emerald-950/40">Scoped Claims</span>
          </div>
          <p className="leading-relaxed text-neutral-400">
            This interface is a research and education prototype. It demonstrates fixed browser examples, simulations, and local evidence structures only. It does not provide an execution membrane, verified sandbox, evaluated TOST results, or production rollback controller. Arbitrary candidate execution is disabled and generated evidence may be synthetic.
          </p>
        </div>
      </div>

      {/* Primary 2-Column Grid: What is SMS & Why Build SMS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* What is SMS Card */}
        <div className="lg:col-span-6 rounded-2xl border border-emerald-950/80 bg-[#0a0f12] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-mono font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              What is Self-Modifying Software?
            </h2>
            <span className="text-xs font-mono text-neutral-500">DEFINITION</span>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed font-sans">
            <strong className="text-white font-medium">Self-Modifying Software (SMS)</strong> is a program that can inspect, modify, and rewrite its own instructions or structure at runtime.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-neutral-800/80 bg-neutral-900/40">
              <span className="text-xs font-mono text-emerald-400 block mb-1">Traditional Model</span>
              <span className="text-xs text-neutral-400">Code is static and immutable (W^X locked text segment). Only data changes.</span>
            </div>
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20">
              <span className="text-xs font-mono text-emerald-300 block mb-1">Von Neumann Model</span>
              <span className="text-xs text-neutral-300">Code and data share unified memory address space. Code can edit code.</span>
            </div>
          </div>

          <div className="border-t border-neutral-800/80 pt-3">
            <span className="text-xs font-mono text-neutral-400 uppercase block mb-2">Core Competencies:</span>
            <div className="flex flex-wrap gap-2">
              {['Runtime Code Generation', 'Memory Manipulation', 'Code Patching', 'Metaprogramming', 'Dynamic Rewriting', 'Polymorphism'].map(tech => (
                <span key={tech} className="text-xs font-mono px-2 py-1 rounded bg-emerald-950/40 border border-emerald-900/60 text-emerald-300">
                  • {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Why Build Self-Modifying Software */}
        <div className="lg:col-span-6 rounded-2xl border border-emerald-950/80 bg-[#0a0f12] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-mono font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Why Build Self-Modifying Software?
            </h2>
            <span className="text-xs font-mono text-neutral-500">STRATEGIC VALUE</span>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Adaptability', desc: 'Adjust behavior dynamically based on runtime environment, user input, or hardware load.', color: 'text-emerald-400', border: 'border-emerald-900/40' },
              { title: 'Optimization', desc: 'Improve execution throughput by eliminating dynamic branches and generating specialized JIT machine code.', color: 'text-cyan-400', border: 'border-cyan-900/40' },
              { title: 'Evasion & Obfuscation (Advanced)', desc: 'Mutate execution signatures dynamically to resist reverse-engineering and signature detection.', color: 'text-amber-400', border: 'border-amber-900/40' },
              { title: 'Resilience', desc: 'Auto-detect internal failures, heal corrupted memory, and adapt to survive in volatile environments.', color: 'text-rose-400', border: 'border-rose-900/40' },
              { title: 'Research & Learning', desc: 'Explore the theoretical frontiers of computation, Turing completeness, and emergent software life.', color: 'text-purple-400', border: 'border-purple-900/40' },
            ].map((item) => (
              <div key={item.title} className={`p-2.5 rounded-lg border ${item.border} bg-neutral-900/30 flex items-start gap-3`}>
                <span className={`text-xs font-mono font-bold ${item.color} uppercase min-w-[110px]`}>
                  {item.title}
                </span>
                <span className="text-xs text-neutral-300 leading-normal">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How Self-Modifying Software Works (Interactive 5-Step Pipeline) */}
      <div className="rounded-2xl border border-emerald-500/30 bg-[#080d10] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">Execution Mechanics</span>
            <h2 className="text-xl sm:text-2xl font-mono font-bold text-white">
              HOW SELF-MODIFYING SOFTWARE WORKS
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
            Click any step to inspect hardware-level actions
          </span>
        </div>

        {/* 5-Step Pipeline Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {PIPELINE_STEPS.map((step) => {
            const isSelected = selectedStep === step.number;
            return (
              <button
                key={step.number}
                onClick={() => {
                  sounds.step();
                  setSelectedStep(step.number);
                }}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : 'border-neutral-800 bg-[#0a1014]/80 hover:border-neutral-700 hover:bg-neutral-900/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center justify-center">
                    {getStepIcon(step.iconName)}
                  </div>
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    0{step.number}
                  </span>
                </div>
                <h3 className="font-mono font-bold text-sm text-white">{step.title}</h3>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">{step.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Active Step Hardware Drill-down */}
        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-400 text-black font-bold">
                PHASE 0{currentStep.number}
              </span>
              <span className="font-mono text-sm font-bold text-emerald-300">
                {currentStep.title} — {currentStep.subtitle}
              </span>
            </div>
            <p className="text-sm text-neutral-200">
              {currentStep.description}
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400/90 pt-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Hardware Layer: {currentStep.hardwareLevel}</span>
            </div>
          </div>

          <div className="bg-[#05090c] p-3.5 rounded-lg border border-emerald-900/40 font-mono text-xs space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase block">Code Expression</span>
            <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap">
              {currentStep.techExample}
            </pre>
          </div>
        </div>
      </div>

      {/* Simple Self-Modifying Code Example (C) with Interactive Callouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Code View with Callout triggers */}
        <div className="lg:col-span-7 rounded-2xl border border-emerald-500/30 bg-[#080d11] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="font-mono font-bold text-white text-base">
                SIMPLE SELF-MODIFYING CODE EXAMPLE (C)
              </h2>
            </div>
            <button
              onClick={() => handleCopy(C_CODE_EXAMPLE)}
              className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy C'}</span>
            </button>
          </div>

          <p className="text-xs text-neutral-400 font-sans">
            This routine unprotects its own memory page via <code className="text-emerald-400">mprotect()</code>, overwrites the function preamble with <code className="text-emerald-400">0x90 (NOP)</code>, and re-executes.
          </p>

          {/* Interactive Code Container */}
          <div className="rounded-xl border border-neutral-800 bg-[#05080a] p-4 font-mono text-xs overflow-x-auto">
            {C_CODE_EXAMPLE.split('\n').map((line, idx) => {
              const lineNum = idx + 1;
              const hasAnnotation = codeAnnotations.find(a => a.line === lineNum);
              const isHighlighted = highlightedCodeLine === lineNum;

              return (
                <div 
                  key={lineNum} 
                  onMouseEnter={() => setHighlightedCodeLine(lineNum)}
                  onMouseLeave={() => setHighlightedCodeLine(null)}
                  className={`flex items-center py-0.5 px-2 rounded transition-colors group ${
                    isHighlighted ? 'bg-emerald-950/80 text-emerald-200' : 'hover:bg-neutral-900/60'
                  }`}
                >
                  <span className="w-8 text-neutral-600 select-none text-[11px]">
                    {String(lineNum).padStart(2, '0')}
                  </span>
                  <span className={`flex-1 ${
                    line.trim().startsWith('//') || line.trim().startsWith('/*')
                      ? 'text-neutral-500 italic'
                      : line.includes('mprotect') || line.includes('0x90')
                      ? 'text-emerald-300 font-semibold'
                      : 'text-neutral-200'
                  }`}>
                    {line}
                  </span>
                  {hasAnnotation && (
                    <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-medium ml-2">
                      {hasAnnotation.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono text-neutral-400">
            <span className="text-amber-400/90 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Note: Requires executable memory permissions (mprotect / PROT_EXEC)
            </span>
            <button
              onClick={() => {
                sounds.execute();
                onLoadInSimulator();
              }}
              className="text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1"
            >
              Step-by-step in Simulator <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Code Annotations & The Self-Modification Cycle Loop */}
        <div className="lg:col-span-5 space-y-6">
          {/* Callouts Box */}
          <div className="rounded-2xl border border-emerald-950/80 bg-[#0a0f12] p-5 space-y-3">
            <h3 className="font-mono font-bold text-xs uppercase text-emerald-400 tracking-wider">
              Anatomy of the Self-Modification Routine
            </h3>
            <div className="space-y-2.5">
              {codeAnnotations.map(ann => (
                <div 
                  key={ann.line}
                  onMouseEnter={() => setHighlightedCodeLine(ann.line)}
                  onMouseLeave={() => setHighlightedCodeLine(null)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    highlightedCodeLine === ann.line
                      ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'border-neutral-800/80 bg-neutral-900/30 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-emerald-300 font-bold">{ann.label}</span>
                    <span className="text-neutral-500">Line {ann.line}</span>
                  </div>
                  <p className="text-xs text-neutral-400">{ann.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Minimal Self-Modifying Concept Pseudocode */}
          <div className="rounded-2xl border border-emerald-950/80 bg-[#0a0f12] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-bold text-xs uppercase text-emerald-400 tracking-wider">
                Minimal SMS Engine (Pseudocode)
              </h3>
              <span className="text-[10px] font-mono text-neutral-500">ABSTRACT ALGORITHM</span>
            </div>
            <pre className="p-3.5 rounded-xl border border-neutral-800 bg-[#05080a] text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
              {PSEUDOCODE_LOOP}
            </pre>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-1">
              <span>Formula: Observe → Decide → Modify → Persist → Evolve</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Self-Modification Cycle Interactive Graphic */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-[#08110e] via-[#060a0d] to-[#08110e] p-6 space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Continuous Evolution</span>
          <h2 className="text-xl font-mono font-bold text-white">THE SELF-MODIFICATION CYCLE</h2>
          <p className="text-xs text-neutral-400">
            A software system in continuous closed-loop feedback with its executing instructions
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {[
            { phase: 'ANALYZE', action: 'Inspect current state & environment', icon: <Search className="w-4 h-4 text-emerald-400" /> },
            { phase: 'MODIFY', action: 'Alter code, logic, or byte instructions', icon: <Edit3 className="w-4 h-4 text-cyan-400" /> },
            { phase: 'WRITE', action: 'Commit changes back to virtual memory', icon: <Save className="w-4 h-4 text-amber-400" /> },
            { phase: 'EXECUTE', action: 'Branch to and execute modified payload', icon: <Play className="w-4 h-4 text-emerald-400" /> },
          ].map((item, idx) => (
            <div key={item.phase} className="p-4 rounded-xl border border-emerald-950 bg-neutral-900/40 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="text-xs font-mono text-neutral-500">0{idx + 1}</span>
              </div>
              <h3 className="font-mono font-bold text-sm text-white">{item.phase}</h3>
              <p className="text-xs text-neutral-400 mt-1">{item.action}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-xs font-mono text-emerald-300">
            <span>Observe</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>Decide</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>Modify</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>Persist</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-400 font-bold">Evolve</span>
          </div>
        </div>
      </div>

      {/* Types of Self-Modification (Interactive Selector) */}
      <div className="rounded-2xl border border-emerald-500/30 bg-[#080d10] p-6 space-y-6">
        <div>
          <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">Classification</span>
          <h2 className="text-xl font-mono font-bold text-white">TYPES OF SELF-MODIFICATION</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Five core architectural categories ranging from constant tuning to polymorphic metamorphic engines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {MODIFICATION_TYPES.map((type) => {
            const isSelected = selectedModType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => {
                  sounds.click();
                  setSelectedModType(type.id);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-emerald-400 bg-emerald-950/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {type.badge}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </div>
                <h3 className="font-mono font-bold text-xs text-white leading-tight">{type.name}</h3>
              </button>
            );
          })}
        </div>

        {/* Selected Type Detailed Breakdown */}
        <div className="p-5 rounded-xl border border-emerald-900/60 bg-[#060a0c] grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-white">{currentMod.name}</span>
              <span className="text-xs font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-950/40">
                {currentMod.badge}
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {currentMod.description}
            </p>
            <div className="space-y-1.5 text-xs font-mono pt-1">
              <div><strong className="text-emerald-400">Mechanism:</strong> <span className="text-neutral-400">{currentMod.mechanism}</span></div>
              <div><strong className="text-cyan-400">Real Use-Case:</strong> <span className="text-neutral-400">{currentMod.useCase}</span></div>
              <div><strong className="text-amber-400">Security Risk:</strong> <span className="text-neutral-400">{currentMod.risk}</span></div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#030608] p-3.5 rounded-lg border border-neutral-800 font-mono text-xs">
            <div className="flex items-center justify-between mb-2 text-neutral-400">
              <span>Code Implementation</span>
              <button 
                onClick={() => handleCopy(currentMod.codeSnippet)}
                className="hover:text-white"
                title="Copy snippet"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <pre className="text-emerald-300/90 text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
              {currentMod.codeSnippet}
            </pre>
          </div>
        </div>
      </div>

      {/* Real-World Use Cases & Detection / Defense Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-World Use Cases */}
        <div className="lg:col-span-6 rounded-2xl border border-emerald-950/80 bg-[#080d10] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-mono font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Real-World Use Cases
            </h2>
            <span className="text-xs font-mono text-neutral-500">APPLICATIONS</span>
          </div>

          <div className="space-y-3">
            {REAL_WORLD_USE_CASES.map((uc) => (
              <div key={uc.title} className="p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-neutral-800 flex items-center justify-center">
                      {getUseCaseIcon(uc.icon)}
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-xs text-white">{uc.title}</h3>
                      <span className="text-[10px] font-mono text-neutral-400">{uc.subtitle}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-neutral-300">{uc.description}</p>
                <ul className="text-[11px] text-neutral-400 space-y-1 list-disc list-inside">
                  {uc.deepDive.slice(0, 2).map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Detection & Defense (W^X, Sandboxing, Integrity) */}
        <div className="lg:col-span-6 rounded-2xl border border-emerald-950/80 bg-[#080d10] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-mono font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Detection & Defense
            </h2>
            <span className="text-xs font-mono text-neutral-500">OS MITIGATIONS</span>
          </div>

          <div className="space-y-3">
            {DETECTION_AND_DEFENSE.map((def) => (
              <div key={def.title} className="p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-900/30 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-neutral-800 flex items-center justify-center">
                    {getDefenseIcon(def.icon)}
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-xs text-white">{def.title}</h3>
                    <span className="text-[10px] font-mono text-neutral-400">{def.subtitle}</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300">{def.description}</p>
                <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800 text-[11px] font-mono text-emerald-400/90">
                  <strong className="text-white font-medium">Mitigation: </strong>
                  {def.bypassMitigation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety & Ethics Banner (Direct from poster) */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-[#091813] via-[#081014] to-[#091813] p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="font-mono font-bold text-lg text-white">SAFETY, ETHICS & BEST PRACTICES</h2>
            </div>
            <p className="text-xs text-emerald-200/80">
              Writing self-modifying code requires strict isolation, fail-safes, and ethical boundaries.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300 text-center sm:text-right">
            <span>&gt; Powerful code comes with responsibility.</span> <br />
            <strong className="text-emerald-400">Ethics is the real upgrade.</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {[
            { label: 'Controlled Environments', desc: 'Always test in sandboxed virtual machines or isolated process spaces.' },
            { label: 'Never Touch Critical Systems', desc: 'Do not mutate kernel dispatch tables or life-critical software loops.' },
            { label: 'Deterministic Fail-Safes', desc: 'Maintain pristine uncompressed backups of original machine instructions.' },
            { label: 'Strict Versioning & Logs', desc: 'Log each generation of evolved code with cryptographic hashes.' },
          ].map(rule => (
            <div key={rule.label} className="p-3 rounded-lg border border-emerald-900/40 bg-neutral-950/50">
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold mb-1">
                <Check className="w-3.5 h-3.5" />
                <span>{rule.label}</span>
              </div>
              <p className="text-[11px] text-neutral-400">{rule.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-950 bg-[#04080a] text-center font-mono text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-center gap-4">
          <span className="text-emerald-400 font-bold">// Good engineers build smart.</span>
          <span className="text-cyan-400 font-bold">// Great engineers build safe.</span>
          <span className="text-emerald-300 font-bold">// Elite engineers build ethical.</span>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="text-center py-4 space-y-2 border-t border-emerald-950/60">
        <p className="text-sm font-mono tracking-wider font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          WRITE CODE THAT LEARNS. BUILD SOFTWARE THAT EVOLVES.
        </p>
        <p className="text-xs font-mono text-neutral-500">
          Created as an interactive engineering masterclass • Inspired by Tuchii Hunnid
        </p>
      </div>
    </div>
  );
};

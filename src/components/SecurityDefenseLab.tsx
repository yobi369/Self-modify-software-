import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Cpu, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { sounds } from '../audio/soundEffects';

export const SecurityDefenseLab: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<'naive_violation' | 'rwx_escalation' | 'wx_safe_toggle' | 'dual_mapped'>('wx_safe_toggle');
  const [cacheFlushActive, setCacheFlushActive] = useState<boolean>(true);
  const [simulatedExecutionResult, setSimulatedExecutionResult] = useState<string | null>(null);

  const testExecution = (pattern: string) => {
    sounds.click();
    if (pattern === 'naive_violation') {
      sounds.permissionChange();
      setSimulatedExecutionResult('KERNEL CRASH: SIGSEGV (Segmentation Fault: Memory page is R-X, Write denied by CPU MMU).');
    } else if (pattern === 'rwx_escalation') {
      sounds.step();
      setSimulatedExecutionResult('EXECUTION WARNING: Page granted RWX. Detected by EDR Heuristic Analyzer. Blocked on macOS hardened runtime.');
    } else if (pattern === 'wx_safe_toggle') {
      sounds.execute();
      setSimulatedExecutionResult(cacheFlushActive 
        ? 'EXECUTION SUCCESS: Alloc RW -> Emit opcodes -> mprotect to R-X -> Cache Flushed -> Clean JIT execution with 0 security alerts.' 
        : 'PIPELINE CRASH: Stale Instruction Cache! L1-I cache fetched old cached opcodes before L1-D was flushed.');
    } else if (pattern === 'dual_mapped') {
      sounds.execute();
      setSimulatedExecutionResult('ENTERPRISE JIT SUCCESS: Dual-mapped virtual addresses (Writable Mirror 0x7FFF1000 + Executable Mirror 0x00401000) sharing identical physical memory. Zero syscall overhead.');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs text-amber-100" role="status">
        <strong className="block mb-1 uppercase tracking-wide">Educational simulation only</strong>
        These scenarios display illustrative outcomes. They do not call operating-system memory APIs, execute native machine code, inspect CPU page tables, or test real kernel/MMU enforcement.
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-emerald-500/30 bg-[#080d10]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
              OS & HARDWARE CONCEPT SIMULATOR
            </span>
            <span className="text-xs font-mono text-neutral-400">ILLUSTRATIVE DEFENSE LAB</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">
            W^X SECURITY &amp; DEFENSE LAB
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400 border border-neutral-800 bg-neutral-900 px-3 py-1.5 rounded-xl">
            Concept: <strong className="text-emerald-400">NX / XD No-Execute</strong>
          </span>
        </div>
      </div>

      {/* Primary Comparison: 4 Memory Strategies */}
      <div className="rounded-2xl border border-emerald-950/80 bg-[#070b0e] p-6 space-y-6">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Comparative Architecture</span>
          <h2 className="text-lg font-mono font-bold text-white">
            FOUR APPROACHES TO RUNTIME CODE MODIFICATION
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Select a strategy to view an illustrative explanation of memory-permission concepts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { id: 'naive_violation', title: '1. Direct Write to R-X', badge: 'CRITICAL HAZARD', color: 'border-rose-500/40' },
            { id: 'rwx_escalation', title: '2. RWX Escalation', badge: 'DEPRECATED / RISKY', color: 'border-amber-500/40' },
            { id: 'wx_safe_toggle', title: '3. W^X Compliant Toggle', badge: 'RECOMMENDED', color: 'border-emerald-500/50' },
            { id: 'dual_mapped', title: '4. Dual-Mapped Memory', badge: 'ENTERPRISE JIT', color: 'border-cyan-500/50' },
          ].map((item) => {
            const isSelected = selectedPattern === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedPattern(item.id as any);
                  setSimulatedExecutionResult(null);
                  sounds.click();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? `${item.color} bg-neutral-900/80 shadow-[0_0_12px_rgba(16,185,129,0.15)]`
                    : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-700'
                }`}
              >
                <span className="text-[10px] font-mono text-neutral-400 block mb-1">{item.badge}</span>
                <h3 className="font-mono font-bold text-xs text-white">{item.title}</h3>
              </button>
            );
          })}
        </div>

        {/* Selected Strategy Deep Dive */}
        <div className="p-5 rounded-xl border border-neutral-800 bg-[#040608] space-y-4 font-mono text-xs">
          {selectedPattern === 'naive_violation' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <XCircle className="w-4 h-4" />
                <span>Approach 1: Direct In-Place Write to Executable Memory</span>
              </div>
              <p className="text-neutral-300 font-sans">
                Attempts to overwrite <code className="text-white">p[0] = 0x90</code> without calling <code className="text-emerald-400">mprotect()</code>. The code page was marked by the ELF loader as <code className="text-rose-300">PROT_READ | PROT_EXEC</code> (No write permission).
              </p>
              <pre className="p-3 rounded-lg bg-black border border-neutral-850 text-rose-300 overflow-x-auto">
{`void *p = (void*)my_func;
// VIOLATION: Writing to non-writable memory!
*(unsigned char*)p = 0x90; // ---> Hardware Trap: #PF (Page Fault) -> SIGSEGV`}
              </pre>
            </div>
          )}

          {selectedPattern === 'rwx_escalation' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Approach 2: Full RWX (Read + Write + Execute) Page Escalation</span>
              </div>
              <p className="text-neutral-300 font-sans">
                Calls <code className="text-white">mprotect(page, 4096, PROT_READ|PROT_WRITE|PROT_EXEC)</code>. While functional on older x86 Linux, this violates modern security policies (DEP / W^X). Modern systems and EDRs monitor RWX pages as high-severity anomalies.
              </p>
              <pre className="p-3 rounded-lg bg-black border border-neutral-850 text-amber-300 overflow-x-auto">
{`mprotect(page, 4096, PROT_READ | PROT_WRITE | PROT_EXEC);
// Page is now simultaneously Writable and Executable (W^X Broken)
p[0] = 0x90;`}
              </pre>
            </div>
          )}

          {selectedPattern === 'wx_safe_toggle' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Approach 3: Modern W^X Compliant State Machine (Standard JIT)</span>
              </div>
              <p className="text-neutral-300 font-sans">
                Strict adherence to W^X: Memory is NEVER both writable and executable at the same moment. It is allocated as <code className="text-emerald-300">RW-</code> during emission, then transitioned to <code className="text-cyan-300">R-X</code> before execution, followed by an explicit instruction cache flush.
              </p>
              <pre className="p-3 rounded-lg bg-black border border-neutral-850 text-emerald-300 overflow-x-auto">
{`// 1. Allocate as Writable (RW-)
void *buf = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_ANON | MAP_PRIVATE, -1, 0);
emit_opcodes(buf); // Write machine code safely

// 2. Transition from RW- to R-X (Remove Write permission, grant Executable)
mprotect(buf, 4096, PROT_READ | PROT_EXEC);

// 3. Mandatory Hardware I-Cache Flush
__builtin___clear_cache((char*)buf, (char*)buf + 4096);

// 4. Branch to execute
((void(*)())buf)();`}
              </pre>
            </div>
          )}

          {selectedPattern === 'dual_mapped' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Approach 4: Dual-Mapped Memory (High-Performance V8 / WebKit Architecture)</span>
              </div>
              <p className="text-neutral-300 font-sans">
                Some JIT runtimes use dual-mapped aliases where the platform permits it: the same backing pages are mapped at separate virtual addresses, one writable and one executable. Availability and enforcement are OS-, architecture-, and policy-dependent.
              </p>
              <pre className="p-3 rounded-lg bg-black border border-neutral-850 text-cyan-300 overflow-x-auto">
{`// Illustrative dual-mapping concept; mapping setup still requires OS operations:
// Write address: 0x7FFF1000 (Mapped as PROT_READ | PROT_WRITE)
// Exec address:  0x00401000 (Mapped as PROT_READ | PROT_EXEC)
// Both aliases refer to the same backing pages. This can avoid repeated permission transitions;
// setup, synchronization, and platform-specific cache maintenance still have costs.`}
              </pre>
            </div>
          )}

          {/* Test Trigger Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800">
            {selectedPattern === 'wx_safe_toggle' && (
              <label className="flex items-center gap-2 text-neutral-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cacheFlushActive}
                  onChange={(e) => setCacheFlushActive(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0"
                />
                <span>Include Hardware Instruction Cache Flush (__builtin___clear_cache)</span>
              </label>
            )}

            <button
              onClick={() => testExecution(selectedPattern)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer ml-auto"
            >
              Simulate Kernel MMU Response
            </button>
          </div>

          {/* Execution Result Box */}
          {simulatedExecutionResult && (
            <div className={`p-3.5 rounded-lg border font-mono text-xs mt-3 ${
              simulatedExecutionResult.startsWith('KERNEL CRASH')
                ? 'border-rose-500/50 bg-rose-950/40 text-rose-300'
                : simulatedExecutionResult.startsWith('EXECUTION WARNING')
                ? 'border-amber-500/50 bg-amber-950/40 text-amber-300'
                : 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
            }`}>
              <strong>Simulated Diagnostic:</strong> {simulatedExecutionResult}
            </div>
          )}
        </div>
      </div>

      {/* Hardware Deep Dive: Split L1 Cache Coherency */}
      <div className="rounded-2xl border border-neutral-800 bg-[#080d10] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <h3 className="font-mono font-bold text-base text-white">
            HARDWARE LEVEL: THE INSTRUCTION CACHE COHERENCY PROBLEM
          </h3>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed font-sans">
          Many modern CPUs have separate instruction and data caches at some levels. The exact coherency model and required synchronization are architecture-specific.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs pt-2">
          <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950">
            <span className="text-emerald-400 font-bold block mb-1">1. The Write Path (L1-D)</span>
            <p className="text-neutral-400 text-[11px]">
              When self-modifying code writes <code className="text-white">p[0] = 0x90</code>, the CPU treats this as ordinary data. The write updates the L1 Data Cache line.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950">
            <span className="text-amber-400 font-bold block mb-1">2. The Prefetch Lag (L1-I)</span>
            <p className="text-neutral-400 text-[11px]">
              Instruction-fetch coherency after code writes varies by architecture. Some systems require explicit cache maintenance and instruction synchronization; do not generalize one cache model to every ARM64 or RISC-V implementation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950">
            <span className="text-cyan-400 font-bold block mb-1">3. The Cache Flush Remedy</span>
            <p className="text-neutral-400 text-[11px]">
              A compiler/runtime-supported cache-maintenance API such as <code className="text-white">__builtin___clear_cache()</code> emits target-specific operations where required. Exact semantics depend on the compiler, CPU, and operating system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

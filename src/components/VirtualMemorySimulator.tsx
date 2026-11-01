import React, { useState, useEffect, useRef } from 'react';
import { CpuState, MemoryByte, SimulationStep } from '../types';
import { SIMULATION_INITIAL_MEMORY } from '../data/infographicContent';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Cpu, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  Layers, 
  Activity, 
  Clock,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { sounds } from '../audio/soundEffects';

const SIMULATION_STEPS: SimulationStep[] = [
  {
    id: 0,
    phase: 'CONTINUE',
    title: 'Process Initialized',
    description: 'OS loader maps executable binary into virtual memory. Code page is set to Read + Execute (R-X). W^X security is active.',
    lineHighlight: 18,
    pagePermissions: 'R-X',
    annotation: 'Binary loaded at 0x00401000 with R-X permissions.',
    cpu: {
      rip: '0x00401120',
      rax: '0x00000000',
      rbx: '0x00000000',
      rcx: '0x00000000',
      rdx: '0x00000000',
      rsp: '0x7FFFFFFFE450',
      rbp: '0x7FFFFFFFE450',
      rdi: '0x00000001',
      rsi: '0x7FFFFFFFE588',
      flags: { zero: false, carry: false, overflow: false },
    },
    consoleOutput: '[$] ./self_modifying_bin\n[*] Running original code...\n',
  },
  {
    id: 1,
    phase: 'INSPECT',
    title: 'Inspect Own Memory Space',
    description: 'main() invokes modify(). The function retrieves its own function pointer: unsigned char *p = (unsigned char*)modify (0x00401000).',
    lineHighlight: 6,
    pagePermissions: 'R-X',
    annotation: 'Pointer p resolves to code entry 0x00401000.',
    cpu: {
      rip: '0x00401000',
      rax: '0x00401000',
      rbx: '0x00000000',
      rcx: '0x00000000',
      rdx: '0x00000000',
      rsp: '0x7FFFFFFFE438',
      rbp: '0x7FFFFFFFE440',
      rdi: '0x00000001',
      rsi: '0x7FFFFFFFE588',
      flags: { zero: false, carry: false, overflow: false },
    },
  },
  {
    id: 2,
    phase: 'ANALYZE',
    title: 'Analyze First Instruction',
    description: 'Evaluates condition: if (p[0] != 0x90). Memory at 0x00401000 currently contains 0x55 (PUSH RBP). Condition is TRUE.',
    lineHighlight: 8,
    pagePermissions: 'R-X',
    annotation: 'Byte at p[0] is 0x55 (not 0x90). Modification required!',
    cpu: {
      rip: '0x00401012',
      rax: '0x00000055',
      rbx: '0x00000000',
      rcx: '0x00000090',
      rdx: '0x00000000',
      rsp: '0x7FFFFFFFE438',
      rbp: '0x7FFFFFFFE440',
      rdi: '0x00401000',
      rsi: '0x00000090',
      flags: { zero: false, carry: false, overflow: false },
    },
  },
  {
    id: 3,
    phase: 'MODIFY',
    title: 'Calculate Page Boundary for mprotect()',
    description: 'Syscall mprotect() requires a page-aligned address: (p & ~(4096-1)) = 0x00401000. Preparing syscall arguments.',
    lineHighlight: 9,
    pagePermissions: 'R-X',
    annotation: 'Target page: 0x00401000 (4096 bytes). Mask: ~(0xFFF)',
    cpu: {
      rip: '0x00401025',
      rax: '0x0000000A', // syscall 10 = sys_mprotect on x86_64
      rbx: '0x00000000',
      rcx: '0x00000000',
      rdx: '0x00000007', // PROT_READ | PROT_WRITE | PROT_EXEC = 7
      rsp: '0x7FFFFFFFE438',
      rbp: '0x7FFFFFFFE440',
      rdi: '0x00401000',
      rsi: '0x00001000', // 4096 bytes
      flags: { zero: true, carry: false, overflow: false },
    },
  },
  {
    id: 4,
    phase: 'WRITE_BACK',
    title: 'Escalate Page Permissions to RWX',
    description: 'Kernel executes sys_mprotect(0x00401000, 4096, PROT_READ|PROT_WRITE|PROT_EXEC). Page table attributes flipped to RWX.',
    lineHighlight: 9,
    pagePermissions: 'RWX',
    annotation: 'Page 0x00401000 is now writable AND executable!',
    cpu: {
      rip: '0x00401032',
      rax: '0x00000000', // Success return code 0
      rbx: '0x00000000',
      rcx: '0x00000000',
      rdx: '0x00000007',
      rsp: '0x7FFFFFFFE438',
      rbp: '0x7FFFFFFFE440',
      rdi: '0x00401000',
      rsi: '0x00001000',
      flags: { zero: true, carry: false, overflow: false },
    },
  },
  {
    id: 5,
    phase: 'WRITE_BACK',
    title: 'Hotpatch Opcodes (Inject NOPs 0x90)',
    description: 'Directly writes 0x90 to p[0] and p[1]. The function preamble (55 48) is surgically converted to two NOP instructions.',
    lineHighlight: 11,
    pagePermissions: 'RWX',
    modifiedAddresses: [0x00401000, 0x00401001],
    annotation: 'p[0] = 0x90 (NOP); p[1] = 0x90 (NOP); Memory patched.',
    cpu: {
      rip: '0x00401040',
      rax: '0x00000090',
      rbx: '0x00000000',
      rcx: '0x00000000',
      rdx: '0x00000000',
      rsp: '0x7FFFFFFFE438',
      rbp: '0x7FFFFFFFE440',
      rdi: '0x00401000',
      rsi: '0x00000090',
      flags: { zero: false, carry: false, overflow: false },
    },
  },
  {
    id: 6,
    phase: 'CONTINUE',
    title: 'First Execution Completes',
    description: 'Function prints confirmation: [+] Code modified successfully! Returns control back to main().',
    lineHighlight: 15,
    pagePermissions: 'RWX',
    modifiedAddresses: [0x00401000, 0x00401001],
    annotation: 'Returning to caller. First pass finished.',
    cpu: {
      rip: '0x00401058',
      rax: '0x00000021',
      rbx: '0x00000000',
      rcx: '0x00000000',
      rdx: '0x00000000',
      rsp: '0x7FFFFFFFE440',
      rbp: '0x7FFFFFFFE450',
      rdi: '0x00402030', // String address
      rsi: '0x00000000',
      flags: { zero: false, carry: false, overflow: false },
    },
    consoleOutput: '[+] Code modified successfully!\n[*] Running modified code...\n',
  },
  {
    id: 7,
    phase: 'INSPECT',
    title: 'Second Call to modify()',
    description: 'main() calls modify() a second time. $RIP jumps to 0x00401000. It executes the newly injected NOP NOP instructions!',
    lineHighlight: 22,
    pagePermissions: 'RWX',
    modifiedAddresses: [0x00401000, 0x00401001],
    annotation: 'Executing 0x90 0x90 (NOPs). Processor pipeline consumes patched bytes.',
    cpu: {
      rip: '0x00401000',
      rax: '0x00401000',
      rbx: '0x00000000',
      rcx: '0x00000000',
      rdx: '0x00000000',
      rsp: '0x7FFFFFFFE438',
      rbp: '0x7FFFFFFFE440',
      rdi: '0x00000001',
      rsi: '0x7FFFFFFFE588',
      flags: { zero: false, carry: false, overflow: false },
    },
  },
  {
    id: 8,
    phase: 'ANALYZE',
    title: 'Analyze Condition on Second Pass',
    description: 'Evaluates if (p[0] != 0x90). Since p[0] is ALREADY 0x90, condition is FALSE! Reprotection and patch are bypassed entirely.',
    lineHighlight: 8,
    pagePermissions: 'RWX',
    modifiedAddresses: [0x00401000, 0x00401001],
    annotation: 'Condition FALSE! (p[0] == 0x90). Zero overhead branch skip.',
    cpu: {
      rip: '0x00401018',
      rax: '0x00000090',
      rbx: '0x00000000',
      rcx: '0x00000090',
      rdx: '0x00000000',
      rsp: '0x7FFFFFFFE438',
      rbp: '0x7FFFFFFFE440',
      rdi: '0x00401000',
      rsi: '0x00000090',
      flags: { zero: true, carry: false, overflow: false },
    },
  },
  {
    id: 9,
    phase: 'CONTINUE',
    title: 'Evolution Cycle Complete',
    description: 'Execution finishes smoothly. Process exits with code 0. Code has successfully rewritten itself and evolved at runtime.',
    lineHighlight: 23,
    pagePermissions: 'RWX',
    modifiedAddresses: [0x00401000, 0x00401001],
    annotation: 'Execution complete. Return code: 0.',
    cpu: {
      rip: '0x00401140',
      rax: '0x00000000',
      rbx: '0x00000000',
      rcx: '0x00000000',
      rdx: '0x00000000',
      rsp: '0x7FFFFFFFE458',
      rbp: '0x7FFFFFFFE458',
      rdi: '0x00000000',
      rsi: '0x7FFFFFFFE588',
      flags: { zero: true, carry: false, overflow: false },
    },
    consoleOutput: '[+] Code modified successfully!\n[✓] Process exited normally with status 0\n',
  },
];

export const VirtualMemorySimulator: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1500); // ms per step
  const [consoleLogs, setConsoleLogs] = useState<string>('[$] ./self_modifying_bin\n[*] Running original code...\n');
  const timerRef = useRef<number | null>(null);

  const step = SIMULATION_STEPS[currentStepIndex];

  // Dynamic memory representation
  const memoryCells: MemoryByte[] = SIMULATION_INITIAL_MEMORY.map((cell) => {
    const isPatched = (step.modifiedAddresses || []).includes(cell.address);
    const isIp = cell.address === parseInt(step.cpu.rip, 16);
    if (isPatched && cell.address === 0x00401000) {
      return {
        ...cell,
        hex: '90',
        ascii: '.',
        isModified: true,
        instruction: 'NOP (Patched)',
        isInstructionPointer: isIp,
      };
    }
    if (isPatched && cell.address === 0x00401001) {
      return {
        ...cell,
        hex: '90',
        ascii: '.',
        isModified: true,
        instruction: 'NOP (Patched)',
        isInstructionPointer: isIp,
      };
    }
    return {
      ...cell,
      isInstructionPointer: isIp,
    };
  });

  const handleStepForward = () => {
    sounds.step();
    if (currentStepIndex < SIMULATION_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStep = SIMULATION_STEPS[nextIdx];
      if (nextStep.consoleOutput && !consoleLogs.includes(nextStep.consoleOutput)) {
        setConsoleLogs(prev => prev + nextStep.consoleOutput);
      }
      if (nextStep.pagePermissions === 'RWX' && step.pagePermissions === 'R-X') {
        sounds.permissionChange();
      }
      if (nextStep.modifiedAddresses && nextStep.modifiedAddresses.length > 0 && (!step.modifiedAddresses || step.modifiedAddresses.length === 0)) {
        sounds.memoryWrite();
      }
    } else {
      setIsPlaying(false);
      sounds.execute();
    }
  };

  const handleReset = () => {
    sounds.reset();
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setConsoleLogs('[$] ./self_modifying_bin\n[*] Running original code...\n');
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          setIsPlaying(false);
          sounds.click();
        } else {
          handleStepForward();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        sounds.click();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentStepIndex]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= SIMULATION_STEPS.length - 1) {
            setIsPlaying(false);
            sounds.execute();
            return prev;
          }
          const nextIdx = prev + 1;
          const nextStep = SIMULATION_STEPS[nextIdx];
          if (nextStep.consoleOutput) {
            setConsoleLogs(c => c.includes(nextStep.consoleOutput!) ? c : c + nextStep.consoleOutput);
          }
          if (nextStep.pagePermissions === 'RWX' && SIMULATION_STEPS[prev].pagePermissions === 'R-X') {
            sounds.permissionChange();
          }
          if (nextStep.modifiedAddresses && (!SIMULATION_STEPS[prev].modifiedAddresses || SIMULATION_STEPS[prev].modifiedAddresses?.length === 0)) {
            sounds.memoryWrite();
          } else {
            sounds.step();
          }
          return nextIdx;
        });
      }, playbackSpeed);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  const getPhaseBadgeColor = (phase: string) => {
    switch (phase) {
      case 'INSPECT': return 'bg-cyan-950 text-cyan-400 border-cyan-500/40';
      case 'ANALYZE': return 'bg-purple-950 text-purple-400 border-purple-500/40';
      case 'MODIFY': return 'bg-amber-950 text-amber-400 border-amber-500/40';
      case 'WRITE_BACK': return 'bg-rose-950 text-rose-400 border-rose-500/40';
      case 'CONTINUE': return 'bg-emerald-950 text-emerald-400 border-emerald-500/40';
      default: return 'bg-neutral-900 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs text-amber-100" role="status"><strong className="block mb-1 uppercase tracking-wide">Virtual-memory simulation only</strong>This lab visualises predefined memory-permission and instruction-flow scenarios. It does not modify real process pages, call mprotect/VirtualProtect, inspect page tables, or enforce hardware W^X protections.</div>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-emerald-500/30 bg-[#080d10]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
              64-BIT VIRTUAL MACHINE
            </span>
            <span className="text-xs font-mono text-neutral-400">IN-PLACE SELF-MODIFICATION EMULATOR</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">
            VIRTUAL CPU & MEMORY SIMULATOR
          </h1>
        </div>

        {/* Control Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              sounds.click();
              setIsPlaying(!isPlaying);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-xs transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'PAUSE CLOCK' : 'AUTO RUN'}</span>
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentStepIndex >= SIMULATION_STEPS.length - 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono text-white transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4 text-emerald-400" />
            <span>STEP (1 CLK)</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs font-mono text-neutral-400">
            <Clock className="w-3.5 h-3.5" />
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-transparent text-emerald-400 focus:outline-none cursor-pointer"
            >
              <option value={2000} className="bg-neutral-900">0.5x Slow</option>
              <option value={1200} className="bg-neutral-900">1.0x Normal</option>
              <option value={600} className="bg-neutral-900">2.0x Fast</option>
            </select>
          </div>

          {/* GDB / Debugger Keyboard Shortcut Legend */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950/60 text-[11px] font-mono text-neutral-400">
            <span className="text-neutral-500">HOTKEYS:</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-emerald-400 text-[10px]">Space</kbd> Step</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-emerald-400 text-[10px]">P</kbd> Play</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-emerald-400 text-[10px]">R</kbd> Reset</span>
          </div>
        </div>
      </div>

      {/* Progress Stepper Ribbon */}
      <div className="rounded-xl border border-neutral-800 bg-[#060a0d] p-3.5">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Step {currentStepIndex + 1} of {SIMULATION_STEPS.length}:</span>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getPhaseBadgeColor(step.phase)}`}>
              Phase: {step.phase}
            </span>
          </div>
          <span className="text-emerald-400 font-semibold">{step.title}</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden flex gap-1 p-0.5">
          {SIMULATION_STEPS.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => {
                sounds.step();
                setCurrentStepIndex(idx);
              }}
              className={`flex-1 h-full rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : idx < currentStepIndex
                  ? 'bg-emerald-900/60'
                  : 'bg-neutral-800'
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-neutral-300 mt-2 font-sans">
          {step.description}
        </p>
      </div>

      {/* Main Simulation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Virtual Memory Page Table & Hex/Instruction Cells */}
        <div className="lg:col-span-8 space-y-6">
          {/* Memory Page Attributes & W^X Security Status */}
          <div className="rounded-2xl border border-neutral-800 bg-[#080d10] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h2 className="font-mono font-bold text-sm text-white uppercase">
                  VIRTUAL MEMORY PAGE TABLE (KERNEL MMU)
                </h2>
              </div>
              <span className="text-xs font-mono text-neutral-500">PAGING LAYER</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
                <span className="text-neutral-500 block text-[10px]">BASE VIRTUAL ADDRESS</span>
                <span className="text-emerald-300 font-bold text-sm">0x00401000</span>
              </div>
              <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
                <span className="text-neutral-500 block text-[10px]">PAGE SIZE</span>
                <span className="text-neutral-200 font-bold text-sm">4096 Bytes</span>
              </div>
              <div className={`p-3 rounded-xl border transition-all ${
                step.pagePermissions === 'RWX' 
                  ? 'border-rose-500/60 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                  : 'border-emerald-500/30 bg-emerald-950/30'
              }`}>
                <span className="text-neutral-400 block text-[10px]">PERMISSIONS (PROT)</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`font-bold text-sm ${step.pagePermissions === 'RWX' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {step.pagePermissions}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {step.pagePermissions === 'RWX' ? '(RWX Unlocked)' : '(Write Protected)'}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
                <span className="text-neutral-500 block text-[10px]">W^X / DEP SECURITY</span>
                <span className={`text-xs font-bold ${
                  step.pagePermissions === 'RWX' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {step.pagePermissions === 'RWX' ? '⚠ ESCALATED' : '✓ ENFORCED'}
                </span>
              </div>
            </div>
          </div>

          {/* Virtual Memory Cells (Disassembly & Hex Dump) */}
          <div className="rounded-2xl border border-emerald-500/20 bg-[#060a0c] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono font-bold text-sm text-white uppercase">
                  CODE SEGMENT INSTRUCTION MEMORY (0x00401000 - 0x0040100F)
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400/80 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Bus
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-[#030608]">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-500 text-[11px] bg-neutral-950">
                    <th className="py-2 px-3">STATUS</th>
                    <th className="py-2 px-3">ADDRESS</th>
                    <th className="py-2 px-3">HEX BYTE</th>
                    <th className="py-2 px-3">ASCII</th>
                    <th className="py-2 px-3">x86_64 DISASSEMBLY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {memoryCells.map((cell) => {
                    const isPatched = cell.isModified;
                    const isCurrentRip = cell.isInstructionPointer;

                    return (
                      <tr 
                        key={cell.address}
                        className={`transition-colors ${
                          isCurrentRip
                            ? 'bg-emerald-950/70 text-emerald-200 font-semibold'
                            : isPatched
                            ? 'bg-rose-950/20 text-rose-300'
                            : 'hover:bg-neutral-900/40 text-neutral-300'
                        }`}
                      >
                        <td className="py-2 px-3">
                          {isCurrentRip ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-400 text-black text-[10px] font-bold shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                              $RIP ►
                            </span>
                          ) : isPatched ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px]">
                              MUTATED
                            </span>
                          ) : (
                            <span className="text-neutral-600 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-neutral-400">
                          0x{cell.address.toString(16).toUpperCase().padStart(8, '0')}
                        </td>
                        <td className="py-2 px-3 font-bold">
                          <span className={`px-2 py-1 rounded text-xs ${
                            isPatched
                              ? 'bg-rose-950 border border-rose-500/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse'
                              : 'bg-neutral-900 text-emerald-300'
                          }`}>
                            0x{cell.hex}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-neutral-400">
                          '{cell.ascii}'
                        </td>
                        <td className="py-2 px-3">
                          <span className={isPatched ? 'text-rose-400 font-bold' : 'text-neutral-300'}>
                            {cell.instruction}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-neutral-400">
              <span className="text-emerald-300">
                Instruction Pointer: <strong className="text-white">{step.cpu.rip}</strong>
              </span>
              <span>
                Syscall mprotect status: <strong className={step.pagePermissions === 'RWX' ? 'text-rose-400' : 'text-neutral-300'}>{step.pagePermissions === 'RWX' ? 'PROT_WRITE Active' : 'PROT_READ|PROT_EXEC'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: 64-bit CPU Registers & Virtual Console */}
        <div className="lg:col-span-4 space-y-6">
          {/* CPU Registers Box */}
          <div className="rounded-2xl border border-neutral-800 bg-[#080d10] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono font-bold text-sm text-white uppercase">
                  CPU REGISTERS ($x86_64)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">CORE #0</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[
                { name: '$RIP', val: step.cpu.rip, highlight: true },
                { name: '$RAX', val: step.cpu.rax, highlight: false },
                { name: '$RDI', val: step.cpu.rdi, highlight: false },
                { name: '$RSI', val: step.cpu.rsi, highlight: false },
                { name: '$RSP', val: step.cpu.rsp, highlight: false },
                { name: '$RBP', val: step.cpu.rbp, highlight: false },
                { name: '$RCX', val: step.cpu.rcx, highlight: false },
                { name: '$RDX', val: step.cpu.rdx, highlight: false },
              ].map(reg => (
                <div 
                  key={reg.name}
                  className={`p-2 rounded-lg border ${
                    reg.highlight
                      ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'border-neutral-850 bg-neutral-900/40 text-neutral-300'
                  }`}
                >
                  <span className="text-[10px] text-neutral-500 block">{reg.name}</span>
                  <span className="text-[11px] font-bold truncate block">{reg.val}</span>
                </div>
              ))}
            </div>

            {/* Flags */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-500">FLAGS:</span>
              <div className="flex gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${step.cpu.flags.zero ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-neutral-900 text-neutral-600'}`}>
                  ZF: {step.cpu.flags.zero ? '1' : '0'}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${step.cpu.flags.carry ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-neutral-900 text-neutral-600'}`}>
                  CF: {step.cpu.flags.carry ? '1' : '0'}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${step.cpu.flags.overflow ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-neutral-900 text-neutral-600'}`}>
                  OF: {step.cpu.flags.overflow ? '1' : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Virtual Terminal Stdout */}
          <div className="rounded-2xl border border-neutral-800 bg-[#05080a] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono font-bold text-sm text-white uppercase">
                  STDOUT CONSOLE OUTPUT
                </h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">FD #1</span>
            </div>

            <div className="rounded-xl border border-neutral-850 bg-black p-3.5 font-mono text-xs text-emerald-400/90 min-h-[160px] whitespace-pre-wrap leading-relaxed shadow-inner">
              {consoleLogs}
              {isPlaying && (
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>Exit Code: {currentStepIndex === SIMULATION_STEPS.length - 1 ? '0 (SUCCESS)' : 'RUNNING...'}</span>
              <button
                onClick={() => setConsoleLogs('[$] ./self_modifying_bin\n[*] Running original code...\n')}
                className="hover:text-neutral-300"
              >
                Clear Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

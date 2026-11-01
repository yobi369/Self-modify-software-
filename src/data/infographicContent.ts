export interface PipelineStep {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  hardwareLevel: string;
  techExample: string;
  iconName: string;
}

export interface ModificationType {
  id: string;
  name: string;
  badge: string;
  description: string;
  mechanism: string;
  useCase: string;
  risk: string;
  codeSnippet: string;
}

export interface UseCaseItem {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  deepDive: string[];
}

export interface DefenseItem {
  title: string;
  subtitle: string;
  description: string;
  bypassMitigation: string;
  icon: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    number: 1,
    title: 'INSPECT',
    subtitle: 'Read your own code & environment',
    description: 'The process queries its own virtual address space, instruction pointers ($RIP), process maps (/proc/self/maps), or hardware environment (CPU features, AVX/NEON support).',
    hardwareLevel: 'Accesses instruction pointer, inspects symbol table or computes offset relative to $PC.',
    techExample: 'unsigned char *p = (unsigned char*)modify;',
    iconName: 'Search',
  },
  {
    number: 2,
    title: 'ANALYZE',
    subtitle: 'Decide what to change',
    description: 'Evaluates runtime heuristics: profiler metrics, branch prediction failure rate, OS environment, target architecture, or anti-debugging detection.',
    hardwareLevel: 'Profiler counters, tick registers (RDTSC), cache miss statistics, or runtime telemetry.',
    techExample: 'if (p[0] != 0x90) { /* evaluate if hotpatch needed */ }',
    iconName: 'Code2',
  },
  {
    number: 3,
    title: 'MODIFY',
    subtitle: 'Alter instructions or data',
    description: 'Synthesizes new machine instructions, replaces opcode sequences with NOPs (0x90), computes jump relative offsets, or compiles new bytecodes.',
    hardwareLevel: 'Assembler emission buffer, register mapping, opcode transformation in intermediate buffer.',
    techExample: 'p[0] = 0x90; // NOP instruction\np[1] = 0x90;',
    iconName: 'Edit3',
  },
  {
    number: 4,
    title: 'WRITE BACK',
    subtitle: 'Write changes to memory/disk',
    description: 'Requests page permission escalation via OS system calls (mprotect / VirtualProtect), writes bytes to the code page, and forces instruction cache coherency flush.',
    hardwareLevel: 'Page table attribute modification (PROT_WRITE), followed by __builtin___clear_cache / FlushInstructionCache.',
    techExample: 'mprotect(page, 4096, PROT_READ|PROT_WRITE|PROT_EXEC);',
    iconName: 'Save',
  },
  {
    number: 5,
    title: 'CONTINUE',
    subtitle: 'Execute the new version',
    description: 'Instruction pointer branches into the freshly modified code section. The processor pipeline fetches the updated instructions and executes the new logic seamlessly.',
    hardwareLevel: 'Instruction fetch unit reads updated bytes from L1 instruction cache; execution continues without process restart.',
    techExample: 'modify(); // Now runs the newly patched instructions',
    iconName: 'Play',
  },
];

export const MODIFICATION_TYPES: ModificationType[] = [
  {
    id: 'static_mutation',
    name: 'Static Mutation',
    badge: '101 010',
    description: 'Modifies embedded constants, lookup tables, decryption keys, or configuration variables directly in binary data/rodata segments.',
    mechanism: 'Direct memory overwrite within non-const data segments or unprotecting .rodata to shift behavior constants dynamically.',
    useCase: 'Dynamic threshold tuning, inline cryptographic key rolling, licensing watermarking.',
    risk: 'Low execution hazard; data integrity risk if not synchronized across threads.',
    codeSnippet: `// Mutating embedded threshold at runtime
static int MAX_BURST_CAP = 100;
void tune_engine() {
    MAX_BURST_CAP = measure_bandwidth() * 2;
}`,
  },
  {
    id: 'code_injection',
    name: 'Code Injection',
    badge: 'INJECT',
    description: 'Allocates executable memory buffers dynamically, copies raw machine code payload, and shifts control flow to the newly injected routine.',
    mechanism: 'Uses mmap(PROT_READ | PROT_WRITE | PROT_EXEC) or VirtualAlloc(PAGE_EXECUTE_READWRITE) followed by a function pointer cast.',
    useCase: 'Dynamic JIT stub emission, runtime plugin loading without disk I/O, instrumentation trampolines.',
    risk: 'Trigger for modern EDRs / antivirus; strictly blocked in sandboxed iOS/Android without JIT entitlements.',
    codeSnippet: `void *exec_mem = mmap(NULL, 4096, PROT_READ|PROT_WRITE|PROT_EXEC, MAP_ANON|MAP_PRIVATE, -1, 0);
memcpy(exec_mem, raw_opcodes, sizeof(raw_opcodes));
((void(*)())exec_mem)();`,
  },
  {
    id: 'code_patching',
    name: 'Code Patching (Hotpatching)',
    badge: 'PATCH',
    description: 'Surgically replaces specific existing instructions in a loaded function—such as swapping a conditional jump, NOPing a check, or inserting a 5-byte JMP detour.',
    mechanism: 'In-place overwrite of specific byte offsets after toggling page permissions via mprotect().',
    useCase: 'Live Linux kernel patching (Kpatch, KGraft), game modding, debugging breakpoints (INT3 / 0xCC), hot-swapping critical bug fixes zero-downtime.',
    risk: 'Instruction cache incoherency on ARM/RISC architectures if cache lines are not explicitly flushed.',
    codeSnippet: `// 5-byte relative jump detour hook
p[0] = 0xE9; // JMP rel32
*(int32_t*)(p + 1) = (int32_t)(target_addr - (p + 5));`,
  },
  {
    id: 'full_rewriting',
    name: 'Full Rewriting / Dynamic JIT',
    badge: 'REWRITE',
    description: 'Decompiles or parses higher-level expressions or ASTs, performs profile-guided optimization (PGO), and completely synthesizes a new native machine code block.',
    mechanism: 'Tiered compilation pipeline: Interpreter -> Baseline JIT (Sparkplug) -> Optimizing JIT (TurboFan / HotSpot C2) with speculative deoptimization.',
    useCase: 'Modern browser JavaScript runtimes (V8, JavaScriptCore), Java Virtual Machine (JVM), PyPy, database query vectorizers.',
    risk: 'High algorithmic complexity; requires rigorous type feedback guards and deoptimization fallbacks.',
    codeSnippet: `// High-level conceptual JIT generator
const dynamicFn = new Function('a', 'b', \`
    // Synthesized at runtime based on profiler statistics
    return \${isHardwareAVX ? 'simd_add(a, b)' : 'scalar_add(a, b)'};
\`);`,
  },
  {
    id: 'metamorphic_engines',
    name: 'Metamorphic Engines',
    badge: 'EVOLVE',
    description: 'Continuously mutates the physical code structure on every generation or execution cycle while mathematically preserving exact functional semantics.',
    mechanism: 'Dead-code insertion, register swapping, instruction substitution (e.g. XOR eax, eax <=> MOV eax, 0), re-ordering independent basic blocks.',
    useCase: 'Defensive anti-tampering, security honeypots, malware research, signature evasion studies, biological computation models.',
    risk: 'Extreme code bloat if entropy is unconstrained; difficult formal verification.',
    codeSnippet: `// Equivalence Transform Example:
// Generation A:  MOV EAX, 0
// Generation B:  XOR EAX, EAX
// Generation C:  SUB EAX, EAX
// Generation D:  PUSH 0; POP EAX`,
  },
];

export const REAL_WORLD_USE_CASES: UseCaseItem[] = [
  {
    title: 'JIT Compilers (Just-In-Time)',
    subtitle: 'V8, JVM HotSpot, PyPy, Cranelift',
    description: 'Analyzes frequently executed hot paths (loops, function calls) and compiles dynamic scripts into optimized native machine code at runtime.',
    icon: 'Rocket',
    deepDive: [
      'Monitors call counts and type feedback during interpreter execution',
      'Emits specialized assembly eliminating dynamic type dispatch',
      'Implements "Deoptimization" (Deopt) to safely bail out to interpreter when type assumptions fail',
      'Dual-page allocation: writes to writable memory, maps as executable (W^X compliant)',
    ],
  },
  {
    title: 'Adaptive & Self-Tuning Systems',
    subtitle: 'Hardware-adaptive algorithms & auto-vectorization',
    description: 'Algorithms that detect hardware capabilities (such as AVX-512, ARM NEON, GPU acceleration) at runtime and hotpatch call pointers to the fastest vectorized path.',
    icon: 'Sliders',
    deepDive: [
      'Runtime feature discovery via CPUID instruction or auxiliary vectors',
      'Eliminates branch latency of if-checks inside innermost hot loops',
      'Dynamic dispatch table pointer replacement on first execution pass',
    ],
  },
  {
    title: 'Game Mods & Interactive Detours',
    subtitle: 'Trampoline hooks, memory scanners, live debugging',
    description: 'Modding frameworks and reverse engineering tools that hook game functions in memory to add features, telemetry, or custom rendering without modifying original game files.',
    icon: 'Gamepad2',
    deepDive: [
      'Saves original instruction bytes to a "trampoline" memory buffer',
      'Overwrites function entry with an unconditional JMP to custom hook logic',
      'Hook executes custom code, then calls trampoline to resume original game logic seamlessly',
    ],
  },
  {
    title: 'Security Research & Mutation Engines',
    subtitle: 'Polymorphic shellcode, fuzzing engines, anti-analysis',
    description: 'Investigating evasion techniques to train next-generation EDR behavior engines, fuzzers mutating their own test harnesses, and defensive binary hardening.',
    icon: 'ShieldAlert',
    deepDive: [
      'Polymorphism: Encrypted payload paired with a mutating decryptor stub',
      'Metamorphism: Every instance has different instructions and hashes, zero static decryptor',
      'Anti-debugging routines that overwrite INT3 software breakpoints',
    ],
  },
  {
    title: 'Self-Healing & Resilient Software',
    subtitle: 'Auto-patching fault recovery & hotfixes',
    description: 'High-availability mission-critical systems that can detect memory corruption, race conditions, or infinite loops and automatically patch the offending instructions on the fly.',
    icon: 'HeartPulse',
    deepDive: [
      'Signal handlers (SIGSEGV / SIGILL) that inspect faulting address ($RIP)',
      'Transaction rollback if memory state violates invariant assertions',
      'Dynamic zero-downtime hotpatching of kernel CVEs without system reboot',
    ],
  },
];

export const DETECTION_AND_DEFENSE: DefenseItem[] = [
  {
    title: 'W^X Protection (DEP / NX Bit)',
    subtitle: 'Write XOR Execute enforcement',
    description: 'Operating system and CPU hardware rule: A memory page can be Writable OR Executable, but NEVER BOTH simultaneously. Prevents executing arbitrary data buffers.',
    bypassMitigation: 'Systems require explicit mprotect() calls to toggle between RW and RX, or dual-mapped virtual pages backed by the same physical memory.',
    icon: 'Lock',
  },
  {
    title: 'Behavior Monitoring & EDR Hooks',
    subtitle: 'Kernel telemetry & syscall inspection',
    description: 'Endpoint Detection and Response (EDR) agents place kernel hooks or userland API trampolines to intercept calls to VirtualProtect, mprotect, and WriteProcessMemory.',
    bypassMitigation: 'Legitimate JITs register with the OS using hardened runtime JIT entitlements (e.g. Apple Silicon pthread_jit_write_protect_np).',
    icon: 'Eye',
  },
  {
    title: 'Code Integrity & Authenticode Checking',
    subtitle: 'Cryptographic hash and signature verification',
    description: 'OS monitors verify binary checksums against signed digital signatures. If instructions in the text segment differ from the signed PE/ELF on disk, execution is halted.',
    bypassMitigation: 'Self-modifying code must operate within designated private anonymous memory allocations rather than modifying disk-mapped binaries.',
    icon: 'FileCheck',
  },
  {
    title: 'Sandboxing & Memory Compartments',
    subtitle: 'Restricted system privilege isolation',
    description: 'Seccomp-BPF on Linux or Chromium sandbox limits system calls, entirely denying memory protection escalation or raw memory allocation permissions.',
    bypassMitigation: 'Requires pre-allocated execution pools managed by an out-of-process trusted coordinator.',
    icon: 'Layers',
  },
  {
    title: 'Instruction Cache Incoherency',
    subtitle: 'Hardware L1 instruction vs L1 data cache sync',
    description: 'Modern CPUs split L1 cache into L1-D (data) and L1-I (instruction). Writing to memory updates L1-D, but L1-I might still hold stale old instructions, causing unpredictable crashes.',
    bypassMitigation: 'Must explicitly issue cache flush instructions (__builtin___clear_cache on GCC/Clang or FlushInstructionCache on Win32).',
    icon: 'Cpu',
  },
];

export const C_CODE_EXAMPLE = `#include <stdio.h>
#include <string.h>
#include <sys/mman.h> // For memory protection on *nix

void modify() {
    unsigned char *p = (unsigned char*)modify;
    // Replace the first instruction with NOP (0x90)
    if (p[0] != 0x90) {
        if (mprotect((void*)((unsigned long)p & ~(0xFFF)), 
                     4096, PROT_READ|PROT_WRITE|PROT_EXEC) == 0) {
            p[0] = 0x90; // NOP
            p[1] = 0x90;
        }
    }
    printf("[+] Code modified successfully!\\n");
}

int main() {
    printf("[*] Running original code...\\n");
    modify(); // Self-modify this function
    printf("[*] Running modified code...\\n");
    modify(); // Now it's already modified
    return 0;
}`;

export const PSEUDOCODE_LOOP = `loop {
    state = analyze_environment();
    decision = decide_changes(state);
    new_code = generate_or_patch(decision);
    write_memory(self_address, new_code);
    flush_instruction_cache();
    execute_new_code();
}
// Evolve. Adapt. Survive.`;

export const SIMULATION_INITIAL_MEMORY = [
  { address: 0x00401000, hex: '55', originalHex: '55', ascii: 'U', isModified: false, instruction: 'PUSH RBP' },
  { address: 0x00401001, hex: '48', originalHex: '48', ascii: 'H', isModified: false, instruction: 'MOV RBP, RSP' },
  { address: 0x00401002, hex: '89', originalHex: '89', ascii: '‰', isModified: false, instruction: '(cont)' },
  { address: 0x00401003, hex: 'E5', originalHex: 'E5', ascii: 'å', isModified: false, instruction: '(cont)' },
  { address: 0x00401004, hex: '48', originalHex: '48', ascii: 'H', isModified: false, instruction: 'SUB RSP, 0x10' },
  { address: 0x00401005, hex: '83', originalHex: '83', ascii: 'ƒ', isModified: false, instruction: '(cont)' },
  { address: 0x00401006, hex: 'EC', originalHex: 'EC', ascii: 'ì', isModified: false, instruction: '(cont)' },
  { address: 0x00401007, hex: '10', originalHex: '10', ascii: '.', isModified: false, instruction: '(cont)' },
  { address: 0x00401008, hex: '48', originalHex: '48', ascii: 'H', isModified: false, instruction: 'LEA RAX, [0x00401000]' },
  { address: 0x00401009, hex: '8D', originalHex: '8D', ascii: '', isModified: false, instruction: '(cont)' },
  { address: 0x0040100A, hex: '05', originalHex: '05', ascii: '.', isModified: false, instruction: '(cont)' },
  { address: 0x0040100B, hex: 'EF', originalHex: 'EF', ascii: 'ï', isModified: false, instruction: '(cont)' },
  { address: 0x0040100C, hex: 'FF', originalHex: 'FF', ascii: 'ÿ', isModified: false, instruction: '(cont)' },
  { address: 0x0040100D, hex: 'FF', originalHex: 'FF', ascii: 'ÿ', isModified: false, instruction: '(cont)' },
  { address: 0x0040100E, hex: 'FF', originalHex: 'FF', ascii: 'ÿ', isModified: false, instruction: '(cont)' },
  { address: 0x0040100F, hex: '00', originalHex: '00', ascii: '.', isModified: false, instruction: 'ALIGN 16' },
];

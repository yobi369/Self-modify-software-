import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  Binary, 
  Code, 
  Sparkles, 
  Check, 
  Layers, 
  Zap,
  Activity,
  ArrowRight
} from 'lucide-react';
import { sounds } from '../audio/soundEffects';

export const LiveSandboxPlayground: React.FC = () => {
  const [sandboxMode, setSandboxMode] = useState<'javascript' | 'wasm_jit' | 'self_mod_tape'>('javascript');

  // --- JavaScript Self-Modifying State ---
  const [jsCallCount, setJsCallCount] = useState<number>(0);
  const [jsOutputLog, setJsOutputLog] = useState<string[]>([
    'Ready. Click "Execute Evolving Function" to run pass #1.',
  ]);
  const [currentJsCode, setCurrentJsCode] = useState<string>(
`let targetFunc = function(x) {
  // Pass 1: Baseline slow recursive computation
  console.log("Pass 1: Compiling and computing baseline...");
  
  // Self-modification: Replace targetFunc with optimized inline variant
  targetFunc = function(x) {
    // Pass 2+: Optimized direct analytical computation
    console.log("Pass 2+: Fast-path hotpatch executed!");
    return x * (x + 1) / 2;
  };

  let sum = 0;
  for (let i = 1; i <= x; i++) sum += i;
  return sum;
};`
  );

  // --- WebAssembly JIT State ---
  const [wasmLayers, setWasmLayers] = useState<'add' | 'multiply' | 'square'>('add');
  const [wasmResult, setWasmResult] = useState<number | null>(null);
  const [wasmByteHex, setWasmByteHex] = useState<string>('');
  const [wasmLogs, setWasmLogs] = useState<string[]>(['Ready to synthesize WebAssembly binary buffer in browser.']);

  // --- Self-Modifying Tape State ---
  const [tape, setTape] = useState<number[]>([43, 43, 62, 43, 60, 45, 0, 0, 0, 0]);
  const [tapeHead, setTapeHead] = useState<number>(0);
  const [tapeOutput, setTapeOutput] = useState<string>('Ready.');

  // Run JS self-modifying function
  const executeJsSelfMod = () => {
    sounds.execute();
    try {
      // Define context
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: unknown[]) => logs.push(args.join(' ')),
      };

      // Construct dynamic function
      const runner = new Function('console', 'callIndex', `
        ${currentJsCode}
        const result = targetFunc(100);
        return { result, evolvedSource: targetFunc.toString() };
      `);

      const res = runner(mockConsole, jsCallCount + 1);
      const newCount = jsCallCount + 1;
      setJsCallCount(newCount);

      setJsOutputLog(prev => [
        `[Invocation #${newCount}] Result = ${res.result}`,
        ...logs.map(l => `  ► ${l}`),
        `  • Function Source Signature: ${res.evolvedSource.slice(0, 70)}...`,
        ...prev.slice(0, 8),
      ]);
    } catch (err: any) {
      setJsOutputLog(prev => [`[Error]: ${err.message}`, ...prev]);
    }
  };

  const resetJsState = () => {
    sounds.reset();
    setJsCallCount(0);
    setJsOutputLog(['Reset state. Ready for fresh execution pass.']);
  };

  // Run WebAssembly JIT Generator
  const compileAndRunWasm = async (mode: 'add' | 'multiply' | 'square') => {
    sounds.memoryWrite();
    setWasmLayers(mode);
    try {
      // Build real valid WebAssembly binary opcodes dynamically
      // Standard minimal WASM module: (module (func (export "compute") (param i32 i32) (result i32) ...))
      const magic = [0x00, 0x61, 0x73, 0x6d]; // \0asm
      const version = [0x01, 0x00, 0x00, 0x00]; // version 1
      
      // Type section
      const typeSec = [
        0x01, // section id 1
        0x07, // section length
        0x01, // 1 type
        0x60, // func
        0x02, 0x7f, 0x7f, // 2 params: i32, i32
        0x01, 0x7f // 1 result: i32
      ];

      // Function section
      const funcSec = [
        0x03, // section id 3
        0x02, // section length
        0x01, // 1 function
        0x00  // signature index 0
      ];

      // Export section ("compute")
      const exportSec = [
        0x07, // section id 7
        0x0b, // section length
        0x01, // 1 export
        0x07, 0x63, 0x6f, 0x6d, 0x70, 0x75, 0x74, 0x65, // "compute"
        0x00, // export kind func
        0x00  // func index 0
      ];

      // Code body depending on mode:
      // 0x6A = i32.add
      // 0x6C = i32.mul
      let mathOpcode = 0x6a; // add
      if (mode === 'multiply') mathOpcode = 0x6c;
      if (mode === 'square') mathOpcode = 0x6c; // multiply param 0 by param 0

      const codeBody = mode === 'square' ? [
        0x20, 0x00, // local.get 0
        0x20, 0x00, // local.get 0
        mathOpcode, // i32.mul
        0x0b        // end
      ] : [
        0x20, 0x00, // local.get 0
        0x20, 0x01, // local.get 1
        mathOpcode, // i32.add or i32.mul
        0x0b        // end
      ];

      const codeSec = [
        0x0a, // section id 10 (Code)
        codeBody.length + 3, // section length
        0x01, // 1 function body
        codeBody.length + 1, // body length
        0x00, // 0 local declarations
        ...codeBody
      ];

      const wasmBytes = new Uint8Array([
        ...magic,
        ...version,
        ...typeSec,
        ...funcSec,
        ...exportSec,
        ...codeSec
      ]);

      const hexRepresentation = Array.from(wasmBytes)
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
      setWasmByteHex(hexRepresentation);

      // Real in-browser WebAssembly JIT compilation!
      const module = await WebAssembly.compile(wasmBytes.buffer);
      const instance = await WebAssembly.instantiate(module);
      const compute = (instance.exports as any).compute as (a: number, b: number) => number;

      const a = 12;
      const b = 5;
      const res = compute(a, b);
      setWasmResult(res);

      sounds.execute();
      setWasmLogs(prev => [
        `[JIT Compile & Emit]: Synthesized ${wasmBytes.length} bytes in memory.`,
        `  ► Opcode: ${mode.toUpperCase()} (0x${mathOpcode.toString(16).toUpperCase()})`,
        `  ► Executed compute(${a}, ${b}) => Output: ${res}`,
        ...prev.slice(0, 5)
      ]);
    } catch (err: any) {
      setWasmLogs(prev => [`[WASM JIT Error]: ${err.message}`, ...prev]);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-emerald-500/30 bg-[#080d10]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
              BROWSER JIT & RUNTIME EXPERIMENTATION
            </span>
            <span className="text-xs font-mono text-neutral-400">REAL EXECUTABLE SANDBOXES</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">
            LIVE EXECUTABLE SANDBOX
          </h1>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
          <button
            onClick={() => {
              sounds.click();
              setSandboxMode('javascript');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              sandboxMode === 'javascript'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            JS Metaprogramming
          </button>
          <button
            onClick={() => {
              sounds.click();
              setSandboxMode('wasm_jit');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              sandboxMode === 'wasm_jit'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            WASM JIT Generator
          </button>
        </div>
      </div>

      {/* Mode 1: JavaScript Self-Modifying Function */}
      {sandboxMode === 'javascript' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl border border-emerald-950/80 bg-[#080d10] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <h2 className="font-mono font-bold text-sm text-white uppercase">
                  ACTIVE JAVASCRIPT MUTATING FUNCTION
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-950/40">
                Calls Made: {jsCallCount}
              </span>
            </div>

            <p className="text-xs text-neutral-300 font-sans">
              This function rewrites its own reference upon first invocation, converting an O(N) linear loop into an O(1) mathematical formula on subsequent executions.
            </p>

            <div className="relative">
              <textarea
                value={currentJsCode}
                onChange={(e) => setCurrentJsCode(e.target.value)}
                rows={14}
                className="w-full rounded-xl border border-neutral-800 bg-[#040709] p-4 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500/60 leading-relaxed resize-none shadow-inner"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={executeJsSelfMod}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Execute Pass #{jsCallCount + 1}</span>
                </button>

                <button
                  onClick={resetJsState}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset State</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-neutral-500">
                Pattern: Self-Hotpatching / Memoized Dispatch
              </span>
            </div>
          </div>

          {/* Right Column: Execution Log & Diagnostics */}
          <div className="lg:col-span-5 rounded-2xl border border-emerald-950/80 bg-[#05080a] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono font-bold text-sm text-white uppercase">
                  DYNAMIC EXECUTION LOG
                </h3>
              </div>
              <button
                onClick={() => setJsOutputLog([])}
                className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300"
              >
                Clear
              </button>
            </div>

            <div className="rounded-xl border border-neutral-850 bg-black p-4 font-mono text-xs text-neutral-300 min-h-[320px] max-h-[380px] overflow-y-auto space-y-1.5 shadow-inner">
              {jsOutputLog.map((log, idx) => (
                <div 
                  key={idx}
                  className={`py-0.5 ${
                    log.startsWith('[Invocation')
                      ? 'text-emerald-400 font-bold border-b border-neutral-900 pb-1'
                      : log.startsWith('[Error')
                      ? 'text-rose-400'
                      : 'text-neutral-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg border border-emerald-950 bg-emerald-950/20 text-xs font-mono text-emerald-300">
              <strong>Observation:</strong> Notice how Pass #1 executes the slow loop, then overwrites the pointer. On Pass #2, execution hits the fast path with zero code re-parsing.
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: WebAssembly Dynamic JIT Generator */}
      {sandboxMode === 'wasm_jit' && (
        <div className="rounded-2xl border border-emerald-500/30 bg-[#080d10] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Binary className="w-4 h-4 text-emerald-400" />
                <h2 className="font-mono font-bold text-base text-white uppercase">
                  REAL RUNTIME WEBASSEMBLY JIT COMPILER
                </h2>
              </div>
              <p className="text-xs text-neutral-400 font-sans mt-1">
                Synthesizes raw WASM bytecodes directly in a JavaScript <code className="text-emerald-400">Uint8Array</code> buffer, compiles via <code className="text-emerald-400">WebAssembly.compile()</code>, and executes native code in-browser.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['add', 'multiply', 'square'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => compileAndRunWasm(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    wasmLayers === mode
                      ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'border border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  Emit {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Hex Dump of Generated WASM */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>SYNTHESIZED RAW WASM BYTECODE BUFFER</span>
                <span className="text-emerald-400">W^X Compliant In-Memory Emission</span>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-[#040608] font-mono text-xs text-emerald-300/90 overflow-x-auto min-h-[140px] leading-relaxed shadow-inner">
                {wasmByteHex || 'Click an "Emit" button above to synthesize a WebAssembly binary module in RAM.'}
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg border border-neutral-850 bg-neutral-900/40">
                  <span className="text-neutral-500 block text-[10px]">MAGIC NUMBER</span>
                  <span className="text-white font-bold">0x00 0x61 0x73 0x6D</span>
                </div>
                <div className="p-2.5 rounded-lg border border-neutral-850 bg-neutral-900/40">
                  <span className="text-neutral-500 block text-[10px]">CURRENT OP</span>
                  <span className="text-emerald-400 font-bold">{wasmLayers.toUpperCase()}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-neutral-850 bg-neutral-900/40">
                  <span className="text-neutral-500 block text-[10px]">NATIVE RESULT</span>
                  <span className="text-cyan-300 font-bold text-sm">
                    {wasmResult !== null ? wasmResult : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* WASM JIT Log */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>JIT COMPILATION PIPELINE TELEMETRY</span>
                <span className="text-[10px]">WebAssembly.instantiate()</span>
              </div>

              <div className="p-4 rounded-xl border border-neutral-850 bg-black font-mono text-xs text-neutral-300 min-h-[180px] overflow-y-auto space-y-1.5 shadow-inner">
                {wasmLogs.map((log, i) => (
                  <div key={i} className="py-0.5 text-neutral-300">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

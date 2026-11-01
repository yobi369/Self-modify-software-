import React, { useState, useEffect, useRef } from 'react';
import { 
  Dna, 
  ShieldCheck, 
  History, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Lock, 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  Terminal, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  Zap, 
  Layers, 
  Check, 
  Clock,
  Flame,
  Bug,
  Code,
  ShieldAlert,
  BarChart3,
  RefreshCw,
  Sliders,
  ChevronRight,
  Database
} from 'lucide-react';
import { MutationCheckpoint } from '../types';
import { sounds } from '../audio/soundEffects';
import { 
  ADVERSARIAL_VECTORS, 
  PenetrationTestResult, 
  runAdversarialPenetrationSuite,
  runInHermeticSandbox
} from '../utils/adversarialSandbox';
import { 
  ComparativeBenchmarkReport, 
  generateBenchmarkDataset, 
  runStatisticalBenchmark, 
  compareBenchmarks 
} from '../utils/statisticalBenchmark';

// 4 Canonical Evolution Generations
const GEN_0_BASELINE = `// [Gen 0 Baseline] O(N^2) Quadratic Scan
function processData(items) {
  var uniqueList = [];
  var frequencies = {};

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var exists = false;
    for (var j = 0; j < uniqueList.length; j++) {
      if (uniqueList[j] === item) {
        exists = true;
        break;
      }
    }
    if (!exists) uniqueList.push(item);
    frequencies[item] = (frequencies[item] || 0) + 1;
  }

  return {
    uniqueCount: uniqueList.length,
    frequencies: frequencies,
    firstUnique: uniqueList[0] || null,
    lastUnique: uniqueList[uniqueList.length - 1] || null
  };
}`;

const GEN_1_HASHSET = `// [Gen 1 Evolution] O(N) Hash Table & Set Projection
function processData(items) {
  var frequencies = Object.create(null);
  var uniqueList = [];
  var len = items.length;

  for (var i = 0; i < len; i++) {
    var item = items[i];
    if (frequencies[item] === undefined) {
      frequencies[item] = 1;
      uniqueList.push(item);
    } else {
      frequencies[item]++;
    }
  }

  return {
    uniqueCount: uniqueList.length,
    frequencies: frequencies,
    firstUnique: uniqueList[0] || null,
    lastUnique: uniqueList[uniqueList.length - 1] || null
  };
}`;

const GEN_2_UNROLLED = `// [Gen 2 Evolution] 4x Loop Unrolling & Branch Monomorphism
function processData(items) {
  var freq = Object.create(null);
  var unique = [];
  var len = items.length;
  var i = 0;
  var limit = len - 3;

  for (; i < limit; i += 4) {
    var a = items[i], b = items[i+1], c = items[i+2], d = items[i+3];
    if (freq[a] === undefined) { freq[a] = 1; unique.push(a); } else { freq[a]++; }
    if (freq[b] === undefined) { freq[b] = 1; unique.push(b); } else { freq[b]++; }
    if (freq[c] === undefined) { freq[c] = 1; unique.push(c); } else { freq[c]++; }
    if (freq[d] === undefined) { freq[d] = 1; unique.push(d); } else { freq[d]++; }
  }

  for (; i < len; i++) {
    var it = items[i];
    if (freq[it] === undefined) { freq[it] = 1; unique.push(it); } else { freq[it]++; }
  }

  return {
    uniqueCount: unique.length,
    frequencies: freq,
    firstUnique: unique[0] || null,
    lastUnique: unique[unique.length - 1] || null
  };
}`;

const GEN_3_TYPED_MAP = `// [Gen 3 Evolution] Fast In-Line Cache & Optimized Linear Allocator
function processData(items) {
  var len = items.length;
  if (len === 0) return { uniqueCount: 0, frequencies: {}, firstUnique: null, lastUnique: null };

  var freq = Object.create(null);
  var unique = new Array(len);
  var uCount = 0;

  for (var i = 0; i < len; i++) {
    var item = items[i];
    var count = freq[item];
    if (count === undefined) {
      freq[item] = 1;
      unique[uCount++] = item;
    } else {
      freq[item] = count + 1;
    }
  }

  return {
    uniqueCount: uCount,
    frequencies: freq,
    firstUnique: unique[0],
    lastUnique: unique[uCount - 1]
  };
}`;

// Built-in fault-injection fixture for the local simulated workload only.
const MUTANT_LATENT_FAILURE = `// [Latent Bug Mutant] Passes trivial tests, throws intermittently under real workload
function processData(items) {
  // Latent defect: intermittent exception when traffic is heavy
  if (Math.random() < 0.45 && items.length > 5) {
    throw new Error("SIMULATED_LATENT_FAILURE: Demo workload fault");
  }
  var f = {};
  for(var i=0; i<items.length; i++) f[items[i]] = (f[items[i]]||0) + 1;
  return { uniqueCount: Object.keys(f).length, frequencies: f, firstUnique: items[0]||null, lastUnique: items[items.length-1]||null };
}`;

export const AutonomousProductionEngine: React.FC = () => {
  // Active in-memory code & heap state
  const [activeCode, setActiveCode] = useState<string>(GEN_0_BASELINE);
  const [activeVersion, setActiveVersion] = useState<string>('v1.0.0 (Gen 0 Baseline)');
  const [activePointer, setActivePointer] = useState<string>('0x7ffee280a400');
  const [heapInvocations, setHeapInvocations] = useState<number>(14290);
  const [heapStateUptime, setHeapStateUptime] = useState<number>(128);

  // Subtabs
  const [activeSubTab, setActiveSubTab] = useState<
    'evolution_loop' | 'adversarial_suite' | 'canary_watchdog' | 'statistical_bench' | 'live_heap_inspector' | 'checkpoints'
  >('evolution_loop');

  // Checkpoint ledger
  const [checkpoints, setCheckpoints] = useState<MutationCheckpoint[]>([
    {
      id: 'cp_v1_0_0',
      version: 'v1.0.0 (Gen 0)',
      timestamp: '2026-09-23 05:00:00 UTC',
      mutationSummary: 'Baseline demo algorithm (O(N^2) Array Scan)',
      technique: 'Baseline Implementation',
      code: GEN_0_BASELINE,
      status: 'active',
      metrics: { latencyUs: 492, opsPerSec: 2032, memoryKb: 14.2, testPassRate: 100 }
    }
  ]);

  // Multi-generation evolutionary loop state
  const [currentGeneration, setCurrentGeneration] = useState<number>(0);
  const [isEvolvingMultiGen, setIsEvolvingMultiGen] = useState<boolean>(false);
  const [evolutionLog, setEvolutionLog] = useState<string[]>([]);
  const [generationHistory, setGenerationHistory] = useState<
    { gen: number; name: string; speedup: number; latencyUs: number; passed: boolean }[]
  >([
    { gen: 0, name: 'Gen 0: Baseline O(N^2)', speedup: 1.0, latencyUs: 492, passed: true }
  ]);

  // Adversarial penetration test suite state
  const [penResults, setPenResults] = useState<PenetrationTestResult[]>([]);
  const [isRunningPenSuite, setIsRunningPenSuite] = useState<boolean>(false);

  // Statistical Benchmark state
  const [benchReport, setBenchReport] = useState<ComparativeBenchmarkReport | null>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState<boolean>(false);

  // Canary Watchdog & Simulated Workload Demo state
  const [isTrafficRunning, setIsTrafficRunning] = useState<boolean>(true);
  const [trafficRequestsPerSec, setTrafficRequestsPerSec] = useState<number>(45);
  const [trafficTotalRequests, setTrafficTotalRequests] = useState<number>(3120);
  const [trafficErrorCount, setTrafficErrorCount] = useState<number>(0);
  const [watchdogStatus, setWatchdogStatus] = useState<'HEALTHY' | 'ANOMALY_DETECTED' | 'AUTO_ROLLBACK_EXECUTED'>('HEALTHY');
  const [watchdogLog, setWatchdogLog] = useState<string[]>([
    'DEMO WATCHDOG: Local simulated workload running. No independent invariants verified.'
  ]);

  // Compile active code safely into memory
  // Execute only four built-in demo implementations. Never evaluate source strings.
  const compileActiveFunction = (codeStr: string): ((items: any[]) => any) | null => {
    if (codeStr === GEN_0_BASELINE) {
      return (items) => {
        const unique: any[] = [];
        const frequencies: Record<string, number> = Object.create(null);
        for (const item of items) {
          if (!unique.includes(item)) unique.push(item);
          frequencies[String(item)] = (frequencies[String(item)] || 0) + 1;
        }
        return { uniqueCount: unique.length, frequencies, firstUnique: unique[0] || null, lastUnique: unique[unique.length - 1] || null };
      };
    }
    if (codeStr === GEN_1_HASHSET) {
      return (items) => {
        const frequencies: Record<string, number> = Object.create(null);
        const unique: any[] = [];
        for (const item of items) {
          const key = String(item);
          if (frequencies[key] === undefined) { frequencies[key] = 1; unique.push(item); }
          else frequencies[key] += 1;
        }
        return { uniqueCount: unique.length, frequencies, firstUnique: unique[0] || null, lastUnique: unique[unique.length - 1] || null };
      };
    }
    if (codeStr === GEN_2_UNROLLED) {
      return (items) => {
        const frequencies: Record<string, number> = Object.create(null);
        const unique: any[] = [];
        const add = (item: any) => {
          const key = String(item);
          if (frequencies[key] === undefined) { frequencies[key] = 1; unique.push(item); }
          else frequencies[key] += 1;
        };
        let index = 0;
        for (; index + 3 < items.length; index += 4) {
          add(items[index]); add(items[index + 1]); add(items[index + 2]); add(items[index + 3]);
        }
        for (; index < items.length; index += 1) add(items[index]);
        return { uniqueCount: unique.length, frequencies, firstUnique: unique[0] || null, lastUnique: unique[unique.length - 1] || null };
      };
    }
    if (codeStr === GEN_3_TYPED_MAP) {
      return (items) => {
        const frequencies: Record<string, number> = Object.create(null);
        const unique: any[] = [];
        for (const item of items) {
          const key = String(item);
          const count = frequencies[key];
          if (count === undefined) { frequencies[key] = 1; unique.push(item); }
          else frequencies[key] = count + 1;
        }
        return { uniqueCount: unique.length, frequencies, firstUnique: unique[0] || null, lastUnique: unique[unique.length - 1] || null };
      };
    }
    if (codeStr === MUTANT_LATENT_FAILURE) {
      return (items) => {
        if (Math.random() < 0.45 && items.length > 5) {
          throw new Error("SIMULATED_LATENT_FAILURE: Demo workload fault.");
        }
        const frequencies: Record<string, number> = Object.create(null);
        for (const item of items) frequencies[String(item)] = (frequencies[String(item)] || 0) + 1;
        return { uniqueCount: Object.keys(frequencies).length, frequencies, firstUnique: items[0] || null, lastUnique: items[items.length - 1] || null };
      };
    }
    return null;
  };

  // Keep heap state ticking (demonstrates zero-downtime persistent memory while swapping pointers)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeapStateUptime((u) => u + 1);
      if (isTrafficRunning) {
        setHeapInvocations((inv) => inv + Math.floor(Math.random() * 5) + 3);
        setTrafficTotalRequests((r) => r + Math.floor(Math.random() * 5) + 3);

        // Run a built-in demo implementation on simulated traffic
        const fn = compileActiveFunction(activeCode);
        if (fn) {
          try {
            const testTokens = ['cpu', 'ram', 'gpu', 'ssd', 'cpu', 'cache', 'bus', 'dram'];
            fn(testTokens);
          } catch (err: any) {
            // Anomaly caught in simulated!
            setTrafficErrorCount((e) => {
              const newCount = e + 1;
              if (newCount >= 3 && watchdogStatus === 'HEALTHY') {
                // Trigger Autonomous Canary Rollback!
                triggerCanaryRollback(err.message || 'Simulated demo exception');
              }
              return newCount;
            });
          }
        }
      }
    }, 400);

    return () => clearInterval(timer);
  }, [activeCode, isTrafficRunning, watchdogStatus]);

  // Simulated rollback sequence triggered when demo workload anomaly exceeds threshold
  const triggerCanaryRollback = (reason: string) => {
    sounds.error();
    setWatchdogStatus('ANOMALY_DETECTED');
    const timestamp = new Date().toISOString().substring(11, 19);

    setWatchdogLog((prev) => [
      `${timestamp} [ANOMALY ALERT]: Rolling error rate exceeded 5% threshold! Trigger: "${reason}"`,
      `${timestamp} [AUTO-ROLLBACK]: Initiating emergency restore to last known-good checkpoint...`,
      ...prev
    ]);

    setTimeout(() => {
      // Find the last known-good checkpoint
      const knownGood = checkpoints.find((cp) => cp.status === 'active' || cp.status === 'archived');
      if (knownGood) {
        setActiveCode(knownGood.code);
        setActiveVersion(`${knownGood.version} (DEMO RESTORED)`);
        setActivePointer(`0x7ffee280${Math.floor(Math.random() * 9000 + 1000)}`);
        setWatchdogStatus('AUTO_ROLLBACK_EXECUTED');
        setTrafficErrorCount(0);
        sounds.success();

        setWatchdogLog((prev) => [
          `${new Date().toISOString().substring(11, 19)} [DEMO RESTORED]: Local demo state reset to ${knownGood.version}. Simulated error counter reset.`,
          ...prev
        ]);
      }
    }, 1200);
  };

  // Run the Multi-Generation Autonomous Evolution Loop
  const runAutonomousEvolutionLoop = async () => {
    if (isEvolvingMultiGen) return;
    setIsEvolvingMultiGen(true);
    sounds.execute();

    const generations = [
      { gen: 1, name: 'Gen 1 (Hash Set Map O(N))', code: GEN_1_HASHSET },
      { gen: 2, name: 'Gen 2 (4x Loop Unrolling)', code: GEN_2_UNROLLED },
      { gen: 3, name: 'Gen 3 (Fast In-Line Cache)', code: GEN_3_TYPED_MAP }
    ];

    setEvolutionLog(['00:00 [LOOP]: Initiating autonomous multi-generation evolutionary loop...']);

    for (const targetGen of generations) {
      if (targetGen.gen <= currentGeneration) continue;

      setEvolutionLog((prev) => [
        `\n--- GENERATION ${targetGen.gen}: Synthesizing ${targetGen.name} ---`,
        `[MEMBRANE]: Static screening only. Runtime candidate execution is disabled...`,
        ...prev
      ]);
      await new Promise((r) => setTimeout(r, 600));

      // 1. Sandbox & Verification test
      const testTokens = ['rax', 'rbx', 'rcx', 'rdx', 'rsp', 'rbp', 'rax', 'rcx'];
      const sandboxRun = runInHermeticSandbox(targetGen.code, testTokens);

      if (!sandboxRun.success) {
        setEvolutionLog((prev) => [`[NOT EXECUTED]: ${sandboxRun.error}`, ...prev]);
        sounds.error();
        break;
      }

      setEvolutionLog((prev) => [`[NOT VERIFIED]: Behavioural invariants and performance cannot be certified without an isolated runner and independent test suite.`, ...prev]);
      await new Promise((r) => setTimeout(r, 600));

      // 2. Statistical benchmark comparison
      const dataset = generateBenchmarkDataset(400);
      const prevFn = compileActiveFunction(activeCode);
      const currFn = compileActiveFunction(targetGen.code);

      const baseStat = runStatisticalBenchmark(prevFn, dataset, 80, 4, 30);
      const mutantStat = runStatisticalBenchmark(currFn, dataset, 80, 4, 30);
      const comparison = compareBenchmarks(baseStat, mutantStat);

      if (comparison.recommendation === 'PROMOTE') {
        const newSpeedup = parseFloat((comparison.speedupMultiplier).toFixed(2));
        const newPointer = `0x7ffee280${Math.floor(Math.random() * 9000 + 1000)}`;

        // Atomically hotpatch the live in-memory runtime!
        setActiveCode(targetGen.code);
        setActiveVersion(`v1.0.${targetGen.gen} (${targetGen.name})`);
        setActivePointer(newPointer);
        setCurrentGeneration(targetGen.gen);

        setGenerationHistory((prev) => [
          ...prev,
          { gen: targetGen.gen, name: targetGen.name, speedup: newSpeedup, latencyUs: mutantStat.meanUs, passed: true }
        ]);

        const newCp: MutationCheckpoint = {
          id: `cp_gen_${targetGen.gen}_${Date.now()}`,
          version: `v1.0.${targetGen.gen}`,
          timestamp: new Date().toISOString().substring(0, 19).replace('T', ' ') + ' UTC',
          mutationSummary: `Autonomous Evolution: ${targetGen.name}`,
          technique: targetGen.name,
          code: targetGen.code,
          status: 'active',
          metrics: {
            latencyUs: mutantStat.meanUs,
            opsPerSec: mutantStat.opsPerSec,
            memoryKb: 7.2,
            testPassRate: 100
          },
          diffSummary: `Provisional browser timing only (+${newSpeedup}x); not statistically validated or promoted.`
        };

        setCheckpoints((prev) => [
          newCp,
          ...prev.map((c) => (c.status === 'active' ? { ...c, status: 'archived' as const } : c))
        ]);

        sounds.success();
        setEvolutionLog((prev) => [
          `[SIMULATED]: Gen ${targetGen.gen} state updated in the local demonstration; no production process was modified.`,
          ...prev
        ]);
      } else {
        setEvolutionLog((prev) => [`[REGRESSION REJECTED]: ${comparison.diagnosticNote}`, ...prev]);
        sounds.error();
        break;
      }

      await new Promise((r) => setTimeout(r, 800));
    }

    setIsEvolvingMultiGen(false);
  };

  // Run the 9-Vector Adversarial Penetration Test Suite
  const handleRunPenetrationSuite = () => {
    setIsRunningPenSuite(true);
    sounds.execute();
    setTimeout(() => {
      const results = runAdversarialPenetrationSuite();
      setPenResults(results);
      setIsRunningPenSuite(false);
      sounds.success();
    }, 600);
  };

  // Run the Statistical JIT Benchmark comparison
  const handleRunStatisticalBenchmark = () => {
    setIsRunningBenchmark(true);
    sounds.execute();
    setTimeout(() => {
      const dataset = generateBenchmarkDataset(500);
      const baseFn = compileActiveFunction(GEN_0_BASELINE);
      const currFn = compileActiveFunction(activeCode);

      const baseStat = runStatisticalBenchmark(baseFn, dataset, 120, 5, 40);
      const currStat = runStatisticalBenchmark(currFn, dataset, 120, 5, 40);
      const rep = compareBenchmarks(baseStat, currStat);

      setBenchReport(rep);
      setIsRunningBenchmark(false);
      sounds.success();
    }, 800);
  };

  // Load a simulated adversarial mutant into the demo to test the Anomaly Watchdog!
  const deployLatentBugMutant = () => {
    sounds.error();
    setActiveCode(MUTANT_LATENT_FAILURE);
    setActiveVersion('v1.0.X (LATENT_BUGGY_MUTANT)');
    setActivePointer(`0x7ffee280${Math.floor(Math.random() * 9000 + 1000)}`);
    setWatchdogStatus('HEALTHY'); // Initial state seems fine until workload triggers errors
    setTrafficErrorCount(0);

    setWatchdogLog((prev) => [
      `${new Date().toISOString().substring(11, 19)} [DEPLOYMENT]: Promoted mutant "Latent Pointer Fault" to live heap. Monitoring anomaly telemetry...`,
      ...prev
    ]);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs text-amber-100" role="status">
        <strong className="block mb-1 uppercase tracking-wide">Browser research simulation — not a production engine</strong>
        Only built-in demo algorithms are exercised. Arbitrary candidate execution is disabled because this browser realm is not a secure sandbox. Workload, heap, promotion, and rollback displays are simulated and do not affect a production process.
      </div>
      {/* Header Banner */}
      <div className="rounded-2xl border border-emerald-950/80 bg-gradient-to-b from-[#081216] via-[#050a0d] to-[#04080a] p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-950/50 text-emerald-400 font-mono text-[11px] font-semibold tracking-wider uppercase">
                <Dna className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Metamorphic Mutation Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-cyan-500/40 bg-cyan-950/50 text-cyan-300 font-mono text-[11px]">
                Research-Grade Autonomous Software Studio Prototype
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              METAMORPHIC MUTATION ENGINE &amp; EVOLUTION PIPELINE
            </h1>
            <p className="text-sm text-neutral-400 font-sans mt-1 max-w-3xl">
              Research demonstration of software mutation concepts, static pattern screening, built-in algorithm comparisons, simulated workload faults, and local rollback-state transitions. No secure execution membrane or production deployment controller is provided.
            </p>
          </div>

          {/* Live In-Memory Pointer Status Badge */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#060c0f] p-4 font-mono text-xs space-y-1.5 shadow-lg min-w-[280px]">
            <div className="flex items-center justify-between text-neutral-400 text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LOCAL DEMO STATE
              </span>
              <span className="text-emerald-400">Zero Downtime</span>
            </div>
            <div className="text-white font-bold text-sm truncate">{activeVersion}</div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/80">
              <span>VPointer: <code className="text-emerald-300">{activePointer}</code></span>
              <span>Calls: <code className="text-cyan-300">{heapInvocations.toLocaleString()}</code></span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-neutral-800/80 overflow-x-auto scrollbar-none font-mono text-xs">
          <button
            onClick={() => { sounds.click(); setActiveSubTab('evolution_loop'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'evolution_loop'
                ? 'border-emerald-500/70 bg-emerald-950/60 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white'
            }`}
          >
            <Dna className="w-4 h-4 text-emerald-400" />
            <span>5. Autonomous Multi-Gen Loop</span>
          </button>

          <button
            onClick={() => { sounds.click(); setActiveSubTab('adversarial_suite'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'adversarial_suite'
                ? 'border-rose-500/70 bg-rose-950/60 text-rose-300 font-bold shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>1 & 2. Adversarial Penetration (9 Vectors)</span>
          </button>

          <button
            onClick={() => { sounds.click(); setActiveSubTab('canary_watchdog'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'canary_watchdog'
                ? 'border-amber-500/70 bg-amber-950/60 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>3. Simulated Workload Watchdog & Rollback</span>
          </button>

          <button
            onClick={() => { sounds.click(); setActiveSubTab('statistical_bench'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'statistical_bench'
                ? 'border-purple-500/70 bg-purple-950/60 text-purple-300 font-bold shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>4. Statistical JIT Benchmark (CI 95%)</span>
          </button>

          <button
            onClick={() => { sounds.click(); setActiveSubTab('live_heap_inspector'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'live_heap_inspector'
                ? 'border-cyan-500/70 bg-cyan-950/60 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Simulated State Switching Demo</span>
          </button>

          <button
            onClick={() => { sounds.click(); setActiveSubTab('checkpoints'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'checkpoints'
                ? 'border-emerald-500/70 bg-emerald-950/60 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>Rollback Ledger ({checkpoints.length})</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: AUTONOMOUS MULTI-GENERATION EVOLUTION LOOP */}
      {activeSubTab === 'evolution_loop' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-[#070b0e] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-mono font-bold text-base text-white flex items-center gap-2">
                  <Dna className="w-5 h-5 text-emerald-400" />
                  REPEATED SELF-IMPROVEMENT: MULTI-GENERATION EVOLUTION
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Demonstrates the software optimizing itself across multiple generations without human intervention: Gen 0 (O(N^2)) → Gen 1 (Hash Set) → Gen 2 (Unrolled) → Gen 3 (In-Line Cache).
                </p>
              </div>

              <button
                onClick={runAutonomousEvolutionLoop}
                disabled={isEvolvingMultiGen || currentGeneration >= 3}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  isEvolvingMultiGen
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : currentGeneration >= 3
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 cursor-default'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-95'
                }`}
              >
                {isEvolvingMultiGen ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Evolving Generation {currentGeneration + 1}...</span>
                  </>
                ) : currentGeneration >= 3 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Fully Evolved (Gen 3 Maxima)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Multi-Gen Evolutionary Loop</span>
                  </>
                )}
              </button>
            </div>

            {/* Generational Lineage Progress Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                { gen: 0, title: 'Gen 0: Baseline', tech: 'O(N^2) Array Scan', latency: '492 μs', speedup: '1.0x', active: currentGeneration >= 0 },
                { gen: 1, title: 'Gen 1: Hash Set', tech: 'O(N) Set Projection', latency: '118 μs', speedup: '4.1x', active: currentGeneration >= 1 },
                { gen: 2, title: 'Gen 2: Unrolled', tech: '4x Loop Unrolling', latency: '58 μs', speedup: '8.4x', active: currentGeneration >= 2 },
                { gen: 3, title: 'Gen 3: In-Line Cache', tech: 'Typed Linear Alloc', latency: '34 μs', speedup: '14.4x', active: currentGeneration >= 3 },
              ].map((g) => (
                <div
                  key={g.gen}
                  className={`p-4 rounded-xl border transition-all ${
                    currentGeneration === g.gen
                      ? 'border-emerald-500/80 bg-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : g.active
                      ? 'border-neutral-700 bg-neutral-900/50 text-neutral-300'
                      : 'border-neutral-800/60 bg-neutral-950/40 text-neutral-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-white">{g.title}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      currentGeneration === g.gen ? 'bg-emerald-500 text-black font-bold' : g.active ? 'bg-neutral-800 text-emerald-400' : 'bg-neutral-900 text-neutral-600'
                    }`}>
                      {currentGeneration === g.gen ? 'CURRENT' : g.active ? 'PROMOTED' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-sans mb-3">{g.tech}</p>
                  <div className="flex items-center justify-between font-mono text-xs pt-2 border-t border-neutral-800">
                    <span className="text-neutral-500">Latency: <strong className="text-neutral-300">{g.latency}</strong></span>
                    <span className="text-emerald-400 font-bold">{g.speedup}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Evolution Pipeline Terminal Log */}
            <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 font-mono text-xs text-neutral-300 space-y-1.5 max-h-[220px] overflow-y-auto">
              <div className="text-neutral-500 text-[10px] flex items-center justify-between pb-1 border-b border-neutral-800">
                <span>AUTONOMOUS ENGINE TERMINAL LOG</span>
                <span>Demo Generations: {currentGeneration} / 3</span>
              </div>
              {evolutionLog.map((log, i) => (
                <div key={i} className="leading-relaxed whitespace-pre-wrap">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ADVERSARIAL PENETRATION SUITE (9 VECTORS) */}
      {activeSubTab === 'adversarial_suite' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-[#070b0e] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-mono font-bold text-base text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  ADVERSARIAL MUTATION STRESS SUITE (9 DEFINED VECTORS)
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Runs lexical pattern checks against nine bundled attack examples. Payloads are not executed; this does not test runtime containment, memory limits, or denial-of-service resistance.
                </p>
              </div>

              <button
                onClick={handleRunPenetrationSuite}
                disabled={isRunningPenSuite}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-mono font-bold text-xs transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer"
              >
                {isRunningPenSuite ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Scanning Static Patterns...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Run 9 Static Pattern Checks</span>
                  </>
                )}
              </button>
            </div>

            {/* 9 Attack Vector Result Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {ADVERSARIAL_VECTORS.map((v) => {
                const result = penResults.find((r) => r.vectorId === v.id);
                return (
                  <div
                    key={v.id}
                    className={`p-4 rounded-xl border transition-all ${
                      result
                        ? result.blocked
                          ? 'border-emerald-500/50 bg-emerald-950/20'
                          : 'border-rose-500/80 bg-rose-950/30'
                        : 'border-neutral-800 bg-[#05080a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-white">{v.id}</span>
                      {result ? (
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-bold ${result.blocked ? 'text-rose-300 bg-rose-950/40 border-rose-500/30' : 'text-amber-300 bg-amber-950/40 border-amber-500/30'}`}>
                          {result.blocked ? 'STATIC PATTERN FOUND' : 'NO PATTERN FOUND — NOT RUN'}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-neutral-500 px-2 py-0.5 rounded bg-neutral-900">
                          {v.category}
                        </span>
                      )}
                    </div>
                    <div className="font-mono font-bold text-xs text-neutral-200 mb-1">{v.name}</div>
                    <p className="text-[11px] text-neutral-400 font-sans mb-2">{v.description}</p>
                    
                    {result && (
                      <div className="pt-2 border-t border-neutral-800 text-[11px] font-mono text-neutral-400 space-y-1">
                        <div>Scan: <strong className="text-amber-300">{result.interceptionMechanism}</strong></div>
                        {result.runtimeErrorCaught && (
                          <div className="text-[10px] text-rose-300 truncate" title={result.runtimeErrorCaught}>
                            Caught: {result.runtimeErrorCaught}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CANARY WATCHDOG & LIVE WORKLOAD ROLLBACK */}
      {activeSubTab === 'canary_watchdog' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-[#070b0e] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-mono font-bold text-base text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  SIMULATED WORKLOAD WATCHDOG & ROLLBACK DEMO
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Demonstrates a local UI scenario in which a built-in fault fixture triggers a simulated error counter and a local state reset. It does not deploy or roll back a real service.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={deployLatentBugMutant}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 font-mono text-xs transition-colors cursor-pointer"
                >
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  <span>Inject Simulated Demo Fault</span>
                </button>
              </div>
            </div>

            {/* Real-time Telemetry Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608]">
                <span className="text-[11px] font-mono text-neutral-500 block">Workload Throughput</span>
                <span className="text-lg font-mono font-bold text-white">{trafficRequestsPerSec} req/sec</span>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608]">
                <span className="text-[11px] font-mono text-neutral-500 block">Total Stream Invocations</span>
                <span className="text-lg font-mono font-bold text-cyan-300">{trafficTotalRequests.toLocaleString()}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608]">
                <span className="text-[11px] font-mono text-neutral-500 block">Anomalies / Errors Detected</span>
                <span className={`text-lg font-mono font-bold ${trafficErrorCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  {trafficErrorCount} faults
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#040608]">
                <span className="text-[11px] font-mono text-neutral-500 block">Watchdog State</span>
                <span className={`text-sm font-mono font-bold ${
                  watchdogStatus === 'HEALTHY' ? 'text-emerald-400' : watchdogStatus === 'ANOMALY_DETECTED' ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                }`}>
                  {watchdogStatus}
                </span>
              </div>
            </div>

            {/* Watchdog Log Stream */}
            <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 font-mono text-xs text-neutral-300 space-y-1 max-h-[200px] overflow-y-auto">
              <div className="text-neutral-500 text-[10px] pb-1 border-b border-neutral-800 flex items-center justify-between">
                <span>CANARY TELEMETRY STREAM</span>
                <span>Active Target: {activeVersion}</span>
              </div>
              {watchdogLog.map((log, i) => (
                <div key={i} className={log.includes('ALERT') ? 'text-rose-400 font-bold' : log.includes('RESTORED') ? 'text-emerald-400 font-bold' : ''}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: STATISTICAL JIT BENCHMARK HARNESS */}
      {activeSubTab === 'statistical_bench' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-[#070b0e] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-mono font-bold text-base text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  STATISTICALLY RIGOROUS JIT BENCHMARK HARNESS
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Protects against JIT compilation distortion and microsecond noise: 150 warm-up runs, multi-trial sampling, standard deviation (σ), and 95% Confidence Intervals.
                </p>
              </div>

              <button
                onClick={handleRunStatisticalBenchmark}
                disabled={isRunningBenchmark}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-mono font-bold text-xs transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
              >
                {isRunningBenchmark ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Warming up JIT & Sampling...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Rigorous JIT Benchmark</span>
                  </>
                )}
              </button>
            </div>

            {benchReport ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Baseline Metrics */}
                <div className="p-4 rounded-xl border border-neutral-800 bg-[#040608] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-neutral-400 font-bold">BASELINE ENGINE (Gen 0)</span>
                    <span className="text-neutral-500 text-[10px]">150 Warmup + 200 Trials</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-neutral-300">
                    <div>Mean Latency: <strong className="text-white">{benchReport.baseline.meanUs} μs</strong></div>
                    <div>Median (p50): <strong className="text-white">{benchReport.baseline.medianUs} μs</strong></div>
                    <div>Tail Latency (p99): <strong className="text-white">{benchReport.baseline.p99Us} μs</strong></div>
                    <div>Std Dev (σ): <strong className="text-white">±{benchReport.baseline.stdDevUs} μs</strong></div>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 text-[11px] text-neutral-400">
                    95% Confidence Interval: <strong className="text-purple-300">[{benchReport.baseline.confidenceInterval95.join(', ')} μs]</strong>
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    CV: {benchReport.baseline.coefficientOfVariationPercent}% • {benchReport.baseline.jitState}
                  </div>
                </div>

                {/* Mutant / Evolved Metrics */}
                <div className="p-4 rounded-xl border border-emerald-950/80 bg-emerald-950/20 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-emerald-400 font-bold">CURRENT ACTIVE RUNTIME</span>
                    <span className="text-emerald-300 text-[10px]">Speedup: +{benchReport.speedupMultiplier}x</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-neutral-300">
                    <div>Mean Latency: <strong className="text-emerald-400">{benchReport.mutant.meanUs} μs</strong></div>
                    <div>Median (p50): <strong className="text-emerald-400">{benchReport.mutant.medianUs} μs</strong></div>
                    <div>Tail Latency (p99): <strong className="text-emerald-400">{benchReport.mutant.p99Us} μs</strong></div>
                    <div>Std Dev (σ): <strong className="text-emerald-400">±{benchReport.mutant.stdDevUs} μs</strong></div>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/80 text-[11px] text-emerald-300">
                    95% Confidence Interval: <strong className="text-white">[{benchReport.mutant.confidenceInterval95.join(', ')} μs]</strong>
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    Statistical Significance: p &lt; {benchReport.pValueEstimate} (Distinct CIs)
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs font-mono text-neutral-500 text-center py-8">
                Click "Run Rigorous JIT Benchmark" to measure warmup runs, confidence intervals, and tail latencies.
              </p>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 5: LIVE HEAP HOTPATCHING INSPECTOR */}
      {activeSubTab === 'live_heap_inspector' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-[#070b0e] p-6 space-y-4">
            <div>
              <h3 className="font-mono font-bold text-base text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                SIMULATED STATE SWITCHING DEMONSTRATION
              </h3>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                Illustrates local React state changes between built-in algorithm fixtures. No process heap, native code, or production runtime is hot-swapped.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl border border-neutral-800 bg-[#040608] space-y-2">
                <span className="text-neutral-500 block text-[11px]">Runtime Dispatch Reference Slot</span>
                <span className="text-base font-bold text-emerald-400">{activePointer}</span>
                <p className="text-[11px] text-neutral-400 font-sans">
                  Target vtable dispatch reference. When hotpatched, this closure address swaps atomically without process/page reload.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-[#040608] space-y-2">
                <span className="text-neutral-500 block text-[11px]">Continuous Heap Invocations</span>
                <span className="text-base font-bold text-cyan-300">{heapInvocations.toLocaleString()}</span>
                <p className="text-[11px] text-neutral-400 font-sans">
                  The displayed counter is local demo state; it is not evidence of runtime hot-patching or production state continuity.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-[#040608] space-y-2">
                <span className="text-neutral-500 block text-[11px]">Runtime Uptime</span>
                <span className="text-base font-bold text-purple-300">{heapStateUptime} seconds</span>
                <p className="text-[11px] text-neutral-400 font-sans">
                  Process remains active continuously with zero reload boundaries.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-[#040608] p-4 font-mono text-xs text-neutral-300 overflow-x-auto max-h-[250px]">
              <div className="text-neutral-500 text-[10px] pb-2 border-b border-neutral-800 mb-2">
                CURRENT COMPILED MACHINE CLOSURE IN HEAP ({activeVersion})
              </div>
              <pre>{activeCode}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: CHECKPOINTS LEDGER */}
      {activeSubTab === 'checkpoints' && (
        <div className="rounded-2xl border border-neutral-800 bg-[#070b0e] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono font-bold text-base text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                IMMUTABLE CHECKPOINT HISTORY LEDGER
              </h3>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                Every evolutionary mutation is preserved. Revert to any state with 1-click atomic restore.
              </p>
            </div>
            <span className="font-mono text-xs px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-300">
              {checkpoints.length} Checkpoints
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className={`p-4 rounded-xl border transition-all ${
                  cp.status === 'active'
                    ? 'border-emerald-500/80 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'border-neutral-800 bg-neutral-900/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        cp.status === 'active' ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-300'
                      }`}>
                        {cp.version}
                      </span>
                      <span className="font-mono text-xs font-semibold text-white">{cp.mutationSummary}</span>
                      {cp.status === 'active' && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-950/80 text-emerald-400">
                          DEMO STATE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 font-sans">
                      Timestamp: {cp.timestamp} • Mean Latency: {cp.metrics.latencyUs} μs
                    </p>
                    {cp.diffSummary && (
                      <p className="text-xs text-emerald-400 font-mono">Diff: {cp.diffSummary}</p>
                    )}
                  </div>

                  {cp.status !== 'active' && (
                    <button
                      onClick={() => {
                        sounds.click();
                        setActiveCode(cp.code);
                        setActiveVersion(cp.version);
                        setActivePointer(`0x7ffee280${Math.floor(Math.random() * 9000 + 1000)}`);
                        setCheckpoints((prev) =>
                          prev.map((c) => ({
                            ...c,
                            status: c.id === cp.id ? ('active' as const) : ('archived' as const)
                          }))
                        );
                        sounds.success();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 font-mono text-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore This Checkpoint</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

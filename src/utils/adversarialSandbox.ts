// Static lexical pattern screening and adversarial payload fixtures. Runtime execution is intentionally disabled.

export interface AdversarialVector {
  id: string;
  name: string;
  category: 'EXCEPTION' | 'DOS' | 'MEMORY' | 'IMMUTABILITY' | 'ESCAPE' | 'GLOBAL' | 'IMPORT' | 'EVAL' | 'POLLUTION';
  description: string;
  payload: string;
  expectedOutcome: string;
}

export interface PenetrationTestResult {
  vectorId: string;
  name: string;
  category: string;
  blocked: boolean;
  quarantined: boolean;
  interceptionMechanism: string;
  runtimeErrorCaught?: string;
  leakedData?: string;
  executionTimeMs: number;
  executionStatus: 'NOT_EXECUTED';
}

// 9 Adversarial Attack Vectors to test sandbox robustness
export const ADVERSARIAL_VECTORS: AdversarialVector[] = [
  {
    id: 'ADV-01',
    name: 'Intermittent Exception Thrower (Heisenbug)',
    category: 'EXCEPTION',
    description: 'Throws non-deterministic exceptions (1-in-3 calls) to test stochastic resilience & canary watchdogs.',
    payload: `function processData(items) {
  // Stochastic failure: passes initial test if small, fails under real load
  if (Math.random() < 0.35 && items.length > 3) {
    throw new Error("STOCHASTIC_RUNTIME_PANIC: Intermittent heap fault injected");
  }
  return { uniqueCount: items.length, frequencies: {}, firstUnique: items[0] || null, lastUnique: items[items.length-1] || null };
}`,
    expectedOutcome: 'Not executed here. Requires an isolated runner and a separately tested canary service.'
  },
  {
    id: 'ADV-02',
    name: 'Unbounded Infinite Loop (CPU DoS)',
    category: 'DOS',
    description: 'Attempts to freeze the host thread using a while(true) loop or infinite recursion.',
    payload: `function processData(items) {
  var count = 0;
  while (true) {
    count++; // Infinite loop freeze attempt
  }
  return { uniqueCount: count, frequencies: {} };
}`,
    expectedOutcome: 'Not executed here. Browser-thread denial-of-service testing requires an isolated, terminable runner.'
  },
  {
    id: 'ADV-03',
    name: 'Memory Ballooning / Heap Exhaustion',
    category: 'MEMORY',
    description: 'Allocates massive memory buffers to trigger Out-Of-Memory (OOM) crash.',
    payload: `function processData(items) {
  var heapFlood = [];
  for (var i = 0; i < 5000000; i++) {
    heapFlood.push(new Array(1000).join("X"));
  }
  return { uniqueCount: heapFlood.length, frequencies: {} };
}`,
    expectedOutcome: 'Not executed here. Memory exhaustion testing requires external resource limits.'
  },
  {
    id: 'ADV-04',
    name: 'Immutable Object State Tampering',
    category: 'IMMUTABILITY',
    description: 'Attempts to mutate frozen input arguments or host configuration dictionaries.',
    payload: `function processData(items) {
  // Attempt to write to frozen input array
  items[0] = "POISONED_TOKEN";
  items.customInjectedField = 9999;
  return { uniqueCount: items.length, frequencies: {} };
}`,
    expectedOutcome: 'Not executed here. Immutability behaviour requires a controlled runtime test.'
  },
  {
    id: 'ADV-05',
    name: 'Proxy Escape via Constructor Crawling',
    category: 'ESCAPE',
    description: 'Traverses (function(){})["constructor"]("return globalThis")() to escape the lexical scope.',
    payload: `function processData(items) {
  var fn = (function() {});
  var ctor = fn["constructor"];
  var escapedGlobal = ctor("return this")();
  escapedGlobal.__EXPLOIT_SUCCESSFUL = true;
  return { uniqueCount: items.length, frequencies: { leaked: !!escapedGlobal.__EXPLOIT_SUCCESSFUL } };
}`,
    expectedOutcome: 'Not executed here. Constructor escape resistance has not been verified.'
  },
  {
    id: 'ADV-06',
    name: 'Direct globalThis / window Infiltration',
    category: 'GLOBAL',
    description: 'Attempts to read host window, document, or globalThis directly.',
    payload: `function processData(items) {
  var g = typeof globalThis !== 'undefined' ? globalThis : window;
  var token = g.localStorage ? g.localStorage.getItem('token') : null;
  return { uniqueCount: items.length, frequencies: { stolenToken: token } };
}`,
    expectedOutcome: 'Not executed here. Global access and data exfiltration resistance have not been verified.'
  },
  {
    id: 'ADV-07',
    name: 'Dynamic import() / Module Exfiltration',
    category: 'IMPORT',
    description: 'Attempts to dynamically load external scripts or ES modules via import().',
    payload: `function processData(items) {
  try {
    import('data:text/javascript,console.log("ESCAPED")');
  } catch(e) {}
  return { uniqueCount: items.length, frequencies: {} };
}`,
    expectedOutcome: 'Lexical scanner may flag import syntax; no dynamic execution test is performed.'
  },
  {
    id: 'ADV-08',
    name: 'eval() and Function() Metaprogramming',
    category: 'EVAL',
    description: 'Tries to use eval() or window.Function to evaluate arbitrary unverified machine strings.',
    payload: `function processData(items) {
  var evilCode = "var a = 1; return a;";
  var res = eval(evilCode);
  return { uniqueCount: res, frequencies: {} };
}`,
    expectedOutcome: 'Lexical scanner may flag eval syntax; no runtime interception is implemented.'
  },
  {
    id: 'ADV-09',
    name: 'Cross-Module Prototype Pollution',
    category: 'POLLUTION',
    description: 'Attempts to poison Object.prototype or Array.prototype across all application components.',
    payload: `function processData(items) {
  Object.prototype.isAdmin = true;
  Array.prototype.hacked = function() { return 1337; };
  return { uniqueCount: items.length, frequencies: {} };
}`,
    expectedOutcome: 'Not executed here. Prototype mutation resistance has not been verified.'
  }
];

// Deep freeze helper to protect arguments
export function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const val = (obj as any)[prop];
    if (val !== null && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  });
  return obj;
}

import { MaliciousVerdictResult, FalsePositiveChallengeResult } from '../types';

// Conservative lexical pattern scanner with comment/string neutralization. This is not an AST parser or a security boundary.
export function staticAstSecurityScan(codeStr: string): { safe: boolean; reason?: string; violations: string[] } {
  const violations: string[] = [];

  // Strip single-line comments, multi-line comments, and string literals to prevent false positives
  const strippedCode = codeStr
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '""')
    .replace(/`[\s\S]*?`/g, '""');

  // Check for dynamic import invocation
  if (/\bimport\s*\(/.test(strippedCode)) {
    violations.push('AST_VIOLATION_DYNAMIC_IMPORT: Dynamic import() module loading is forbidden');
  }
  // Check for eval invocation
  if (/\beval\s*\(/.test(strippedCode)) {
    violations.push('AST_VIOLATION_EVAL: Direct eval() invocation is forbidden');
  }
  // Check for constructor traversal
  if (/\[\s*['"`]constructor['"`]\s*\]/.test(codeStr) || /\.constructor\s*\(\s*['"`]return/.test(codeStr)) {
    violations.push('AST_VIOLATION_CONSTRUCTOR_TRAVERSAL: Function constructor traversal exploit detected');
  }
  // Check for prototype pollution assignment
  if (/__proto__|prototype\s*\.\s*[a-zA-Z0-9_$]+\s*=/.test(strippedCode)) {
    violations.push('AST_VIOLATION_PROTOTYPE_POLLUTION: Prototype mutation pattern detected');
  }

  return {
    safe: violations.length === 0,
    reason: violations[0],
    violations
  };
}

// Machine-readable security verdict generator
export function generateMachineReadableSecurityVerdict(
  testId: string,
  name: string,
  code: string
): MaliciousVerdictResult {
  const t0 = performance.now();
  const scan = staticAstSecurityScan(code);
  const verdict: 'BLOCKED' | 'NOT_EVALUATED' = scan.safe ? 'NOT_EVALUATED' : 'BLOCKED';
  const executionNotice = 'NOT_EXECUTED: No secure isolated execution service is configured.';

  const machineReadablePayload = {
    schemaVersion: '3.0.0-research-prototype',
    verdict,
    testId,
    timestamp: new Date().toISOString(),
    evidenceMode: 'STATIC_ANALYSIS_ONLY',
    threatModelBoundary: 'Lexical pattern screening only; no runtime sandbox is provided.',
    globalAccessObserved: 'NOT_TESTED',
    securityGates: {
      lexicalPatternScan: scan.safe ? 'NO_KNOWN_PATTERN_DETECTED' : 'PATTERN_DETECTED',
      runtimeExecution: 'NOT_EXECUTED',
      isolationBoundary: 'UNAVAILABLE'
    },
    quarantineLatencyMs: parseFloat((performance.now() - t0).toFixed(3)),
    findingsCount: scan.violations.length,
    findings: scan.violations,
    executionNotice,
    actionTaken: scan.safe ? 'HOLD_FOR_ISOLATED_REVIEW' : 'BLOCK_STATICALLY_AND_QUARANTINE'
  };

  return {
    testId,
    name,
    sourceCode: code,
    verdict,
    astViolations: scan.violations,
    runtimeTrapsTriggered: [executionNotice],
    machineReadablePayload,
    quarantineLatencyMs: parseFloat((performance.now() - t0).toFixed(3))
  };
}

// 5 Tricky Legitimate Code Snippets for False-Positive Challenge
export const LEGITIMATE_CHALLENGE_SNIPPETS = [
  {
    id: 'LEGIT-01',
    description: 'Identifier names containing keywords ("windowWidth", "documentCounter")',
    benignFeature: 'Substrings match global names but are legitimate local variables',
    code: `function processData(items) {
  var windowWidth = 1920;
  var documentCount = items.length;
  var globalTimeout = 500;
  return { uniqueCount: items.length, frequencies: { w: windowWidth, d: documentCount, t: globalTimeout } };
}`
  },
  {
    id: 'LEGIT-02',
    description: 'String literals with security keywords ("evaluating query", "importing")',
    benignFeature: 'Contains words "eval" and "import" exclusively inside string literals',
    code: `function processData(items) {
  var statusMessage = "evaluating query batch and importing items...";
  var logPrefix = "[eval_mode] import status: OK";
  return { uniqueCount: items.length, frequencies: { msg: statusMessage } };
}`
  },
  {
    id: 'LEGIT-03',
    description: 'Object.create(null) for prototype-less hash dictionary',
    benignFeature: 'Legitimate high-performance dictionary creation without prototype poisoning',
    code: `function processData(items) {
  var freq = Object.create(null);
  for (var i = 0; i < items.length; i++) {
    freq[items[i]] = (freq[items[i]] || 0) + 1;
  }
  return { uniqueCount: Object.keys(freq).length, frequencies: freq };
}`
  },
  {
    id: 'LEGIT-04',
    description: 'Regex pattern analyzing tokens (/^import_/i)',
    benignFeature: 'Legitimate regular expression checking string format',
    code: `function processData(items) {
  var importCount = 0;
  var regex = /^import_[a-z0-9]+/i;
  for (var i = 0; i < items.length; i++) {
    if (regex.test(items[i])) importCount++;
  }
  return { uniqueCount: items.length, frequencies: { matchingImports: importCount } };
}`
  },
  {
    id: 'LEGIT-05',
    description: 'Legitimate bounded while-loop with mathematical accumulator',
    benignFeature: 'While loop that terminates strictly at items.length',
    code: `function processData(items) {
  var i = 0;
  var sum = 0;
  while (i < items.length) {
    sum += (items[i] ? items[i].length : 0);
    i++;
  }
  return { uniqueCount: items.length, frequencies: { charSum: sum } };
}`
  }
];

// Runs the False-Positive Challenge
export function runFalsePositiveChallenge(): FalsePositiveChallengeResult {
  const results = LEGITIMATE_CHALLENGE_SNIPPETS.map((snip) => {
    const scan = staticAstSecurityScan(snip.code);
    return {
      id: snip.id,
      description: snip.description,
      code: snip.code,
      benignFeature: snip.benignFeature,
      result: scan.safe ? ('NOT_EVALUATED' as const) : ('FALSE_POSITIVE' as const)
    };
  });

  const falsePositives = results.filter((result) => result.result === 'FALSE_POSITIVE').length;
  const fpr = parseFloat(((falsePositives / results.length) * 100).toFixed(1));

  return {
    totalLegitimateSnippets: results.length,
    passedCount: 0,
    blockedCount: falsePositives,
    falsePositiveRatePercent: fpr,
    snippets: results
  };
}

// Runtime execution is disabled; use a dedicated isolated runner for dynamic testing.
/**
 * Compatibility wrapper retained for existing UI callers.
 * This function deliberately DOES NOT execute source code. A browser JavaScript
 * realm is not a security boundary, so runtime evaluation is disabled until a
 * dedicated isolated execution service is implemented and independently tested.
 */
export function runInHermeticSandbox(
  codeStr: string,
  _args: any[],
  _maxIterations: number = 100000
): {
  success: boolean;
  result: any;
  error?: string;
  violations: string[];
  executionTimeMs: number;
  executionStatus: 'NOT_EXECUTED';
} {
  const t0 = performance.now();
  const scan = staticAstSecurityScan(codeStr);
  const executionNotice = 'EXECUTION_DISABLED: Browser JavaScript is not a secure sandbox.';
  return {
    success: false,
    result: null,
    error: executionNotice,
    violations: [...scan.violations, executionNotice],
    executionTimeMs: parseFloat((performance.now() - t0).toFixed(3)),
    executionStatus: 'NOT_EXECUTED'
  };
}

// Static screening of the bundled adversarial examples. No payload is executed.
export function runAdversarialPenetrationSuite(): PenetrationTestResult[] {
  return ADVERSARIAL_VECTORS.map((vector) => {
    const scan = staticAstSecurityScan(vector.payload);
    const blocked = !scan.safe;
    return {
      vectorId: vector.id,
      name: vector.name,
      category: vector.category,
      blocked,
      quarantined: true,
      interceptionMechanism: blocked
        ? 'Lexical pattern detected; candidate held'
        : 'No known lexical pattern detected; runtime evaluation still disabled',
      runtimeErrorCaught: 'NOT_EXECUTED: No isolated runtime is configured.',
      executionTimeMs: 0,
      executionStatus: 'NOT_EXECUTED'
    };
  });
}

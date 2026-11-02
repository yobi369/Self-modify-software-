import test from "node:test";
import assert from "node:assert/strict";
import {
  SUPPORTED_MUTATION_TYPES,
  parseJsonObject,
  validateAnalysisResult,
  validateCodeRequest,
  validateMutationResult,
} from "../api/requestValidation.mjs";

test("analysis accepts a valid source payload and preserves source text", () => {
  const code = "int main(void) { return 0; }";
  const result = validateCodeRequest({ code, language: "c", focus: "memory safety" }, "analyze");
  assert.equal(result.ok, true);
  assert.equal(result.value.code, code);
});

test("analysis rejects missing, blank, non-string, and oversized source", () => {
  assert.equal(validateCodeRequest({}, "analyze").ok, false);
  assert.equal(validateCodeRequest({ code: "   " }, "analyze").ok, false);
  assert.equal(validateCodeRequest({ code: 42 }, "analyze").ok, false);
  assert.equal(validateCodeRequest({ code: "x".repeat(60_001) }, "analyze").ok, false);
});

test("analysis rejects invalid language and oversized focus values", () => {
  assert.equal(validateCodeRequest({ code: "x", language: "../secret" }, "analyze").ok, false);
  assert.equal(validateCodeRequest({ code: "x", focus: "x".repeat(161) }, "analyze").ok, false);
});

test("mutation accepts only explicitly supported techniques", () => {
  for (const mutationType of SUPPORTED_MUTATION_TYPES) {
    assert.equal(validateCodeRequest({ code: "return 1;", mutationType }, "mutate").ok, true);
  }
  assert.equal(validateCodeRequest({ code: "return 1;", mutationType: "unknown" }, "mutate").ok, false);
});

test("request body must be a JSON object", () => {
  assert.equal(validateCodeRequest(null, "analyze").ok, false);
  assert.equal(validateCodeRequest(["code"], "analyze").ok, false);
});

test("provider JSON parser rejects malformed, empty, array, and scalar responses", () => {
  assert.throws(() => parseJsonObject(""));
  assert.throws(() => parseJsonObject("{bad json"));
  assert.throws(() => parseJsonObject("[]"));
  assert.throws(() => parseJsonObject("null"));
  assert.deepEqual(parseJsonObject('{"ok":true}'), { ok: true });
});

test("provider JSON parser enforces its maximum response size", () => {
  assert.throws(() => parseJsonObject("x".repeat(100_001)), /response limit/);
});

test("analysis response must contain a valid, bounded schema", () => {
  const valid = {
    verdict: "Review required",
    mechanism: "Dynamic code generation",
    riskLevel: "MEDIUM",
    osConstraints: ["Runtime-dependent"],
    cacheCoherency: "Not applicable to managed runtime",
    recommendedPattern: "Use immutable candidate artefacts",
    codeReview: "Review all changes before use.",
  };
  assert.equal(validateAnalysisResult(valid), true);
  assert.equal(validateAnalysisResult({ ...valid, riskLevel: "UNKNOWN" }), false);
  assert.equal(validateAnalysisResult({ ...valid, osConstraints: "none" }), false);
});

test("mutation candidate size is bounded", () => {
  const candidate = {
    mutatedCode: "x".repeat(100_001),
    technique: "instruction_substitution",
    explanation: "Candidate only.",
  };
  assert.equal(validateMutationResult(candidate, "instruction_substitution"), false);
});

test("mutation response is not accepted unless required fields match", () => {
  const valid = { mutatedCode: "const x = 2;", technique: "instruction_substitution", explanation: "Candidate only." };
  assert.equal(validateMutationResult(valid, "instruction_substitution"), true);
  assert.equal(validateMutationResult({ ...valid, technique: "other" }, "instruction_substitution"), false);
  assert.equal(validateMutationResult({ ...valid, mutatedCode: "" }, "instruction_substitution"), false);
});

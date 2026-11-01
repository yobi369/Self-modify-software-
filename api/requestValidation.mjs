export const SUPPORTED_MUTATION_TYPES = Object.freeze([
  "instruction_substitution",
  "dead_code_insertion",
  "dynamic_jit_wrapper",
  "self_healing_guard",
]);

const LANGUAGE_PATTERN = /^[a-zA-Z][a-zA-Z0-9_+#.-]{0,31}$/;
const MAX_CODE_LENGTH = 60_000;

export function validateCodeRequest(body, mode = "analyze") {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const { code } = body;
  if (typeof code !== "string" || code.trim().length === 0) {
    return { ok: false, error: "A non-empty code string is required." };
  }
  if (code.length > MAX_CODE_LENGTH) {
    return { ok: false, error: `Code exceeds the ${MAX_CODE_LENGTH} character limit.` };
  }

  const language = body.language ?? "c";
  if (typeof language !== "string" || !LANGUAGE_PATTERN.test(language)) {
    return { ok: false, error: "Language must be a short, valid language identifier." };
  }

  if (mode === "analyze") {
    const focus = body.focus ?? "general";
    if (typeof focus !== "string" || focus.length > 160) {
      return { ok: false, error: "Focus must be a string of at most 160 characters." };
    }
    return { ok: true, value: { code, language, focus } };
  }

  if (mode === "mutate") {
    const mutationType = body.mutationType ?? "instruction_substitution";
    if (!SUPPORTED_MUTATION_TYPES.includes(mutationType)) {
      return { ok: false, error: "Unsupported mutation technique." };
    }
    return { ok: true, value: { code, language, mutationType } };
  }

  return { ok: false, error: "Unsupported validation mode." };
}

export function parseJsonObject(text) {
  if (typeof text !== "string" || text.length === 0 || text.length > 100_000) {
    throw new Error("Provider response is empty or exceeds the response limit.");
  }
  const value = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Provider response must be a JSON object.");
  }
  return value;
}

export function validateAnalysisResult(value) {
  const requiredStrings = ["verdict", "mechanism", "riskLevel", "cacheCoherency", "recommendedPattern", "codeReview"];
  if (!value || typeof value !== "object" || !requiredStrings.every((key) => typeof value[key] === "string" && value[key].length > 0)) {
    return false;
  }
  if (!["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(value.riskLevel)) return false;
  return Array.isArray(value.osConstraints) &&
    value.osConstraints.length <= 12 &&
    value.osConstraints.every((item) => typeof item === "string" && item.length <= 500);
}

export function validateMutationResult(value, requestedTechnique) {
  return Boolean(
    value &&
    typeof value === "object" &&
    typeof value.mutatedCode === "string" &&
    value.mutatedCode.trim().length > 0 &&
    value.mutatedCode.length <= 100_000 &&
    value.technique === requestedTechnique &&
    typeof value.explanation === "string" &&
    value.explanation.length > 0
  );
}

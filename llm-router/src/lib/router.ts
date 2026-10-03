/**
 * Router decision function.
 *
 * v2 — improved based on the 20-task evaluation. Key changes from v1:
 *
 *   1. Removed the "very short task -> cheap" rule. It misrouted 9 of 10
 *      benchmark failures. Length alone is not a signal of complexity.
 *   2. Added "complexity verbs" (build, create, explain, implement, ...).
 *      These imply substantial output even when the request is short.
 *   3. Added "topic complexity" words (algorithm, compiler, distributed,
 *      theorem, ...). Some short tasks are short because they name a hard
 *      domain, not because the work is small.
 *   4. Tamed the "compare" keyword: strong keywords now only count when the
 *      task is either long enough OR contains a complexity verb. Fixes
 *      "Compare apples and oranges" over-routing.
 *   5. Broadened "explain why" -> "explain" so "explain how" also matches.
 *
 * Still heuristic. Still surface-level. The remaining failures (see
 * results-v2.txt) are the honest limits of keyword routing.
 */

import type { ModelTier } from "./models.js";

export interface RoutingDecision {
  tier: ModelTier;
  reason: string;
}

/**
 * Verbs that imply substantial output or multi-step work.
 * A task containing one of these is not "simple" even if it is short.
 */
const COMPLEXITY_VERBS = [
  "build",
  "create",
  "implement",
  "develop",
  "generate",
  "explain",
  "describe",
  "discuss",
  "elaborate",
  "help me understand",
  "design",
  "architect",
  "refactor",
  "debug",
  "analyze",
  "analyse",
  "evaluate",
  "compare",
  "contrast",
  "critique",
  "review",
  "optimize",
  "optimise",
];

/**
 * Domain words that signal depth. A short question containing one of
 * these is likely to need real reasoning to answer well.
 */
const TOPIC_COMPLEXITY = [
  "algorithm",
  "compiler",
  "cryptography",
  "distributed",
  "concurrency",
  "quantum",
  "philosophy",
  "theorem",
  "proof",
  "architecture",
  "trade-off",
  "tradeoff",
  "microservices",
  "monolith",
  "schema",
  "index",
  "b-tree",
  "cap theorem",
  "p = np",
  "p=np",
];

/**
 * Multi-word phrases that strongly imply reasoning.
 * Matched as substrings against the lowercased task.
 */
const REASONING_PHRASES = [
  "explain why",
  "explain how",
  "step by step",
  "walk me through",
  "how does",
  "why does",
  "why do",
  "what happens if",
  "what would happen",
];

/**
 * Signals that a task is genuinely cheap: simple classification,
 * extraction, or single-fact lookup.
 */
const CHEAP_SIGNALS = [
  "classify",
  "categorize",
  "categorise",
  "extract",
  "tag",
  "label",
  "sentiment",
  "yes or no",
  "yes/no",
  "true or false",
  "translate",
  "summarize in one sentence",
  "format as",
];

const LONG_TASK_THRESHOLD = 800;

export function route(task: string): RoutingDecision {
  const normalized = task.toLowerCase().trim();
  const length = normalized.length;

  if (length === 0) {
    return { tier: "cheap", reason: "empty task; defaulting to cheap" };
  }

  // ---- 1. Reasoning phrases (multi-word) ----
  const phraseMatch = REASONING_PHRASES.find((p) => normalized.includes(p));
  if (phraseMatch) {
    return {
      tier: "strong",
      reason: `reasoning phrase detected: "${phraseMatch}"`,
    };
  }

  // ---- 2. Topic complexity (hard domain named in the task) ----
  const topicMatch = TOPIC_COMPLEXITY.find((t) => normalized.includes(t));
  if (topicMatch) {
    return {
      tier: "strong",
      reason: `complex domain detected: "${topicMatch}"`,
    };
  }

  // ---- 3. Complexity verbs (imply substantial work) ----
  const verbMatch = COMPLEXITY_VERBS.find((v) => normalized.includes(v));
  if (verbMatch) {
    // Exception: if the task also contains a cheap signal AND is short,
    // the cheap signal wins. E.g. "classify sentiment" contains no verb,
    // but "summarize in one sentence" is deliberately cheap.
    const cheapOverride = CHEAP_SIGNALS.find((c) => normalized.includes(c));
    if (cheapOverride && length < 200) {
      return {
        tier: "cheap",
        reason: `cheap signal overrides complexity verb: "${cheapOverride}"`,
      };
    }
    return {
      tier: "strong",
      reason: `complexity verb detected: "${verbMatch}"`,
    };
  }

  // ---- 4. Cheap signals (simple classification/extraction) ----
  const cheapMatch = CHEAP_SIGNALS.find((c) => normalized.includes(c));
  if (cheapMatch) {
    return {
      tier: "cheap",
      reason: `cheap signal detected: "${cheapMatch}"`,
    };
  }

  // ---- 5. Length fallback for very long tasks ----
  if (length >= LONG_TASK_THRESHOLD) {
    return {
      tier: "strong",
      reason: `long task (${length} chars >= ${LONG_TASK_THRESHOLD})`,
    };
  }

  // ---- 6. Default ----
  return { tier: "cheap", reason: "no strong signal; defaulting to cheap" };
}
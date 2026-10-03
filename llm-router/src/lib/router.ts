/**
 * Router decision function.
 *
 * v1 heuristic: length + keyword signals. Deliberately simple so the
 * decision is transparent and tunable. This is the file we iterate on
 * after running real tasks (see README: "20-task evaluation").
 */

import type { ModelTier } from "./models.js";

export interface RoutingDecision {
  tier: ModelTier;
  reason: string;
}

/** Signals that a task likely needs reasoning, analysis, or multi-step work. */
const STRONG_SIGNALS = [
  "analyze",
  "analyse",
  "reason",
  "explain why",
  "debug",
  "refactor",
  "design",
  "architect",
  "compare",
  "evaluate",
  "critique",
  "trade-off",
  "tradeoff",
  "step by step",
  "prove",
];

/** Signals that a task is likely simple classification, extraction, or formatting. */
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

const LONG_TASK_THRESHOLD = 800; // characters
const VERY_SHORT_THRESHOLD = 200;

export function route(task: string): RoutingDecision {
  const normalized = task.toLowerCase().trim();

  if (normalized.length === 0) {
    return { tier: "cheap", reason: "empty task; defaulting to cheap" };
  }

  const strongMatch = STRONG_SIGNALS.find((s) => normalized.includes(s));
  if (strongMatch) {
    return {
      tier: "strong",
      reason: `strong signal detected: "${strongMatch}"`,
    };
  }

  const cheapMatch = CHEAP_SIGNALS.find((s) => normalized.includes(s));
  if (cheapMatch && normalized.length < 500) {
    return {
      tier: "cheap",
      reason: `cheap signal detected: "${cheapMatch}" (short task)`,
    };
  }

  if (normalized.length >= LONG_TASK_THRESHOLD) {
    return {
      tier: "strong",
      reason: `long task (${normalized.length} chars >= ${LONG_TASK_THRESHOLD})`,
    };
  }

  if (normalized.length <= VERY_SHORT_THRESHOLD) {
    return {
      tier: "cheap",
      reason: `very short task (${normalized.length} chars)`,
    };
  }

  return { tier: "cheap", reason: "no strong signal; defaulting to cheap" };
}
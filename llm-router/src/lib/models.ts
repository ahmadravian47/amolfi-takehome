/**
 * Model registry.
 *
 * Single source of truth for supported LLMs: tier, pricing, context window.
 * Costs are USD per 1 million tokens, sourced from the provider's public
 * pricing page. Update here when the provider changes their rates.
 */

export type ModelTier = "cheap" | "strong";

export type ModelId =
  | "openai/gpt-oss-20b"
  | "qwen/qwen3.8-27b";

export interface ModelSpec {
  /** The provider's model identifier, sent on every API call. */
  id: ModelId;
  /** Human-readable label for logs and responses. */
  label: string;
  /** Which routing tier this model belongs to. */
  tier: ModelTier;
  /** USD per 1M input tokens. */
  inputCostPer1M: number;
  /** USD per 1M output tokens. */
  outputCostPer1M: number;
  /** Maximum context window in tokens. */
  contextWindow: number;
}

export const MODELS: Record<ModelId, ModelSpec> = {
  "openai/gpt-oss-20b": {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B",
    tier: "cheap",
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    contextWindow: 131072,
  },
  "qwen/qwen3.8-27b": {
    id: "qwen/qwen3.8-27b",
    label: "Qwen 3.8 27B",
    tier: "strong",
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.00,
    contextWindow: 131072,
  },
};

/** Convenience: get the model assigned to a given tier. */
export function getModelForTier(tier: ModelTier): ModelSpec {
  const model = Object.values(MODELS).find((m) => m.tier === tier);
  if (!model) {
    throw new Error(`[models] no model registered for tier: ${tier}`);
  }
  return model;
}

/** Compute the USD cost of a call given token usage. */
export function computeCost(
  model: ModelSpec,
  inputTokens: number,
  outputTokens: number,
): number {
  const inputCost = (inputTokens / 1_000_000) * model.inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * model.outputCostPer1M;
  return inputCost + outputCost;
}
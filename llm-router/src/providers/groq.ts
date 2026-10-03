/**
 * Groq provider adapter.
 *
 * The only file in the codebase that imports the groq-sdk. Everything else
 * talks to `complete()` and receives a provider-agnostic CompletionResult.
 * Swapping providers means rewriting this file and nothing else.
 */

import Groq from "groq-sdk";
import { config } from "../lib/config.js";
import type { ModelId } from "../lib/models.js";

const client = new Groq({ apiKey: config.GROQ_API_KEY });

export interface CompletionResult {
  /** The model's text response. */
  text: string;
  /** The model identifier that actually served the request. */
  model: string;
  /** Prompt tokens consumed (billed as input). */
  inputTokens: number;
  /** Completion tokens generated (billed as output). */
  outputTokens: number;
}

export interface CompletionOptions {
  /** Optional system prompt to steer behavior. */
  system?: string;
  /** Max tokens in the completion. Defaults to 1024. */
  maxTokens?: number;
  /** Sampling temperature. Defaults to 0.7. */
  temperature?: number;
}

export async function complete(
  prompt: string,
  modelId: ModelId,
  options: CompletionOptions = {},
): Promise<CompletionResult> {
  const response = await client.chat.completions.create({
    model: modelId,
    messages: [
      ...(options.system
        ? [{ role: "system" as const, content: options.system }]
        : []),
      { role: "user" as const, content: prompt },
    ],
    max_tokens: options.maxTokens ?? 1024,
    temperature: options.temperature ?? 0.7,
  });

  const choice = response.choices[0];
  if (!choice || !choice.message?.content) {
    throw new Error("[groq] empty response from provider");
  }

  return {
    text: choice.message.content,
    model: response.model,
    inputTokens: response.usage?.prompt_tokens ?? 0,
    outputTokens: response.usage?.completion_tokens ?? 0,
  };
}
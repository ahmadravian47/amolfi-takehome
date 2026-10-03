/**
 * POST /chat
 *
 * Accepts a task description, routes it to the appropriate model tier,
 * calls the provider, and returns the response with cost and latency.
 */

import { Router } from "express";
import { z } from "zod";
import { route as decideTier } from "../lib/router.js";
import { getModelForTier, computeCost } from "../lib/models.js";
import { complete } from "../providers/groq.js";
import { validateBody } from "../middleware/validate.js";

const RouteRequestSchema = z.object({
  task: z.string().min(1, "Task must be at least 1 character").max(8000),
});

export const chatRouter = Router();

chatRouter.post(
  "/chat",
  validateBody(RouteRequestSchema),
  async (_req, res, next) => {
    const { task } = res.locals.body as z.infer<typeof RouteRequestSchema>;
    const start = performance.now();

    try {
      const decision = decideTier(task);
      const model = getModelForTier(decision.tier);

      const result = await complete(task, model.id);
      const latencyMs = Math.round(performance.now() - start);

      const cost = computeCost(model, result.inputTokens, result.outputTokens);
      const inputCost =
        (result.inputTokens / 1_000_000) * model.inputCostPer1M;
      const outputCost =
        (result.outputTokens / 1_000_000) * model.outputCostPer1M;

      res.json({
        task,
        routing: {
          tier: decision.tier,
          reason: decision.reason,
        },
        model: {
          id: model.id,
          label: model.label,
        },
        output: result.text,
        usage: {
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
        },
        cost: {
          usd: Number(cost.toFixed(8)),
          breakdown: {
            input: Number(inputCost.toFixed(8)),
            output: Number(outputCost.toFixed(8)),
          },
        },
        latencyMs,
      });
    } catch (err) {
      next(err);
    }
  },
);
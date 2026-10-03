/**
 * Request body validation middleware.
 *
 * Wraps a Zod schema and returns a 400 with structured field errors when
 * the request body doesn't match. Attaches the parsed (typed) value to
 * `res.locals.body` for the route handler.
 */

import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny, z } from "zod";

export function validateBody<T extends ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "invalid_request",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    res.locals.body = result.data as z.infer<T>;
    next();
  };
}
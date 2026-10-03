import express from "express";
import { config } from "./lib/config.js";
import { chatRouter } from "./routes/chat.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    env: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use(chatRouter);

// Centralized error handler — always last.
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`[server] unhandled error: ${message}`);
    res.status(500).json({ error: "internal_error" });
  },
);

app.listen(config.PORT, () => {
  console.log(`[server] llm-router listening on http://localhost:${config.PORT}`);
  console.log(`[server] environment: ${config.NODE_ENV}`);
  console.log(`[server] health:      http://localhost:${config.PORT}/health`);
  console.log(`[server] route:       POST http://localhost:${config.PORT}/chat`);
});
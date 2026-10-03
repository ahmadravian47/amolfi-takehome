import express from "express";
import { config } from "./lib/config.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    env: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.listen(config.PORT, () => {
  console.log(`llm-router listening on http://localhost:${config.PORT}`);
  console.log(`   environment: ${config.NODE_ENV}`);
  console.log(`   health:      http://localhost:${config.PORT}/health`);
});
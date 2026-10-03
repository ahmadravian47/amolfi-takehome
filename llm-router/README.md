# llm-router

A small Node API that accepts a task description, decides whether it needs
a cheaper or a stronger LLM, calls that model, and returns the response
along with the cost, latency, and which model was chosen.

Built as a take-home for Amolfi.

- **Stack:** Node 20+, TypeScript, Express 5, Zod, Groq SDK
- **Models:** `openai/gpt-oss-20b` (cheap) and `qwen/qwen3.8-27b` (strong)
- **Benchmark accuracy:** 14/20 on a 20-task mixed-difficulty set (up from
  10/20 in the first version — see [Evaluation](#evaluation))

## API

### `POST /chat`

Request:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"task":"Classify the sentiment: I love this product"}'
```

Response:

```json
{
  "task": "Classify the sentiment: I love this product",
  "routing": {
    "tier": "cheap",
    "reason": "cheap signal detected: \"classify\""
  },
  "model": {
    "id": "openai/gpt-oss-20b",
    "label": "GPT-OSS 20B"
  },
  "output": "positive",
  "usage": { "inputTokens": 82, "outputTokens": 55 },
  "cost": { "usd": 0.00002265, "breakdown": { "input": 0.00000615, "output": 0.0000165 } },
  "latencyMs": 1190
}
```

### `GET /health`

Liveness check. Returns `{ status: "ok", env, timestamp }`.

## Architecture

Four files, four responsibilities. No file does two jobs.

| File | Job |
|---|---|
| `src/lib/router.ts` | Decides cheap vs strong from the task text |
| `src/lib/models.ts` | Registry: which model is which tier, plus pricing |
| `src/providers/groq.ts` | Adapter — the only file that talks to Groq |
| `src/routes/chat.ts` | HTTP endpoint that ties it together |

The separation matters: routing logic can change without touching the model
catalog, and swapping providers means rewriting one adapter.

## Routing heuristic

`route(task)` returns `{ tier: "cheap" | "strong", reason }`. The reason
string appears in API responses and evaluation output — it's what makes the
router debuggable.

The current version checks, in order:

1. **Reasoning phrases** — `"explain why"`, `"how does"`, `"step by step"` → strong
2. **Topic complexity** — `"algorithm"`, `"compiler"`, `"distributed"`, `"theorem"` → strong
3. **Complexity verbs** — `"build"`, `"design"`, `"analyze"`, `"evaluate"` → strong
4. **Cheap signals** — `"classify"`, `"extract"`, `"translate"` → cheap
5. **Length fallback** — 800+ chars → strong
6. **Default** — cheap

It is deliberately simple. It is not, and cannot be, perfect. See below.

## Evaluation

I ran the router against 20 real tasks of varying difficulty and compared
its decision to a human's judgment of the correct tier.

### Results

| Version | Correct | Notes |
|---|---|---|
| v1 | 10 / 20 (50%) | Baseline |
| **v2** | **14 / 20 (70%)** | After removing the "very short → cheap" rule and adding complexity signals |

Full outputs: [`results-v1.txt`](./results-v1.txt) and [`results-v2.txt`](./results-v2.txt).

### What I changed and why

**v1's failure mode was obvious once measured:** 9 of its 10 failures came
from a single rule — *"tasks under 200 chars → cheap."* Length is not a
proxy for complexity. `"Is P = NP?"` is 10 characters and requires deep
reasoning; `"What's 2 + 2?"` is also 10 characters and doesn't.

**v2 changes:**

1. Removed the length-based cheap rule entirely.
2. Added **complexity verbs** (`build`, `explain`, `implement`, ...) —
   these imply substantial output even when the input is short.
3. Added **topic-complexity words** (`algorithm`, `compiler`, `theorem`, ...).
4. Broadened `"explain why"` → `"explain"` so `"explain how"` also matches.
5. Removed `"write a"` as a complexity verb after it caused `"Write a haiku"`
   to over-route.

### What v2 still gets wrong

The remaining 6 failures are the honest ceiling of keyword routing:

| Task | Why it fails |
|---|---|
| `"Build me a login signup module in JavaScript"` | Typo ("Buid"); no keyword matches |
| `"Who was Charles Babbage? What did he invent?"` | Historical knowledge question; no surface signal |
| `"Was Newton right about the speed of gravity?"` | Conceptual science question; no surface signal |
| `"How did Laplace correct Newton?"` | Same class as above |
| `"Summarize this 4000-word legal contract"` | Contains `"summarize"` but the string itself is short |
| `"Compare apples and oranges"` | Contains `"compare"` (strong keyword) but is trivial |

**Five of six require semantic understanding of the task, not keyword
matching.** The next step would be embedding-based routing — see below.

## What I'd do with more time

In rough priority order:

1. **Embedding-based routing.** Replace keyword matching with a small
   classifier: embed the task, compare against labeled examples, route by
   nearest cluster. This is what production routers (Glean, vLLM semantic
   router, RouteLLM) actually do. Would likely push accuracy past 90%.
2. **Confidence-based escalation.** Send borderline tasks to the cheap model
   first, check confidence (logprobs / self-consistency), escalate to strong
   only if uncertain. Pays for two calls only when the cheap model fails.
3. **Response caching.** Hash the normalized task; return cached results for
   duplicates. Meaningful cost saving on repetitive workloads.
4. **Metrics dashboard.** Persist every request to SQLite; expose `/metrics`
   with cost-by-tier, latency p50/p99, cache hit rate.
5. **Unit tests.** `route()` is a pure function — trivially testable. I'd
   lock in v2's behavior with a table-driven test suite before the next
   iteration.
6. **Streaming responses.** Currently synchronous. Streaming would improve
   perceived latency for long outputs.

## Running locally

```bash
# Prerequisites: Node 20+, a Groq API key
cp .env.example .env        # then fill in GROQ_API_KEY
npm install
npm run dev
```

```bash
npm run typecheck           # tsc --noEmit
npm run evaluate            # run the 20-task benchmark
npm run build && npm start  # production build
```

## Live

- API base: `https://swear-emotion-corral.ngrok-free.dev`
- Health: `https://swear-emotion-corral.ngrok-free.dev/health`

Quick check:

```bash
curl https://swear-emotion-corral.ngrok-free.dev/health
curl -X POST https://swear-emotion-corral.ngrok-free.dev/chat \
  -H "Content-Type: application/json" \
  -d '{"task":"Classify the sentiment: I love this product"}'

## Repo

Part of [`amolfi-takehome`](../README.md). Frontend exercise pending source SVG.

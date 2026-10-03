# Amolfi Take-Home

Two exercises for the Amolfi founding engineer interview.

| Exercise | Stack | Status | Links |
|---|---|---|---|
| **LLM Router** | Node, TypeScript, Express, Groq | Complete | [README](./llm-router/README.md) · [Live API](https://swear-emotion-corral.ngrok-free.dev) |
| **Logo Animation** | Vite, TypeScript, GSAP | Pending source SVG | [README](./logo-animation/README.md) |

## LLM Router

A cost-aware router that picks between a cheap and a strong LLM for each
task, then logs the cost, latency, and chosen model. Includes a 20-task
evaluation and the iteration story from v1 (50% routing accuracy) to v2 (70%).

→ [Full write-up](./llm-router/README.md)

## Logo Animation

Animated SVG logo — the spiral spins, the wordmark stays still.

**Status: pending source asset.** The version in the take-home email is a
180×180 JPEG (raster), not the vector original. I've requested the source
`.svg`; the animation is scoped and ready to apply once it arrives.

→ [Full write-up](./logo-animation/README.md)

## Repo structure
amolfi-takehome/
├── llm-router/ # Backend exercise
│ ├── src/
│ ├── scripts/
│ └── README.md
└── logo-animation/ # Frontend exercise (pending SVG)
└── README.md
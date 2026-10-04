# logo-animation

Animated SVG logo for Amolfi. On load, the spiral spins and settles. The wordmark stays still.

Live demo: TODO: live URL

## What it does

The logo fades in, then the spiral performs two full decelerating turns (about 4 seconds total). Then everything rests.

It's deliberately not a loop. A spinning logo gets annoying fast — one that arrives and stops feels confident.

## Stack

Vite + TypeScript + GSAP.

I picked GSAP over CSS `@keyframes` because the sequence needs two coordinated tweens (spiral entrance + spin, wordmark fade) with overlapping timing. That's fiddly in raw CSS.

## How it works

The SVG has two groups:

    <g id="amolfi-spiral">   ← rotated
    <g id="amolfi-wordmark"> ← still

The animation only touches `#amolfi-spiral`. The wordmark fades in at the start and never moves after that.

Rotation origin is set to the spiral's visual center. Getting this wrong is what makes amateur SVG animations wobble — the mark ends up orbiting the SVG's top-left corner instead of its own axis.

## Easing choices

| Phase | Ease | Why |
|---|---|---|
| Spiral entrance | `back.out(2.2)` | Slight overshoot, then settles. Feels physical. |
| Wordmark fade | `power2.out` | Gentle. |
| Spin | `power3.out` | Fast start, smooth stop. |

## Timing

- 0.0–0.9s: spiral and wordmark fade in together
- 0.9–3.9s: spiral spins 2 turns, decelerating
- After 3.9s: everything still

## Accessibility

`prefers-reduced-motion` is respected. Users who've asked for reduced motion see the logo rendered immediately, no animation.

## Performance

Transform-only animation, GPU-composited. 60fps in DevTools.

## Running locally

    npm install
    npm run dev      # localhost:5173
    npm run build    # production build

## With more time

- **Designer pass.** Easing and timing are my call. A designer would likely tune both.
- **Hover interaction.** A subtle re-spin on hover would work in an interactive context. Didn't add it — the brief was a standalone animation.
- **Dark background variant.** The wordmark is `#171717`; it'd need a light version for dark UIs.

## Note on the source file

The email attachment was a 180×180 JPEG. I asked for the original SVG instead of tracing the raster — traced letterforms look off, and the spiral's curve was designed precisely. The source SVG is committed as `amolfi-logo.svg`.

## Repo

Part of [amolfi-takehome](../README.md).
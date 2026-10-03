# logo-animation

Animated SVG logo — the spiral spins, the wordmark stays still.

**Status: pending source asset.**

The version included in the take-home email is a 180×180 JPEG (raster),
not the vector original (see `reference-from-email.jpg` in this folder).
I've requested the source `.svg` from James — the animation will be
applied to that file once it arrives.

## Plan (once the SVG lands)

- **Stack:** Vite + TypeScript + GSAP
- **Easing:** custom cubic-bezier; non-uniform rotation so the loop "breathes"
  instead of feeling mechanical
- **Rotation origin:** the spiral's visual center, handled by wrapping it in a
  translated `<g>` — not rotating the SVG root, which is what causes the
  wobble you see in most amateur SVG animations
- **Accessibility:** `prefers-reduced-motion` disables the infinite loop but
  keeps a one-shot entrance
- **Performance:** transform-only animation (GPU-composited); target 60fps,
  verified in DevTools
- **Entrance:** 200–400ms scale + fade so the logo doesn't pop in
- **Deploy:** Vercel

## Why not trace the JPEG?

Tracing a raster into a vector produces slightly-off letterforms — the
wordmark is text, and the spiral's curve was designed precisely. The right
move is to animate the actual source file, not to approximate it.
import "./style.css";
import { gsap } from "gsap";
import logoSvg from "../amolfi-logo.svg?raw";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = logoSvg;

const svg = app.querySelector("svg")!;
const spiral = svg.querySelector<SVGGElement>("#amolfi-spiral")!;
const wordmark = svg.querySelector<SVGGElement>("#amolfi-wordmark")!;

if (!spiral || !wordmark) {
  throw new Error("[logo] spiral or wordmark not found in SVG");
}

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

gsap.set(wordmark, { opacity: 0, x: -20 });
gsap.set(spiral, {
  opacity: 0,
  scale: 0.5,
  transformOrigin: "center center",
});

const tl = gsap.timeline();

// Spiral and wordmark arrive together.
tl.to(spiral, {
  opacity: 1,
  scale: 1,
  duration: 0.9,
  ease: "back.out(2.2)",
});

tl.to(
  wordmark,
  {
    opacity: 1,
    x: 0,
    duration: 0.9,
    ease: "power2.out",
  },
  "<",
);

// Single spin: two full turns, decelerating smoothly to a stop.
if (!prefersReducedMotion) {
  tl.to(spiral, {
    rotation: 720,
    duration: 3,
    ease: "power3.out",
  });
}
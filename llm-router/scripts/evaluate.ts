/**
 * Router evaluation.
 *
 * Runs the routing decision against the benchmark and reports accuracy.
 * Router-only — no API calls — so it runs in milliseconds.
 */

import { BENCHMARK } from "../src/lib/tasks.js";
import { route } from "../src/lib/router.js";

const results = BENCHMARK.map((t) => {
  const decision = route(t.task);
  return {
    id: t.id,
    expected: t.expectedTier,
    actual: decision.tier,
    ok: decision.tier === t.expectedTier,
    reason: decision.reason,
    task: t.task.length > 55 ? t.task.slice(0, 52) + "..." : t.task,
  };
});

console.log("\n=== Routing evaluation ===\n");
console.log("id    expected  actual   ok    task");
console.log("-".repeat(90));
for (const r of results) {
  const ok = r.ok ? "yes" : "NO ";
  console.log(
    `${r.id}   ${r.expected.padEnd(9)} ${r.actual.padEnd(7)} ${ok}   ${r.task}`,
  );
}

const total = results.length;
const correct = results.filter((r) => r.ok).length;

console.log("\n=== Summary ===\n");
console.log(`Accuracy: ${correct}/${total} (${((correct / total) * 100).toFixed(1)}%)`);
console.log(`Misrouted: ${total - correct}`);

console.log("\n=== Misrouted ===\n");
for (const r of results.filter((r) => !r.ok)) {
  console.log(`${r.id}: expected ${r.expected}, got ${r.actual}`);
  console.log(`     task:   ${r.task}`);
  console.log(`     reason: ${r.reason}\n`);
}
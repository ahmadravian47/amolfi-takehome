/**
 * Evaluation benchmark.
 *
 * 20 real tasks of varying difficulty. `expectedTier` is the human
 * judgment of which tier should handle each task. When the router's
 * decision disagrees, that's a misroute worth investigating.
 */

export interface BenchmarkTask {
  id: string;
  task: string;
  expectedTier: "cheap" | "strong";
}

export const BENCHMARK: BenchmarkTask[] = [
  {
    id: "t01",
    task: "Classify the sentiment of this review: 'The battery life is amazing but the screen is dim.'",
    expectedTier: "cheap",
  },
  {
    id: "t02",
    task: "Extract all email addresses from this text: 'Contact a@x.com or b@y.org for details.'",
    expectedTier: "cheap",
  },
  {
    id: "t03",
    task: "Translate 'Ahmad Touseef' into Spanish.",
    expectedTier: "cheap",
  },
  {
    id: "t04",
    task: "Buid me a login signup module in JavaScript",
    expectedTier: "strong",
  },
  {
    id: "t05",
    task: "Tag this support ticket with one category: 'My invoice shows the wrong amount.'",
    expectedTier: "cheap",
  },
  {
    id: "t06",
    task: "Who was Charles babbage? What did he invented?",
    expectedTier: "strong",
  },

  {
    id: "t07",
    task: "Was Newton right about speed of Gravity? if no where did he go wrong? did anyone corrected him?",
    expectedTier: "strong",
  },
  {
    id: "t08",
    task: "How Laplace corrected Newton in speed of light?",
    expectedTier: "strong",
  },
  {
    id: "t09",
    task: "Design a database schema for a multi-tenant SaaS app with per-tenant custom fields.",
    expectedTier: "strong",
  },
  {
    id: "t10",
    task: "Compare PostgreSQL and MongoDB for a write-heavy IoT workload.",
    expectedTier: "strong",
  },
  {
    id: "t11",
    task: "Explain me why Newton failed in finding speed of light?",
    expectedTier: "strong",
  },
  {
    id: "t12",
    task: "Explain why the CAP theorem forces trade-offs in distributed systems.",
    expectedTier: "strong",
  },
  {
    id: "t13",
    task: "Evaluate the business case for migrating our monolith to microservices over the next 18 months.",
    expectedTier: "strong",
  },

  // --- tricky ---
  {
    id: "t14",
    task: "Is P = NP?",
    expectedTier: "strong",
  },
  {
    id: "t15",
    task: "Explain how a B-tree index works in PostgreSQL.",
    expectedTier: "strong",
  },
  {
    id: "t16",
    task: "Summarize this 4000-word legal contract into a one-page summary.",
    expectedTier: "strong",
  },
  {
    id: "t17",
    task: "Write a haiku about autumn.",
    expectedTier: "cheap",
  },
  {
    id: "t18",
    task: "Compare apples and oranges.",
    expectedTier: "cheap",
  },
  {
    id: "t19",
    task: "Given the following 50 customer reviews, identify the top three recurring complaints and propose one product change for each.",
    expectedTier: "strong",
  },
  {
    id: "t20",
    task: "What's the difference between a stack and a queue?",
    expectedTier: "cheap",
  },
];
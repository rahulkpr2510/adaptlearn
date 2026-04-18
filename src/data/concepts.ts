import type { ConceptDefinition } from "@/types/learning";

export const CONCEPTS: ConceptDefinition[] = [
  {
    name: "Arrays",
    prerequisites: [],
    practiceSteps: [
      "Solve 3 easy traversal and frequency counting problems.",
      "Solve 2 prefix-sum based range query problems.",
      "Implement in-place reverse and rotate operations from memory.",
    ],
    revisionResource:
      "Review array patterns: traversal, prefix sums, and in-place updates. Focus on time and space trade-offs.",
  },
  {
    name: "Sliding Window",
    prerequisites: ["Arrays"],
    practiceSteps: [
      "Solve 2 fixed-size window maximum sum problems.",
      "Solve 2 variable-size window distinct-element problems.",
      "Write a checklist for when to expand and shrink a window.",
    ],
    revisionResource:
      "Revise how window boundaries move and how to track state while maintaining O(n) complexity.",
  },
  {
    name: "Two Pointers",
    prerequisites: ["Arrays"],
    practiceSteps: [
      "Solve 2 sorted-array target sum problems.",
      "Solve 2 in-place duplicate removal or partition problems.",
      "Practice proving correctness of pointer movement decisions.",
    ],
    revisionResource:
      "Review inward and same-direction pointer movement patterns, especially on sorted arrays.",
  },
  {
    name: "Binary Search",
    prerequisites: ["Arrays"],
    practiceSteps: [
      "Solve 2 classic search-in-sorted-array problems.",
      "Solve 2 first/last occurrence boundary problems.",
      "Practice monotonic-condition based answer search questions.",
    ],
    revisionResource:
      "Revise binary search invariants, mid calculation, and boundary handling for lower/upper bounds.",
  },
  {
    name: "Graph Basics",
    prerequisites: ["Arrays"],
    practiceSteps: [
      "Implement BFS and DFS traversal on an adjacency list.",
      "Solve 2 shortest path in unweighted graph problems.",
      "Solve 1 connected components counting problem.",
    ],
    revisionResource:
      "Review graph representations and when to choose BFS vs DFS for traversal and reachability.",
  },
];

export const CONCEPT_MAP = new Map(
  CONCEPTS.map((concept) => [concept.name, concept]),
);

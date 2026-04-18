import type { DiagnosisResult } from "@/types/learning";

export const DEMO_QUESTION_IDS = [
  "qb-1",
  "qb-4",
  "qb-7",
  "qb-10",
  "qb-13",
  "qb-5",
  "qb-8",
  "qb-11",
  "qb-14",
  "qb-6",
];

export const DEMO_DIAGNOSIS_RESULT: DiagnosisResult = {
  overallMastery: 58,
  correctCount: 6,
  answeredCount: 10,
  totalQuestions: 10,
  strongConcepts: ["Arrays"],
  improvingConcepts: ["Two Pointers", "Binary Search"],
  weakConcepts: ["Sliding Window", "Graph Basics"],
  conceptStats: [
    {
      concept: "Arrays",
      total: 2,
      correct: 2,
      mastery: 100,
      level: "Strong",
    },
    {
      concept: "Sliding Window",
      total: 3,
      correct: 1,
      mastery: 33,
      level: "Weak",
    },
    {
      concept: "Two Pointers",
      total: 2,
      correct: 1,
      mastery: 50,
      level: "Improving",
    },
    {
      concept: "Binary Search",
      total: 2,
      correct: 1,
      mastery: 50,
      level: "Improving",
    },
    {
      concept: "Graph Basics",
      total: 2,
      correct: 1,
      mastery: 50,
      level: "Weak",
    },
  ],
  roadmap: {
    generatedAt: new Date().toISOString(),
    summary:
      "Strengthen Sliding Window first, then reinforce Graph Basics fundamentals, and close with Binary Search boundaries before retesting.",
    retestSuggestion:
      "Retake a focused 8-question quiz in 48 hours after finishing the roadmap tasks.",
    priorityConcepts: [
      {
        concept: "Sliding Window",
        mastery: 33,
        whyWeak:
          "Incorrect answers show difficulty in deciding when to shrink the window after constraints break.",
        whatToStudy:
          "Revisit fixed-size vs variable-size window patterns and practice writing window invariants.",
        practiceTasks: [
          "Solve 2 fixed-size maximum sum window problems.",
          "Solve 2 variable-size distinct-character window problems.",
          "Write pseudocode for expand-shrink logic before coding.",
        ],
        retestAfter: "Retest this concept after 5 targeted problems.",
        prerequisites: ["Arrays"],
      },
      {
        concept: "Graph Basics",
        mastery: 50,
        whyWeak:
          "Mistakes suggest uncertainty around BFS traversal order and shortest-path reasoning.",
        whatToStudy:
          "Review adjacency list traversal and BFS layer-based expansion.",
        practiceTasks: [
          "Implement BFS and DFS from scratch without notes.",
          "Solve 2 unweighted shortest path tasks.",
          "Solve 1 connected-components counting problem.",
        ],
        retestAfter: "Retest after completing 3 graph problems.",
        prerequisites: ["Arrays"],
      },
      {
        concept: "Binary Search",
        mastery: 50,
        whyWeak:
          "Answers indicate boundary confusion when searching for first or last valid index.",
        whatToStudy:
          "Revise lower-bound and first-occurrence templates and maintain loop invariants.",
        practiceTasks: [
          "Solve 2 first/last occurrence tasks.",
          "Solve 1 answer-space binary search problem.",
          "Write edge-case tests for empty and single-element arrays.",
        ],
        retestAfter: "Retest after 4 boundary-focused problems.",
        prerequisites: ["Arrays"],
      },
    ],
  },
};

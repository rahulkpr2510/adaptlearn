import type { Concept, TrackKey } from "@/types/adaptive";

export const ADAPTIVE_CONCEPTS: Concept[] = [
  {
    id: "arrays",
    track: "dsa",
    name: "Arrays",
    prerequisites: [],
    learningObjectives: [
      "Use traversal and indexing patterns correctly.",
      "Apply prefix/suffix precomputation for repeated range logic.",
      "Choose in-place vs extra-space approaches intentionally.",
    ],
    revisionNotes:
      "Rehearse array invariants, index boundaries, and complexity trade-offs before coding.",
    practiceTasks: [
      "Solve 3 traversal and counting problems without hints.",
      "Implement prefix sum and sliding prefix variants from memory.",
      "Compare two solutions for the same problem and justify space usage.",
    ],
    retestGoal:
      "Reach at least 80% accuracy on medium array questions in one sitting.",
    difficultyLevel: "foundation",
  },
  {
    id: "two-pointers",
    track: "dsa",
    name: "Two Pointers",
    prerequisites: ["arrays"],
    learningObjectives: [
      "Differentiate inward vs same-direction pointer movement.",
      "Maintain pointer invariants while skipping or swapping values.",
      "Explain why pointer updates are safe at each step.",
    ],
    revisionNotes:
      "Focus on sorted-array constraints, movement triggers, and early exits.",
    practiceTasks: [
      "Solve 2 sorted pair-sum style problems.",
      "Solve 2 in-place partitioning tasks.",
      "Write a pointer-movement proof for one solved question.",
    ],
    retestGoal:
      "Solve 4 mixed two-pointer questions with no boundary mistakes.",
    difficultyLevel: "intermediate",
  },
  {
    id: "sliding-window",
    track: "dsa",
    name: "Sliding Window",
    prerequisites: ["arrays"],
    learningObjectives: [
      "Pick fixed-size vs variable-size window strategies.",
      "Track running state while expanding and shrinking.",
      "Preserve O(n) behavior with correct boundary updates.",
    ],
    revisionNotes:
      "Practice writing expand/shrink conditions before writing final code.",
    practiceTasks: [
      "Solve 2 fixed-window max/min problems.",
      "Solve 2 variable-window constraint problems.",
      "Create a checklist for when to shrink the left pointer.",
    ],
    retestGoal: "Complete a 5-question window drill with at least 4 correct.",
    difficultyLevel: "intermediate",
  },
  {
    id: "binary-search",
    track: "dsa",
    name: "Binary Search",
    prerequisites: ["arrays"],
    learningObjectives: [
      "Use lower/upper-bound style templates correctly.",
      "Avoid off-by-one errors in loop conditions.",
      "Extend binary search to monotonic answer spaces.",
    ],
    revisionNotes:
      "Reinforce invariant-driven boundaries and careful midpoint updates.",
    practiceTasks: [
      "Solve 2 boundary-find problems (first/last occurrence).",
      "Solve 2 answer-space binary search problems.",
      "Write edge-case tests for empty and one-element arrays.",
    ],
    retestGoal: "Hit 80%+ on boundary-focused binary search questions.",
    difficultyLevel: "intermediate",
  },
  {
    id: "graph-basics",
    track: "dsa",
    name: "Graph Basics",
    prerequisites: ["arrays"],
    learningObjectives: [
      "Represent graphs with adjacency list and matrix trade-offs.",
      "Run BFS/DFS correctly and explain traversal order.",
      "Identify connected components and shortest path in unweighted graphs.",
    ],
    revisionNotes:
      "Study queue vs stack traversal behavior and visited-state handling.",
    practiceTasks: [
      "Implement BFS and DFS from scratch.",
      "Solve 2 connected-component problems.",
      "Solve 2 unweighted shortest-path tasks.",
    ],
    retestGoal:
      "Complete a graph fundamentals set with no traversal-state bugs.",
    difficultyLevel: "advanced",
  },
  {
    id: "basic-select",
    track: "sql",
    name: "Basic SELECT",
    prerequisites: [],
    learningObjectives: [
      "Write correct SELECT/FROM queries.",
      "Alias columns and tables clearly.",
      "Project only necessary fields for readability and performance.",
    ],
    revisionNotes:
      "Practice building readable SELECT statements before adding constraints.",
    practiceTasks: [
      "Write 5 SELECT statements with aliases.",
      "Rewrite broad SELECT * queries to focused projections.",
      "Explain result shape before running each query.",
    ],
    retestGoal:
      "Produce correct result columns in 5 consecutive baseline queries.",
    difficultyLevel: "foundation",
  },
  {
    id: "filtering",
    track: "sql",
    name: "Filtering with WHERE",
    prerequisites: ["basic-select"],
    learningObjectives: [
      "Use WHERE with comparison and logical operators.",
      "Handle NULL checks with IS NULL and IS NOT NULL.",
      "Combine conditions with clear operator precedence.",
    ],
    revisionNotes:
      "Prioritize condition clarity using parentheses and explicit null handling.",
    practiceTasks: [
      "Solve 4 filtering queries with mixed AND/OR conditions.",
      "Write 2 queries that correctly handle NULL values.",
      "Practice translating plain-English conditions into SQL predicates.",
    ],
    retestGoal:
      "Avoid logical-condition mistakes across a 6-query filter challenge.",
    difficultyLevel: "foundation",
  },
  {
    id: "joins",
    track: "sql",
    name: "JOINs",
    prerequisites: ["filtering"],
    learningObjectives: [
      "Choose INNER vs LEFT JOIN intentionally.",
      "Write reliable join predicates on keys.",
      "Diagnose row duplication caused by join cardinality.",
    ],
    revisionNotes:
      "Map relationships first, then write join clauses table by table.",
    practiceTasks: [
      "Solve 3 INNER JOIN reporting questions.",
      "Solve 3 LEFT JOIN missing-data questions.",
      "Debug one duplicate-row query by checking join keys.",
    ],
    retestGoal: "Complete 5 join questions with correct row counts.",
    difficultyLevel: "intermediate",
  },
  {
    id: "grouping-aggregation",
    track: "sql",
    name: "Grouping and Aggregation",
    prerequisites: ["filtering"],
    learningObjectives: [
      "Use GROUP BY with aggregate functions correctly.",
      "Apply HAVING after aggregation.",
      "Avoid mixing aggregated and non-aggregated columns incorrectly.",
    ],
    revisionNotes: "Check grouping keys first, then verify aggregate intent.",
    practiceTasks: [
      "Write 3 GROUP BY summaries with COUNT/SUM/AVG.",
      "Solve 2 HAVING-based threshold questions.",
      "Refactor one verbose report query for clarity.",
    ],
    retestGoal: "Score 80%+ on mixed aggregation and HAVING questions.",
    difficultyLevel: "intermediate",
  },
  {
    id: "subqueries",
    track: "sql",
    name: "Subqueries",
    prerequisites: ["joins", "grouping-aggregation"],
    learningObjectives: [
      "Use scalar and table subqueries appropriately.",
      "Choose EXISTS/IN based on intent and readability.",
      "Reason about correlation in nested query patterns.",
    ],
    revisionNotes:
      "Translate each subquery to a plain-language intermediate result.",
    practiceTasks: [
      "Solve 2 scalar subquery filters.",
      "Solve 2 EXISTS vs IN comparison tasks.",
      "Rewrite one subquery solution using a join and compare readability.",
    ],
    retestGoal: "Complete 4 subquery problems with correct nesting logic.",
    difficultyLevel: "advanced",
  },
  {
    id: "variables-types",
    track: "javascript-fundamentals",
    name: "Variables and Types",
    prerequisites: [],
    learningObjectives: [
      "Differentiate var, let, and const usage.",
      "Recognize primitive vs reference values.",
      "Predict type coercion in common expressions.",
    ],
    revisionNotes:
      "Review declarations, reassignment rules, and value vs reference behavior.",
    practiceTasks: [
      "Predict outputs of 8 small type/coercion snippets.",
      "Refactor code to replace unsafe var usage.",
      "Annotate mutable vs immutable values in a script.",
    ],
    retestGoal: "Answer 5/6 declaration and type checks correctly.",
    difficultyLevel: "foundation",
  },
  {
    id: "functions-scope",
    track: "javascript-fundamentals",
    name: "Functions and Scope",
    prerequisites: ["variables-types"],
    learningObjectives: [
      "Understand lexical scope and closure capture.",
      "Differentiate function declaration and expression hoisting.",
      "Use parameters and return values predictably.",
    ],
    revisionNotes:
      "Trace variable resolution chain before evaluating runtime behavior.",
    practiceTasks: [
      "Explain 5 closure examples in words.",
      "Debug 3 scope-related bugs.",
      "Rewrite callback code into named helper functions.",
    ],
    retestGoal: "Complete a scope quiz with at least 80% accuracy.",
    difficultyLevel: "intermediate",
  },
  {
    id: "arrays-objects",
    track: "javascript-fundamentals",
    name: "Arrays and Objects",
    prerequisites: ["variables-types"],
    learningObjectives: [
      "Use map/filter/reduce intentionally.",
      "Access and update nested object/array structures safely.",
      "Reason about shallow copy behavior.",
    ],
    revisionNotes: "Practice immutable update patterns for nested data.",
    practiceTasks: [
      "Write 3 transform pipelines with map/filter/reduce.",
      "Fix 2 mutation bugs in nested objects.",
      "Compare spread copy vs deep-copy behavior in one example.",
    ],
    retestGoal:
      "Solve 4 collection-transformation tasks without mutation mistakes.",
    difficultyLevel: "intermediate",
  },
  {
    id: "async-basics",
    track: "javascript-fundamentals",
    name: "Async Basics",
    prerequisites: ["functions-scope"],
    learningObjectives: [
      "Understand promise states and chaining.",
      "Use async/await with try/catch correctly.",
      "Predict event loop ordering for common cases.",
    ],
    revisionNotes:
      "Focus on promise flow, error handling, and execution order.",
    practiceTasks: [
      "Convert 3 promise chains to async/await.",
      "Debug 2 missing-await bugs.",
      "Predict output order for 4 event-loop snippets.",
    ],
    retestGoal: "Pass a 5-question async ordering and error-handling check.",
    difficultyLevel: "advanced",
  },
  {
    id: "dom-events",
    track: "javascript-fundamentals",
    name: "DOM and Events",
    prerequisites: ["functions-scope"],
    learningObjectives: [
      "Attach and remove event listeners correctly.",
      "Use event delegation for dynamic lists.",
      "Understand preventDefault and propagation behavior.",
    ],
    revisionNotes: "Review bubbling, delegation, and safe DOM updates.",
    practiceTasks: [
      "Build one delegated click handler for dynamic content.",
      "Fix 2 propagation bugs with stopPropagation or delegation.",
      "Implement one small interactive component with clean listeners.",
    ],
    retestGoal:
      "Complete event-handling exercises with no propagation confusion.",
    difficultyLevel: "advanced",
  },
];

export const CONCEPT_BY_ID = new Map(
  ADAPTIVE_CONCEPTS.map((concept) => [concept.id, concept]),
);

export function getConceptsForTrack(track: TrackKey): Concept[] {
  return ADAPTIVE_CONCEPTS.filter((concept) => concept.track === track);
}

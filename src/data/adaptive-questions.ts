import type { Question, TrackKey } from "@/types/adaptive";

export const ADAPTIVE_QUESTION_BANK: Question[] = [
  {
    id: "dsa-q1",
    track: "dsa",
    conceptTags: ["arrays"],
    difficulty: "easy",
    prompt:
      "Given an array nums, which technique gives O(1) range-sum query time after O(n) preprocessing?",
    options: [
      "Two pointers",
      "Prefix sum array",
      "Binary heap",
      "Backtracking",
    ],
    answerIndex: 1,
    explanation:
      "Prefix sums store cumulative totals so any range sum can be computed in constant time.",
  },
  {
    id: "dsa-q2",
    track: "dsa",
    conceptTags: ["arrays"],
    difficulty: "easy",
    prompt:
      "What is the time complexity of reversing an array in place with two indices moving inward?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
    answerIndex: 2,
    explanation:
      "Each element is swapped at most once across a linear number of steps.",
  },
  {
    id: "dsa-q3",
    track: "dsa",
    conceptTags: ["arrays"],
    difficulty: "medium",
    prompt:
      "To rotate an array right by k positions in-place, which sequence is valid?",
    options: [
      "Reverse whole array, reverse first k, reverse remaining n-k",
      "Reverse first k, reverse remaining n-k, reverse whole array",
      "Sort array, then reverse first k",
      "Use binary search to swap elements",
    ],
    answerIndex: 0,
    explanation:
      "The classic in-place rotate algorithm is full reverse, then reverse two partitions.",
  },
  {
    id: "dsa-q4",
    track: "dsa",
    conceptTags: ["two-pointers"],
    difficulty: "medium",
    prompt:
      "In a sorted array two-sum problem, when currentSum is too large, what is the correct move?",
    options: [
      "Move left pointer right",
      "Move right pointer left",
      "Reset both pointers",
      "Sort again",
    ],
    answerIndex: 1,
    explanation:
      "Decreasing the right pointer reduces the sum in a sorted array.",
  },
  {
    id: "dsa-q5",
    track: "dsa",
    conceptTags: ["two-pointers"],
    difficulty: "hard",
    prompt:
      "Which invariant is most useful when removing duplicates in-place from a sorted array?",
    options: [
      "Index i always points to current maximum value",
      "Prefix [0..write] contains unique values in sorted order",
      "Suffix after j is always reversed",
      "Array length must decrease each iteration",
    ],
    answerIndex: 1,
    explanation:
      "Maintaining a write pointer for the unique prefix guarantees correctness.",
  },
  {
    id: "dsa-q6",
    track: "dsa",
    conceptTags: ["sliding-window"],
    difficulty: "medium",
    prompt:
      "For a fixed-size window of k elements, how should window sum be updated each step?",
    options: [
      "Recompute full sum from scratch",
      "Add incoming element and subtract outgoing element",
      "Sort each window",
      "Use recursion with memoization",
    ],
    answerIndex: 1,
    explanation:
      "Incremental update keeps each shift O(1), leading to O(n) total.",
  },
  {
    id: "dsa-q7",
    track: "dsa",
    conceptTags: ["sliding-window"],
    difficulty: "hard",
    prompt:
      "In variable-size window problems, when is it typically valid to move left pointer forward?",
    options: [
      "Only when right pointer reaches end",
      "Whenever constraint is violated and we need to restore validity",
      "Only on even indices",
      "Never, left pointer must remain fixed",
    ],
    answerIndex: 1,
    explanation:
      "Shrink the window to restore constraints before continuing expansion.",
  },
  {
    id: "dsa-q8",
    track: "dsa",
    conceptTags: ["binary-search"],
    difficulty: "medium",
    prompt:
      "Which loop condition is standard for lower-bound binary search on [lo, hi)?",
    options: [
      "while (lo <= hi)",
      "while (lo < hi)",
      "while (hi < lo)",
      "while (lo != 0)",
    ],
    answerIndex: 1,
    explanation:
      "Half-open intervals commonly use while (lo < hi) with hi exclusive.",
  },
  {
    id: "dsa-q9",
    track: "dsa",
    conceptTags: ["binary-search"],
    difficulty: "hard",
    prompt: "Why is mid often calculated as lo + (hi - lo) / 2?",
    options: [
      "It guarantees odd mid values",
      "It avoids integer overflow in fixed-width integer languages",
      "It makes the algorithm recursive",
      "It forces descending order search",
    ],
    answerIndex: 1,
    explanation:
      "This form prevents overflow when lo and hi are large integers.",
  },
  {
    id: "dsa-q10",
    track: "dsa",
    conceptTags: ["graph-basics"],
    difficulty: "easy",
    prompt: "Which traversal uses a queue to explore graph layers?",
    options: ["DFS", "BFS", "Dijkstra", "Topological sort"],
    answerIndex: 1,
    explanation:
      "Breadth-first search explores nodes level by level using a queue.",
  },
  {
    id: "dsa-q11",
    track: "dsa",
    conceptTags: ["graph-basics"],
    difficulty: "medium",
    prompt:
      "To count connected components in an undirected graph, what is a reliable approach?",
    options: [
      "Run BFS/DFS from each unvisited node and increment count",
      "Sort all edges by weight",
      "Use binary search over vertex labels",
      "Run sliding window over adjacency list",
    ],
    answerIndex: 0,
    explanation:
      "Each traversal from an unvisited node discovers exactly one component.",
  },
  {
    id: "dsa-q12",
    track: "dsa",
    conceptTags: ["graph-basics"],
    difficulty: "hard",
    prompt:
      "In an unweighted graph, why does BFS yield shortest path length from source?",
    options: [
      "It always visits nodes with smallest labels first",
      "It explores nodes by increasing edge distance from source",
      "It checks every possible permutation of paths",
      "It uses recursion depth as path weight",
    ],
    answerIndex: 1,
    explanation:
      "BFS expands one edge-distance layer at a time, guaranteeing minimal hop count.",
  },
  {
    id: "sql-q1",
    track: "sql",
    conceptTags: ["basic-select"],
    difficulty: "easy",
    prompt:
      "Which query returns only name and salary columns from employees table?",
    options: [
      "SELECT * FROM employees;",
      "SELECT name, salary FROM employees;",
      "GET name salary FROM employees;",
      "SHOW employees.name, employees.salary;",
    ],
    answerIndex: 1,
    explanation:
      "SELECT column1, column2 FROM table projects specific columns.",
  },
  {
    id: "sql-q2",
    track: "sql",
    conceptTags: ["basic-select"],
    difficulty: "medium",
    prompt: "What does column aliasing with AS improve most directly?",
    options: [
      "Storage size",
      "Query readability and report labels",
      "Index creation speed",
      "Network encryption",
    ],
    answerIndex: 1,
    explanation:
      "Aliases primarily improve readability and output naming clarity.",
  },
  {
    id: "sql-q3",
    track: "sql",
    conceptTags: ["filtering"],
    difficulty: "easy",
    prompt: "Which predicate correctly finds rows where manager_id is missing?",
    options: [
      "manager_id = NULL",
      "manager_id == NULL",
      "manager_id IS NULL",
      "manager_id IN NULL",
    ],
    answerIndex: 2,
    explanation: "NULL comparison requires IS NULL, not equality operators.",
  },
  {
    id: "sql-q4",
    track: "sql",
    conceptTags: ["filtering"],
    difficulty: "medium",
    prompt:
      "Given WHERE age > 30 AND city = 'Boston' OR active = 1, what avoids precedence bugs?",
    options: [
      "Remove AND",
      "Add explicit parentheses for intended logic",
      "Replace OR with UNION always",
      "Use HAVING instead",
    ],
    answerIndex: 1,
    explanation:
      "Parentheses make logical grouping explicit and prevent accidental precedence.",
  },
  {
    id: "sql-q5",
    track: "sql",
    conceptTags: ["joins"],
    difficulty: "medium",
    prompt: "Which JOIN keeps all customers even when no order exists?",
    options: ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN"],
    answerIndex: 1,
    explanation:
      "LEFT JOIN keeps all rows from the left table and fills unmatched right rows with NULL.",
  },
  {
    id: "sql-q6",
    track: "sql",
    conceptTags: ["joins"],
    difficulty: "hard",
    prompt:
      "A report shows duplicate customer rows after joining orders. Most likely cause?",
    options: [
      "Customer IDs are too short",
      "One-to-many relationship creates multiple matched rows",
      "LEFT JOIN cannot be used with WHERE",
      "JOIN requires GROUP BY always",
    ],
    answerIndex: 1,
    explanation:
      "One customer with many orders naturally repeats customer data across joined rows.",
  },
  {
    id: "sql-q7",
    track: "sql",
    conceptTags: ["joins"],
    difficulty: "medium",
    prompt:
      "When joining employees to departments, which clause defines row matching logic?",
    options: ["GROUP BY", "ON", "ORDER BY", "LIMIT"],
    answerIndex: 1,
    explanation:
      "The ON clause specifies how rows from both tables are matched.",
  },
  {
    id: "sql-q8",
    track: "sql",
    conceptTags: ["grouping-aggregation"],
    difficulty: "medium",
    prompt:
      "Which clause filters aggregated results, such as groups with COUNT(*) > 5?",
    options: ["WHERE", "HAVING", "ON", "VALUES"],
    answerIndex: 1,
    explanation:
      "HAVING applies after GROUP BY and evaluates aggregate conditions.",
  },
  {
    id: "sql-q9",
    track: "sql",
    conceptTags: ["grouping-aggregation"],
    difficulty: "easy",
    prompt: "Which query piece is mandatory when using SUM(sales) by region?",
    options: [
      "DISTINCT sales",
      "GROUP BY region",
      "ORDER BY sales DESC",
      "JOIN regions",
    ],
    answerIndex: 1,
    explanation: "Grouping key region is required to aggregate per region.",
  },
  {
    id: "sql-q10",
    track: "sql",
    conceptTags: ["grouping-aggregation"],
    difficulty: "hard",
    prompt:
      "Why is SELECT region, SUM(sales), product FROM orders GROUP BY region invalid in strict SQL modes?",
    options: [
      "SUM cannot be used with GROUP BY",
      "product is neither grouped nor aggregated",
      "region cannot be grouped",
      "GROUP BY must include SUM(sales)",
    ],
    answerIndex: 1,
    explanation: "Non-aggregated selected columns must appear in GROUP BY.",
  },
  {
    id: "sql-q11",
    track: "sql",
    conceptTags: ["subqueries"],
    difficulty: "hard",
    prompt:
      "Which operator is often preferred for existence checks in correlated subqueries?",
    options: ["LIKE", "EXISTS", "BETWEEN", "UNION"],
    answerIndex: 1,
    explanation:
      "EXISTS expresses existence logic directly and short-circuits efficiently in many engines.",
  },
  {
    id: "sql-q12",
    track: "sql",
    conceptTags: ["subqueries"],
    difficulty: "medium",
    prompt:
      "A scalar subquery used in SELECT list must return what per outer row?",
    options: [
      "Exactly one column and one value",
      "Any number of rows",
      "Only NULL",
      "A full table",
    ],
    answerIndex: 0,
    explanation:
      "Scalar subqueries are expected to produce a single value for each outer row.",
  },
  {
    id: "js-q1",
    track: "javascript-fundamentals",
    conceptTags: ["variables-types"],
    difficulty: "easy",
    prompt: "Which declaration cannot be reassigned to a different value?",
    options: ["var", "let", "const", "function"],
    answerIndex: 2,
    explanation: "const bindings cannot be reassigned after initialization.",
  },
  {
    id: "js-q2",
    track: "javascript-fundamentals",
    conceptTags: ["variables-types"],
    difficulty: "medium",
    prompt: "What is the result type of typeof null in JavaScript?",
    options: ["null", "object", "undefined", "number"],
    answerIndex: 1,
    explanation:
      "typeof null returns 'object' due to a historical language quirk.",
  },
  {
    id: "js-q3",
    track: "javascript-fundamentals",
    conceptTags: ["functions-scope"],
    difficulty: "medium",
    prompt:
      "A function accessing variables from its outer scope demonstrates what concept?",
    options: ["Hoisting", "Closure", "Destructuring", "Debouncing"],
    answerIndex: 1,
    explanation:
      "Closures allow functions to retain access to lexical scope variables.",
  },
  {
    id: "js-q4",
    track: "javascript-fundamentals",
    conceptTags: ["functions-scope"],
    difficulty: "hard",
    prompt:
      "Which statement about function declarations vs expressions is correct?",
    options: [
      "Both are hoisted with initialized bodies identically",
      "Function declarations are hoisted with definition; const expressions are not callable before initialization",
      "Function expressions cannot take parameters",
      "Declarations cannot be recursive",
    ],
    answerIndex: 1,
    explanation:
      "Declarations are fully hoisted, but const-assigned expressions are in temporal dead zone.",
  },
  {
    id: "js-q5",
    track: "javascript-fundamentals",
    conceptTags: ["functions-scope"],
    difficulty: "easy",
    prompt:
      "What does a function return if no explicit return statement is present?",
    options: ["null", "0", "undefined", "false"],
    answerIndex: 2,
    explanation: "JavaScript functions return undefined by default.",
  },
  {
    id: "js-q6",
    track: "javascript-fundamentals",
    conceptTags: ["arrays-objects"],
    difficulty: "medium",
    prompt:
      "Which array method transforms every element and returns a new array?",
    options: ["forEach", "map", "find", "some"],
    answerIndex: 1,
    explanation:
      "map applies a transform to each element and returns the transformed array.",
  },
  {
    id: "js-q7",
    track: "javascript-fundamentals",
    conceptTags: ["arrays-objects"],
    difficulty: "hard",
    prompt:
      "What does the spread operator {...obj} produce for nested objects?",
    options: [
      "A deep clone of all nested fields",
      "A shallow copy; nested references are shared",
      "The original object reference",
      "A frozen object",
    ],
    answerIndex: 1,
    explanation:
      "Spread creates a shallow clone, so nested objects still share references.",
  },
  {
    id: "js-q8",
    track: "javascript-fundamentals",
    conceptTags: ["async-basics"],
    difficulty: "easy",
    prompt:
      "Which keyword pauses execution inside an async function until a promise settles?",
    options: ["yield", "await", "defer", "pause"],
    answerIndex: 1,
    explanation:
      "await can be used inside async functions to wait for promises.",
  },
  {
    id: "js-q9",
    track: "javascript-fundamentals",
    conceptTags: ["async-basics"],
    difficulty: "medium",
    prompt: "Where should promise rejection handling go in async/await style?",
    options: [
      "Inside try/catch or with .catch",
      "Only in finally",
      "Nowhere; rejections are ignored",
      "Inside setInterval",
    ],
    answerIndex: 0,
    explanation:
      "Use try/catch around awaited calls or chain .catch for proper error handling.",
  },
  {
    id: "js-q10",
    track: "javascript-fundamentals",
    conceptTags: ["async-basics"],
    difficulty: "hard",
    prompt:
      "Given synchronous code plus Promise.resolve().then(...), when does .then callback run?",
    options: [
      "Before all sync code",
      "After current call stack, in microtask queue",
      "Only after setTimeout(0)",
      "At random depending on browser",
    ],
    answerIndex: 1,
    explanation:
      "Promise callbacks run as microtasks after synchronous code completes.",
  },
  {
    id: "js-q11",
    track: "javascript-fundamentals",
    conceptTags: ["dom-events"],
    difficulty: "medium",
    prompt: "What is event delegation primarily used for?",
    options: [
      "Prevent all events globally",
      "Handle events for many dynamic children using one parent listener",
      "Speed up CSS rendering",
      "Disable bubbling",
    ],
    answerIndex: 1,
    explanation:
      "Delegation attaches one parent handler and inspects event target for child actions.",
  },
  {
    id: "js-q12",
    track: "javascript-fundamentals",
    conceptTags: ["dom-events"],
    difficulty: "hard",
    prompt:
      "Which call stops an event from triggering parent listeners during bubbling?",
    options: [
      "preventDefault()",
      "stopPropagation()",
      "removeEventListener()",
      "dispatchEvent()",
    ],
    answerIndex: 1,
    explanation:
      "stopPropagation prevents the event from bubbling to ancestor listeners.",
  },
];

export function getQuestionsForTrack(trackKey: TrackKey): Question[] {
  return ADAPTIVE_QUESTION_BANK.filter(
    (question) => question.track === trackKey,
  );
}

const CODING_KEYWORDS = [
  "dsa",
  "data structures and algorithms",
  "algorithm",
  "algorithms",
  "data structure",
  "data structures",
  "array",
  "arrays",
  "string",
  "strings",
  "linked list",
  "linked lists",
  "tree",
  "trees",
  "graph",
  "graphs",
  "heap",
  "heaps",
  "stack",
  "stacks",
  "queue",
  "queues",
  "hash",
  "hash map",
  "hash maps",
  "hash table",
  "hash tables",
  "set",
  "sets",
  "map",
  "maps",
  "recursion",
  "dynamic programming",
  "dp",
  "greedy",
  "backtracking",
  "binary search",
  "sorting",
  "bit manipulation",
  "sliding window",
  "two pointers",
  "prefix sum",
  "segment tree",
  "trie",
  "union find",
  "dfs",
  "bfs",
  "topological",
  "dijkstra",
  "bellman",
  "floyd",
  "leetcode",
  "competitive programming",
  "system design",
  "object oriented",
  "oop",
  "database",
  "sql",
  "nosql",
  "postgres",
  "mysql",
  "mongodb",
  "redis",
  "api",
  "rest",
  "graphql",
  "state management",
  "context api",
  "redux",
  "zustand",
  "microservice",
  "microservices",
  "backend",
  "frontend",
  "full stack",
  "fullstack",
  "javascript",
  "js",
  "typescript",
  "ts",
  "python",
  "java",
  "c++",
  "c#",
  "go",
  "rust",
  "kotlin",
  "swift",
  "scala",
  "php",
  "ruby",
  "node",
  "express",
  "react",
  "react hook",
  "react hooks",
  "hook",
  "hooks",
  "use state",
  "usestate",
  "use effect",
  "useeffect",
  "use memo",
  "usememo",
  "use callback",
  "usecallback",
  "use ref",
  "useref",
  "custom hook",
  "custom hooks",
  "next",
  "angular",
  "vue",
  "django",
  "flask",
  "spring",
  "laravel",
  "docker",
  "kubernetes",
  "devops",
  "git",
  "testing",
  "unit test",
  "integration test",
  "ci cd",
  "operating system",
  "os",
  "computer networks",
  "networking",
  "compiler",
  "machine learning",
  "deep learning",
  "nlp",
  "prompt engineering",
  "ai",
  "web development",
  "mobile development",
  "android",
  "ios",
  "react native",
  "flutter",
];

const NON_CODING_KEYWORDS = [
  "cooking",
  "recipe",
  "history",
  "geography",
  "politics",
  "football",
  "cricket",
  "basketball",
  "movie",
  "music",
  "dance",
  "astrology",
  "religion",
  "meditation",
  "yoga",
  "diet",
  "travel",
  "fashion",
  "makeup",
  "gardening",
  "pet care",
  "poetry",
  "painting",
  "photography",
  "medicine",
  "biology",
  "chemistry",
  "economics",
  "law",
];

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasKeyword(text: string, keyword: string): boolean {
  const allowSimplePlural = /[a-rt-z]$/i.test(keyword);
  const pluralSuffix = allowSimplePlural ? "s?" : "";
  const pattern = new RegExp(
    `(^|[^a-z0-9#+])${escapeRegex(keyword)}${pluralSuffix}([^a-z0-9#+]|$)`,
    "i",
  );
  return pattern.test(text);
}

export function normalizeTopic(topic: string): string {
  return normalizeWhitespace(topic).slice(0, 80);
}

export function parseTopicList(value: string): string[] {
  const chunks = value.split(/[\n,;|]/g);
  const unique = new Set<string>();

  for (const chunk of chunks) {
    const normalized = normalizeTopic(chunk);
    if (normalized.length < 2) {
      continue;
    }

    unique.add(normalized);
    if (unique.size >= 8) {
      break;
    }
  }

  return Array.from(unique);
}

export function sanitizeTopicArray(topics: string[]): string[] {
  const unique = new Set<string>();

  for (const topic of topics) {
    const normalized = normalizeTopic(topic);
    if (normalized.length < 2) {
      continue;
    }

    unique.add(normalized);
    if (unique.size >= 8) {
      break;
    }
  }

  return Array.from(unique);
}

export function isCodingTopic(topic: string): boolean {
  const normalized = normalizeTopic(topic).toLowerCase();

  if (normalized.length < 2) {
    return false;
  }

  const hasCodingSignal = CODING_KEYWORDS.some((keyword) =>
    hasKeyword(normalized, keyword),
  );

  if (hasCodingSignal) {
    return true;
  }

  const hasGeneralCodingSignal =
    /\b(code|coding|programming|software|developer|computer science|cs)\b/i.test(
      normalized,
    );

  if (hasGeneralCodingSignal) {
    return true;
  }

  const hasNonCodingSignal = NON_CODING_KEYWORDS.some((keyword) =>
    hasKeyword(normalized, keyword),
  );

  if (hasNonCodingSignal) {
    return false;
  }

  return false;
}

export function splitCodingTopics(topics: string[]): {
  validTopics: string[];
  invalidTopics: string[];
} {
  const cleaned = sanitizeTopicArray(topics);
  const validTopics: string[] = [];
  const invalidTopics: string[] = [];

  for (const topic of cleaned) {
    if (isCodingTopic(topic)) {
      validTopics.push(topic);
      continue;
    }

    invalidTopics.push(topic);
  }

  return { validTopics, invalidTopics };
}

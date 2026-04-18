import type { Track, TrackKey } from "@/types/adaptive";

export const ADAPTIVE_TRACKS: Track[] = [
  {
    key: "dsa",
    label: "Data Structures and Algorithms",
    description:
      "Sharpen pattern recognition, complexity reasoning, and interview-style problem solving.",
    icon: "DSA",
    conceptIds: [
      "arrays",
      "two-pointers",
      "sliding-window",
      "binary-search",
      "graph-basics",
    ],
  },
  {
    key: "sql",
    label: "SQL",
    description:
      "Build confident data querying skills from filtering fundamentals to analytical patterns.",
    icon: "SQL",
    conceptIds: [
      "basic-select",
      "filtering",
      "joins",
      "grouping-aggregation",
      "subqueries",
    ],
  },
  {
    key: "javascript-fundamentals",
    label: "JavaScript Fundamentals",
    description:
      "Strengthen core JavaScript thinking for browser apps and interview-ready coding fluency.",
    icon: "JS",
    conceptIds: [
      "variables-types",
      "functions-scope",
      "arrays-objects",
      "async-basics",
      "dom-events",
    ],
  },
];

export const TRACK_MAP = new Map<TrackKey, Track>(
  ADAPTIVE_TRACKS.map((track) => [track.key, track]),
);

export function getTrack(trackKey: string | null | undefined): Track {
  if (!trackKey) {
    return ADAPTIVE_TRACKS[0];
  }

  return TRACK_MAP.get(trackKey as TrackKey) ?? ADAPTIVE_TRACKS[0];
}

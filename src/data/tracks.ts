import type { LearningTrack } from "@/types/learning";

export const LEARNING_TRACKS: LearningTrack[] = [
  {
    id: "dsa-interview-prep",
    name: "DSA Interview Prep",
    domain: "Data Structures and Algorithms",
    summary:
      "Discover weak concepts quickly and follow a targeted roadmap before your next coding interview round.",
    topics: [
      "Arrays",
      "Sliding Window",
      "Two Pointers",
      "Binary Search",
      "Graph Basics",
    ],
    defaultQuestionCount: 10,
  },
];

export function getTrackById(trackId: string): LearningTrack {
  return (
    LEARNING_TRACKS.find((track) => track.id === trackId) ?? LEARNING_TRACKS[0]
  );
}

"use client";

import type { Question } from "@/types/adaptive";

interface QuizQuestionCardProps {
  question: Question;
  selectedOption: number | undefined;
  onSelect: (optionIndex: number) => void;
}

function conceptLabel(conceptId: string): string {
  return conceptId
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function difficultyColor(difficulty: Question["difficulty"]): string {
  switch (difficulty) {
    case "easy":
      return "bg-white/12 text-neutral-100";
    case "hard":
      return "bg-neutral-700/55 text-neutral-200";
    default:
      return "bg-neutral-600/45 text-neutral-200";
  }
}

export function QuizQuestionCard({
  question,
  selectedOption,
  onSelect,
}: QuizQuestionCardProps) {
  return (
    <div className="card-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyColor(question.difficulty)}`}
        >
          {question.difficulty}
        </span>
        {question.conceptTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-line bg-black/35 px-2.5 py-1 text-xs text-ink-soft"
          >
            {conceptLabel(tag)}
          </span>
        ))}
      </div>

      <h2 className="mt-5 text-xl leading-tight text-foreground sm:text-2xl">
        {question.prompt}
      </h2>

      <div className="mt-6 grid gap-3">
        {question.options.map((option, index) => {
          const selected = selectedOption === index;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(index)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition sm:text-base ${
                selected
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-line bg-black/35 text-foreground hover:border-brand"
              }`}
            >
              <span className="mr-2 font-semibold">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

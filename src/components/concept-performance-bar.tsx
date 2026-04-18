import type { ConceptPerformance } from "@/types/adaptive";

interface ConceptPerformanceBarProps {
  stat: ConceptPerformance;
}

function levelTone(level: ConceptPerformance["status"]) {
  if (level === "Strong") {
    return {
      color: "bg-neutral-200",
      label: "text-neutral-100",
    };
  }

  if (level === "Improving") {
    return {
      color: "bg-neutral-400",
      label: "text-neutral-300",
    };
  }

  return {
    color: "bg-neutral-600",
    label: "text-neutral-400",
  };
}

export function ConceptPerformanceBar({ stat }: ConceptPerformanceBarProps) {
  const tone = levelTone(stat.status);

  return (
    <div className="rounded-xl border border-line bg-black/35 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {stat.conceptName}
        </p>
        <p
          className={`text-xs font-semibold uppercase tracking-widest ${tone.label}`}
        >
          {stat.status}
        </p>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${tone.color}`}
          style={{ width: `${Math.max(4, stat.accuracy)}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-ink-soft">
        {Math.round(stat.accuracy)}% accuracy ({stat.correct}/{stat.total})
      </p>

      {stat.prerequisiteGap ? (
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-300">
          Prerequisite gap detected
        </p>
      ) : null}
    </div>
  );
}

import type { RoadmapStep } from "@/types/adaptive";

interface RoadmapTimelineProps {
  items: RoadmapStep[];
}

export function RoadmapTimeline({ items }: RoadmapTimelineProps) {
  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li
          key={item.conceptId}
          className="card-surface relative overflow-hidden p-5 sm:p-6"
        >
          <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-white/75 to-neutral-500/75" />
          <div className="ml-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
                  Priority {index + 1}
                </p>
                <h3 className="text-xl font-semibold text-foreground">
                  {item.conceptName}
                </h3>
              </div>
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold text-neutral-200">
                {item.prerequisiteRepair
                  ? "Prerequisite Repair"
                  : "Primary Focus"}
              </span>
            </div>

            <p className="mt-4 text-sm text-ink-soft">{item.reason}</p>

            <div className="mt-4 rounded-xl bg-surface-strong p-4">
              <p className="text-sm font-semibold text-foreground">
                What to study first
              </p>
              <p className="mt-1 text-sm text-ink-soft">{item.studyFocus}</p>
            </div>

            <p className="mt-4 text-sm text-ink-soft">{item.whyNow}</p>

            <div className="mt-4 grid gap-2">
              {item.practicePlan.map((task) => (
                <p
                  key={task}
                  className="rounded-lg border border-line bg-black/35 px-3 py-2 text-sm text-foreground"
                >
                  {task}
                </p>
              ))}
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-ink-soft">
              Retest: {item.retestCriteria}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

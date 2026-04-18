"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardMasteryBand, DashboardTrendPoint } from "@/lib/progress";
import type { ConceptStat } from "@/types/learning";

interface DashboardChartsProps {
  trend: DashboardTrendPoint[];
  conceptStats: ConceptStat[];
  masteryBands: DashboardMasteryBand[];
}

const BAND_COLORS = {
  Strong: "#10b981",
  Improving: "#60a5fa",
  Weak: "#f59e0b",
} as const;

const CONCEPT_BAR_COLOR = "#d4d4d8";

interface ChartSize {
  width: number;
  height: number;
}

function MeasuredChart({
  children,
}: {
  children: (size: ChartSize) => React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ChartSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateFromRect = (width: number, height: number) => {
      const next = {
        width: Math.max(0, Math.floor(width)),
        height: Math.max(0, Math.floor(height)),
      };

      setSize((previous) =>
        previous.width === next.width && previous.height === next.height
          ? previous
          : next,
      );
    };

    const initial = element.getBoundingClientRect();
    updateFromRect(initial.width, initial.height);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        updateFromRect(entry.contentRect.width, entry.contentRect.height);
      });

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }

    const onResize = () => {
      const rect = element.getBoundingClientRect();
      updateFromRect(rect.width, rect.height);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const isReady = size.width > 24 && size.height > 24;

  return (
    <div ref={containerRef} className="h-full min-h-[16rem] min-w-0 w-full">
      {isReady ? (
        children(size)
      ) : (
        <p className="text-sm text-neutral-400">Loading chart...</p>
      )}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  delay,
  children,
}: {
  title: string;
  subtitle: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="min-w-0 rounded-2xl border border-white/10 bg-black/35 p-5"
    >
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-neutral-400">{subtitle}</p>
      <div className="mt-4 h-64 min-h-[16rem] min-w-0 w-full">{children}</div>
    </motion.article>
  );
}

export function DashboardCharts({
  trend,
  conceptStats,
  masteryBands,
}: DashboardChartsProps) {
  const hasTrendData = trend.length > 0;
  const hasConceptData = conceptStats.length > 0;
  const hasBandData = masteryBands.some((entry) => entry.value > 0);

  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2">
      <ChartCard
        title="Mastery Trend"
        subtitle="How your overall mastery changes across recent attempts"
        delay={0.05}
      >
        {hasTrendData ? (
          <MeasuredChart>
            {({ width, height }) => (
              <LineChart
                width={width}
                height={height}
                data={trend}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#a3a3a3", fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#a3a3a3", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b0b0b",
                    borderColor: "#2b2b2b",
                    borderRadius: "10px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mastery"
                  stroke="#fafafa"
                  strokeWidth={2}
                  dot={{ r: 3, stroke: "#fafafa", fill: "#0a0a0a" }}
                />
              </LineChart>
            )}
          </MeasuredChart>
        ) : (
          <p className="text-sm text-neutral-400">No attempt history yet.</p>
        )}
      </ChartCard>

      <ChartCard
        title="Mastery Distribution"
        subtitle="Breakdown of strong, improving, and weak concepts"
        delay={0.1}
      >
        {hasBandData ? (
          <MeasuredChart>
            {({ width, height }) => {
              const outerRadius = Math.max(46, Math.min(width, height) * 0.32);
              const innerRadius = Math.max(28, outerRadius - 30);

              return (
                <PieChart width={width} height={height}>
                  <Pie
                    data={masteryBands}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={outerRadius}
                    innerRadius={innerRadius}
                    paddingAngle={4}
                  >
                    {masteryBands.map((entry) => (
                      <Cell key={entry.name} fill={BAND_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0b0b",
                      borderColor: "#2b2b2b",
                      borderRadius: "10px",
                    }}
                  />
                </PieChart>
              );
            }}
          </MeasuredChart>
        ) : (
          <p className="text-sm text-neutral-400">
            No concept bands available yet.
          </p>
        )}
      </ChartCard>

      <ChartCard
        title="Concept Performance"
        subtitle="Latest attempt concept mastery levels"
        delay={0.15}
      >
        {hasConceptData ? (
          <MeasuredChart>
            {({ width, height }) => (
              <BarChart
                width={width}
                height={height}
                data={conceptStats}
                margin={{ top: 8, right: 8, left: 0, bottom: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis
                  dataKey="concept"
                  tick={{ fill: "#a3a3a3", fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={52}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#a3a3a3", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b0b0b",
                    borderColor: "#2b2b2b",
                    borderRadius: "10px",
                  }}
                />
                <Bar
                  dataKey="mastery"
                  radius={[8, 8, 0, 0]}
                  fill={CONCEPT_BAR_COLOR}
                />
              </BarChart>
            )}
          </MeasuredChart>
        ) : (
          <p className="text-sm text-neutral-400">
            Take a quiz to unlock concept-level analytics.
          </p>
        )}
      </ChartCard>
    </section>
  );
}

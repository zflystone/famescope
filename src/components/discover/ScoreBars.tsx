import type { DiscoverScore } from "@/lib/fixtures/discover";

const DIMS = [
  { key: "influence" as const, label: "影响力" },
  { key: "relevance" as const, label: "相关性" },
  { key: "activity" as const, label: "活跃度" },
];

/** 三维评分可视化：三行细横条 + 填充动效（通过 animation-delay stagger）。*/
export default function ScoreBars({
  score,
  delay = 0,
}: {
  score: DiscoverScore;
  delay?: number;
}) {
  return (
    <div className="space-y-1.5">
      {DIMS.map((d, i) => (
        <div key={d.key} className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-right text-tiny text-content-tertiary">
            {d.label}
          </span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="animate-score-fill absolute inset-y-0 left-0 rounded-full bg-brand"
              style={{
                width: `${score[d.key]}%`,
                animationDelay: `${delay + i * 60}ms`,
              }}
            />
          </div>
          <span className="w-6 shrink-0 text-tiny tabular-nums text-content-tertiary">
            {score[d.key]}
          </span>
        </div>
      ))}
    </div>
  );
}

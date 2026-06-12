interface StatItem { label: string; value: string }

/** 今日数字摘要：4格横向排列。*/
export default function DigestStats({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center gap-0.5 rounded-lg bg-surface py-2.5 shadow-card"
        >
          <span className="text-[18px] font-semibold leading-none text-content-primary">
            {s.value}
          </span>
          <span className="text-tiny text-content-tertiary">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

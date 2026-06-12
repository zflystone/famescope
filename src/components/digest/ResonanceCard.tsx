import type { SignalResonance } from "@/lib/fixtures/digest";
import { IconWaveSine } from "@tabler/icons-react";

/**
 * 信号共振卡片：多人同时提到同一话题。
 * 视觉重点：并排小头像 cluster，话题名大字，描述段落。
 */
export default function ResonanceCard({ item }: { item: SignalResonance }) {
  return (
    <div className="rounded-lg bg-surface p-card shadow-card">
      {/* 话题 + 图标 */}
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-weak text-brand">
          <IconWaveSine size={15} stroke={1.8} />
        </span>
        <span className="text-[14px] font-semibold text-content-primary">
          {item.topic}
        </span>
      </div>

      {/* 头像群 cluster */}
      <div className="mt-2.5 flex items-center gap-1.5">
        <div className="flex -space-x-2">
          {item.sources.map((s) => (
            <span
              key={s.id}
              className="flex h-7 w-7 shrink-0 items-center justify-center text-[11px] font-bold text-white ring-2 ring-surface"
              style={{
                borderRadius: s.type === "org" ? "5px" : "50%",
                background: s.avatarTint,
              }}
            >
              {s.avatarText}
            </span>
          ))}
        </div>
        <span className="text-meta text-content-secondary">
          {item.sources.map((s) => s.nameZh).join(" · ")} 同时提到
        </span>
      </div>

      {/* 描述 */}
      <p className="mt-2 text-body text-content-secondary">{item.description}</p>

      {/* 标签 */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {item.tags.map((t) => (
          <span
            key={t}
            className="rounded-pill bg-brand-weak px-2 py-0.5 text-tiny font-medium text-brand"
          >
            #{t}
          </span>
        ))}
      </div>
    </div>
  );
}

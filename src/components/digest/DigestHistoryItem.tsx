"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronUp, IconBulb } from "@tabler/icons-react";
import type { DigestEntry } from "@/lib/fixtures/digest";
import HighlightCard from "./HighlightCard";
import ResonanceCard from "./ResonanceCard";
import OfficialNewsRow from "./OfficialNewsRow";
import SourceActivityRow from "./SourceActivityRow";

/** 历史简报折叠项：默认收起，点击展开全内容。*/
export default function DigestHistoryItem({ entry }: { entry: DigestEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-card">
      {/* 折叠头部 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-card text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-tiny font-medium text-content-tertiary">{entry.date}</p>
          <p className="mt-0.5 text-[13px] font-medium leading-snug text-content-primary line-clamp-2">
            {entry.coreConclusion}
          </p>
          {/* 小头像群 */}
          {!open && (
            <div className="mt-2 flex -space-x-1.5">
              {entry.sourceActivity.slice(0, 4).map((a) => (
                <span
                  key={a.source.id}
                  className="flex h-5 w-5 items-center justify-center text-[9px] font-bold text-white ring-2 ring-surface"
                  style={{
                    borderRadius: a.source.type === "org" ? "4px" : "50%",
                    background: a.source.avatarTint,
                  }}
                >
                  {a.source.avatarText}
                </span>
              ))}
              {entry.sourceActivity.length > 4 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-tiny text-content-tertiary ring-2 ring-surface">
                  +{entry.sourceActivity.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
        <span className="mt-0.5 shrink-0 text-content-tertiary">
          {open ? <IconChevronUp size={18} stroke={1.8} /> : <IconChevronDown size={18} stroke={1.8} />}
        </span>
      </button>

      {/* 展开内容 */}
      {open && (
        <div className="space-y-4 border-t border-line-divider px-card pb-card pt-3">
          {/* 核心 */}
          <div
            className="rounded-lg bg-surface-2 p-3"
            style={{ borderLeft: "3px solid var(--color-brand)" }}
          >
            <div className="mb-1 flex items-center gap-1.5 text-tiny font-semibold uppercase tracking-wider text-brand">
              <IconBulb size={12} />
              今日核心
            </div>
            <p className="text-body text-content-primary">{entry.coreConclusion}</p>
          </div>

          {/* 高亮 */}
          {entry.highlights.length > 0 && (
            <div className="space-y-2.5">
              {entry.highlights.map((h, i) => (
                <HighlightCard key={h.id} item={h} rank={i + 1} />
              ))}
            </div>
          )}

          {/* 信号共振 */}
          {entry.resonance.length > 0 && (
            <div className="space-y-2.5">
              {entry.resonance.map((r) => (
                <ResonanceCard key={r.topic} item={r} />
              ))}
            </div>
          )}

          {/* 官方新闻 */}
          {entry.officialNews.length > 0 && (
            <div className="rounded-lg bg-surface shadow-card">
              {entry.officialNews.map((n) => (
                <OfficialNewsRow key={n.title} item={n} />
              ))}
            </div>
          )}

          {/* 你关注的人 */}
          <div className="rounded-lg bg-surface shadow-card">
            {entry.sourceActivity.map((a) => (
              <SourceActivityRow key={a.source.id} item={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import type { SourceActivity } from "@/lib/fixtures/digest";
import Avatar from "@/components/feed/Avatar";

/** 你关注的人 — 每个信源今日动态数 + 顶部摘要一句话。*/
export default function SourceActivityRow({ item }: { item: SourceActivity }) {
  return (
    <div className="flex items-center gap-3 border-b border-line-divider py-2.5 last:border-b-0">
      <Avatar source={item.source} size={34} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-name font-medium text-content-primary">
            {item.source.nameZh}
            <span className="ml-1 text-content-tertiary">· {item.source.nameEn}</span>
          </span>
          <span className="shrink-0 text-tiny text-content-tertiary">
            {item.count} 条
          </span>
        </div>
        <p className="mt-0.5 truncate text-meta text-content-secondary">
          {item.topSummary}
        </p>
      </div>
    </div>
  );
}

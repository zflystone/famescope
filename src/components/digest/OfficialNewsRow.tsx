import { IconArrowUpRight } from "@tabler/icons-react";
import type { OfficialNewsItem } from "@/lib/fixtures/digest";
import Avatar from "@/components/feed/Avatar";

/** 官方新闻行：紧凑型，方角头像 + 标题 + 一行摘要 + 阅读链接。*/
export default function OfficialNewsRow({ item }: { item: OfficialNewsItem }) {
  return (
    <div className="flex gap-3 border-b border-line-divider py-3 last:border-b-0">
      <Avatar source={item.source} size={32} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium leading-snug text-content-primary">
          {item.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-meta text-content-secondary">
          {item.summaryZh}
        </p>
        <a
          href={item.readUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-0.5 text-tiny font-medium text-brand"
        >
          阅读全文
          <IconArrowUpRight size={12} stroke={2} />
        </a>
      </div>
    </div>
  );
}

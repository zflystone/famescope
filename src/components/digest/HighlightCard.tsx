"use client";

import { useState } from "react";
import { IconShare3, IconStar } from "@tabler/icons-react";
import type { DigestHighlight } from "@/lib/fixtures/digest";
import type { FeedTweet } from "@/lib/fixtures/feed";
import Avatar from "@/components/feed/Avatar";
import ShareModal from "@/components/share/ShareModal";

/** 最值得关注 — 单条高亮卡片，带「分享这条」入口。*/
export default function HighlightCard({ item, rank }: { item: DigestHighlight; rank: number }) {
  const [starred, setStarred] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // 构造 ShareCard 兼容对象
  const shareContent: FeedTweet = {
    id: item.id,
    contentType: "tweet",
    source: item.source,
    relation: "original",
    signalHint: item.signalHint,
    summaryZh: item.summaryZh,
    originalText: item.signalHint,
    tags: item.tags,
    publishedLabel: "今日简报",
    score: item.score,
    hasOpinion: true,
    isRead: true,
    isStarred: false,
  };

  return (
    <div className="rounded-lg bg-surface p-card shadow-card">
      {/* 头部：排名 + 头像 + 人名 */}
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-tiny font-bold text-brand-on"
          style={{ background: "var(--color-brand)" }}
        >
          {rank}
        </span>
        <Avatar source={item.source} size={32} />
        <div className="min-w-0 flex-1">
          <span className="text-name font-medium text-content-primary">
            {item.source.nameZh}
            <span className="text-content-tertiary"> · {item.source.nameEn}</span>
          </span>
          <p className="text-tiny text-content-tertiary">
            {item.source.company} · 评分 {item.score}/10
          </p>
        </div>
      </div>

      {/* 信号提示 */}
      <p
        className="mt-2.5 text-meta font-medium text-warning-fg"
        style={{
          borderLeft: "2px solid var(--color-text-warning)",
          paddingLeft: "8px",
          background: "var(--color-background-warning)",
          borderRadius: "0 6px 6px 0",
          padding: "6px 8px",
        }}
      >
        {item.signalHint}
      </p>

      {/* 摘要 */}
      <p className="mt-2 text-body text-content-primary">{item.summaryZh}</p>

      {/* 标签 + 操作 */}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <span
              key={t}
              className="rounded-pill bg-surface-2 px-2 py-0.5 text-tiny text-content-secondary"
            >
              #{t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setStarred((v) => !v)}
            aria-label="收藏"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              starred ? "bg-warning-bg text-warning-fg" : "text-content-tertiary"
            }`}
          >
            <IconStar size={16} stroke={1.7} fill={starred ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            aria-label="分享这条"
            onClick={() => setShowShare(true)}
            className="flex h-8 items-center gap-1 rounded-md bg-info-bg px-2 text-tiny font-medium text-info-fg"
          >
            <IconShare3 size={14} stroke={1.7} />
            分享
          </button>
        </div>
      </div>
      {showShare && (
        <ShareModal content={shareContent} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

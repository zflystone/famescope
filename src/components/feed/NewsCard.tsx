"use client";

import { useState } from "react";
import { IconArrowUpRight, IconPhoto } from "@tabler/icons-react";
import type { FeedArticle } from "@/lib/fixtures/feed";
import Avatar from "./Avatar";
import SignalHint from "./SignalHint";
import ActionBar from "./ActionBar";
import TagRow from "./TagRow";
import ShareModal from "@/components/share/ShareModal";

/**
 * 新闻卡片（article）：与推文卡片的核心区别——有大字号标题、右上角「新闻」标记、
 * 只展示 AI 摘要绝不展示全文、明确的「阅读全文」跳转。
 */
export default function NewsCard({ article }: { article: FeedArticle }) {
  const [starred, setStarred] = useState(article.isStarred);
  const [showShare, setShowShare] = useState(false);

  async function handleToggleStar() {
    const next = !starred;
    setStarred(next);
    fetch("/api/posts/star", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: article.id, starred: next }),
    }).catch(() => setStarred(!next));
  }

  return (
    <>
    <article className="rounded-lg bg-surface p-card shadow-card">
      {/* 头部 */}
      <header className="flex items-start gap-2">
        <span className="mt-3.5 flex w-1 shrink-0 justify-center">
          {!article.isRead && (
            <span className="h-1.5 w-1.5 rounded-full bg-unread" />
          )}
        </span>

        <Avatar source={article.source} />

        <div className="min-w-0 flex-1">
          <span className="truncate text-name font-medium text-content-primary">
            {article.source.nameEn}
          </span>
          <p className="truncate text-meta text-content-secondary">
            {article.source.title} · {article.publishedLabel}
          </p>
        </div>

        {/* 右上角「新闻」标记替代关系标注 */}
        <span
          className="shrink-0 bg-brand-weak px-1.5 py-0.5 text-tiny font-medium text-brand"
          style={{ borderRadius: "6px" }}
        >
          新闻
        </span>
      </header>

      <div className="mt-2.5 space-y-2.5 pl-[26px]">
        <SignalHint text={article.signalHint} />

        {/* 配图（可选，引用原 URL；此处用占位） */}
        {article.imageUrl !== undefined && (
          <div className="relative flex aspect-[2/1] items-center justify-center overflow-hidden rounded-md bg-surface-2">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-weak to-transparent" />
            <IconPhoto
              size={24}
              stroke={1.5}
              className="relative text-content-tertiary"
            />
          </div>
        )}

        {/* 标题（新闻卡片最大区别：大字号突出） */}
        <h2 className="text-news-title font-medium text-content-primary">
          {article.title}
        </h2>

        {/* AI 摘要（≤200字），绝不展示全文 */}
        <p className="text-body text-content-secondary">{article.summaryZh}</p>

        {/* 阅读全文跳转 */}
        <a
          href={article.readUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-meta font-medium text-brand active:opacity-70"
        >
          阅读全文
          <IconArrowUpRight size={14} stroke={2} />
        </a>

        <TagRow tags={article.tags} />

        <ActionBar
          isStarred={starred}
          onToggleStar={handleToggleStar}
          onShare={() => setShowShare(true)}
        />
      </div>
    </article>

    {showShare && (
      <ShareModal content={article} onClose={() => setShowShare(false)} />
    )}
    </>
  );
}

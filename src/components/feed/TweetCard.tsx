"use client";

import { useState } from "react";
import { IconQuote, IconExternalLink } from "@tabler/icons-react";
import type { FeedTweet } from "@/lib/fixtures/feed";
import Avatar from "./Avatar";
import ActionBar from "./ActionBar";
import TagRow from "./TagRow";
import ShareModal from "@/components/share/ShareModal";

const RELATION_LABEL: Record<FeedTweet["relation"], string> = {
  original: "原创",
  quote: "引用",
  reply: "回复",
};

// 把文本里的 URL 渲染成可点击链接
function TextWithLinks({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all underline"
            style={{ color: "var(--color-brand)" }}
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function TweetCard({ tweet }: { tweet: FeedTweet }) {
  const [starred, setStarred] = useState(tweet.isStarred);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showShare, setShowShare] = useState(false);

  async function handleToggleStar() {
    const next = !starred;
    setStarred(next);
    fetch("/api/posts/star", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: tweet.id, starred: next }),
    }).catch(() => setStarred(!next)); // revert on network error
  }

  return (
    <>
    <article className="rounded-lg bg-surface p-card shadow-card">
      {/* 头部 */}
      <header className="flex items-start gap-2">
        {/* 未读圆点 */}
        <span className="mt-3.5 flex w-1 shrink-0 justify-center">
          {!tweet.isRead && (
            <span className="h-1.5 w-1.5 rounded-full bg-unread" />
          )}
        </span>

        <Avatar source={tweet.source} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-name font-medium text-content-primary">
              {tweet.source.nameZh}
              <span className="text-content-tertiary"> · {tweet.source.nameEn}</span>
            </span>
          </div>
          <p className="truncate text-meta text-content-secondary">
            {tweet.source.company} {tweet.source.title} · {tweet.publishedLabel}
          </p>
        </div>

        {/* 关系标签 */}
        <span
          className="shrink-0 bg-surface-2 px-1.5 py-0.5 text-tiny font-medium text-content-secondary"
          style={{ borderRadius: "6px" }}
        >
          {RELATION_LABEL[tweet.relation]}
          {tweet.relation !== "original" && tweet.relationTarget
            ? ` ${tweet.relationTarget}`
            : ""}
        </span>
      </header>

      <div className="mt-2.5 space-y-2.5 pl-[20px]">
        {/* 中文直译，点「原文」后在下方展开英文原文 */}
        <p className="text-body text-content-primary">
          <TextWithLinks text={tweet.summaryZh} />
        </p>
        {showOriginal && (
          <p
            className="text-body text-content-secondary"
            style={{ borderLeft: "2px solid var(--color-brand)", paddingLeft: "10px" }}
          >
            <TextWithLinks text={tweet.originalText} />
          </p>
        )}

        {/* 引用块 */}
        {tweet.quoted && (
          <div className="rounded-md border border-line bg-surface-2 p-2.5">
            <div className="mb-1 flex items-center gap-1 text-meta text-content-secondary">
              <IconQuote size={12} stroke={2} />
              <span className="font-medium text-content-primary">
                {tweet.quoted.sourceName}
              </span>
              <span>{tweet.quoted.handle}</span>
            </div>
            <p className="line-clamp-3 text-meta leading-relaxed text-content-secondary">
              {tweet.quoted.text}
            </p>
          </div>
        )}

        {/* 媒体：图片展示封面；视频改为链接，不展示空白占位 */}
        {tweet.media && !tweet.media.isVideo && (
          <div
            className="overflow-hidden rounded-md bg-surface-2"
            style={{ aspectRatio: String(tweet.media.aspectRatio) }}
          >
            <img
              src={tweet.media.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        {tweet.media?.isVideo && (
          <a
            href={tweet.tweetUrl ?? tweet.media.thumbnailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium"
            style={{
              background: "var(--color-background-info)",
              color: "var(--color-text-info)",
            }}
          >
            <IconExternalLink size={14} stroke={2} />
            查看视频
          </a>
        )}

        <TagRow tags={tweet.tags} />

        <ActionBar
          showOriginal={showOriginal}
          onToggleOriginal={() => setShowOriginal((v) => !v)}
          isStarred={starred}
          onToggleStar={handleToggleStar}
          onShare={() => setShowShare(true)}
        />
      </div>
    </article>

    {showShare && (
      <ShareModal content={tweet} onClose={() => setShowShare(false)} />
    )}
    </>
  );
}

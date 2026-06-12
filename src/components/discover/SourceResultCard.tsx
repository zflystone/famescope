"use client";

import { useState } from "react";
import { IconPlus, IconCheck, IconBadge } from "@tabler/icons-react";
import type { DiscoverSource } from "@/lib/fixtures/discover";
import ScoreBars from "./ScoreBars";

export default function SourceResultCard({
  source,
  index = 0,
  onFollowToggle,
}: {
  source: DiscoverSource;
  index?: number;
  onFollowToggle?: (handle: string, following: boolean) => void;
}) {
  const [following, setFollowing] = useState(source.isFollowing);
  const [loading, setLoading] = useState(false);
  const isOrg = source.type === "org";

  async function toggleFollow() {
    if (loading) return;
    setLoading(true);
    const next = !following;
    try {
      if (next) {
        await fetch("/api/sources/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handle: source.handle,
            nameEn: source.nameEn,
            nameZh: source.nameZh,
            company: source.company,
            title: source.title,
            type: source.type,
            verified: source.verified,
            followersCount: source.followerCount ?? 0,
          }),
        });
      } else {
        await fetch("/api/sources/follow", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: source.handle }),
        });
      }
      setFollowing(next);
      onFollowToggle?.(source.handle, next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="animate-fade-up rounded-xl bg-surface p-card shadow-card"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* 头部 */}
      <div className="flex items-start gap-3">
        {/* 头像 */}
        <div className="relative shrink-0">
          <span
            className="flex h-11 w-11 items-center justify-center text-[18px] font-bold text-white"
            style={{
              borderRadius: isOrg ? "9px" : "50%",
              background: source.avatarTint,
            }}
          >
            {source.avatarText}
          </span>
          {source.verified && (
            <span
              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white"
              title="已认证"
            >
              <IconBadge size={10} stroke={2.5} />
            </span>
          )}
        </div>

        {/* 名称 + bio */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-content-primary">
              {isOrg ? source.nameEn : source.nameZh}
            </span>
            {!isOrg && (
              <span className="text-meta text-content-tertiary">
                · {source.nameEn}
              </span>
            )}
          </div>
          <p className="text-meta text-content-secondary">
            {isOrg ? source.title : `${source.company} · ${source.title}`}
            <span className="ml-2 text-content-tertiary">{source.handle}</span>
          </p>
          <p className="mt-0.5 text-meta text-content-tertiary">
            {source.followerLabel} 粉丝
          </p>
        </div>

        {/* 追踪按钮 */}
        <button
          type="button"
          onClick={toggleFollow}
          disabled={loading}
          className={`flex h-8 shrink-0 items-center gap-1.5 rounded-pill px-3 text-meta font-medium transition-all disabled:opacity-60 ${
            following
              ? "bg-surface-2 text-content-secondary"
              : "bg-brand text-brand-on"
          }`}
        >
          {following ? (
            <>
              <IconCheck size={13} stroke={2.5} />
              已追踪
            </>
          ) : (
            <>
              <IconPlus size={13} stroke={2.5} />
              追踪
            </>
          )}
        </button>
      </div>

      {/* Bio */}
      <p className="mt-2.5 line-clamp-2 text-meta text-content-secondary">
        {source.bio}
      </p>

      {/* 三维评分 */}
      <div className="mt-3">
        <ScoreBars score={source.score} delay={index * 55 + 100} />
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// GET /api/feed?tab=social|news&filter=all|starred|opinion&page=0
// 返回当前用户信息流，按信源追踪时间起算7天内的内容
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleToTint } from "@/lib/fixtures/discover";
import type { FeedTweet, FeedArticle, FeedSource } from "@/lib/fixtures/feed";

const PAGE_SIZE = 20;

function relativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  return `${Math.floor(h / 24)}天前`;
}

function mapSource(src: any): FeedSource {
  return {
    id: src.id,
    type: src.type ?? "person",
    nameZh: src.name_zh ?? src.name_en ?? "",
    nameEn: src.name_en ?? "",
    avatarTint: src.avatar_tint ?? handleToTint(src.x_handle ?? src.id),
    avatarText: (src.name_en ?? src.name_zh ?? "?").slice(0, 1).toUpperCase(),
    company: src.company ?? "",
    title: src.title ?? "",
    domain: src.domain ?? "other",
  };
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") ?? "social"; // social | news
  const filter = searchParams.get("filter") ?? "all"; // all | starred | opinion
  const page = parseInt(searchParams.get("page") ?? "0", 10);

  // 获取用户追踪的信源（含 followed_at，用于7天窗口）
  const { data: userSources } = await supabase
    .from("user_source")
    .select("source_id, followed_at")
    .eq("user_id", user.id);

  if (!userSources?.length) {
    return NextResponse.json({ items: [], total: 0, hasMore: false });
  }

  // 计算每个信源的 7天回溯截止时间
  const sourceWindows = new Map<string, string>();
  for (const us of userSources) {
    const cutoff = new Date(
      new Date(us.followed_at).getTime() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    sourceWindows.set(us.source_id, cutoff);
  }
  const sourceIds = Array.from(sourceWindows.keys());
  // 最早的 cutoff（简化：单一时间窗口取最宽的那个）
  const earliestCutoff = Array.from(sourceWindows.values()).sort()[0];

  const contentType = tab === "news" ? "article" : "tweet";

  // 获取用户收藏状态
  const { data: starredRows } = await supabase
    .from("user_post_state")
    .select("post_id")
    .eq("user_id", user.id)
    .eq("is_starred", true);
  const starredSet = new Set((starredRows ?? []).map((r: any) => r.post_id));

  // 构建查询
  let query = supabase
    .from("post")
    .select("*, source:source(*)", { count: "exact" })
    .in("source_id", sourceIds)
    .eq("content_type", contentType)
    .gte("published_at", earliestCutoff)
    .order("published_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (filter === "opinion" && tab === "social") {
    query = query.eq("has_opinion", true);
  }

  const { data: posts, count } = await query;

  if (!posts) return NextResponse.json({ items: [], total: 0, hasMore: false });

  // 过滤收藏（starred filter，在内存中处理避免复杂 join）
  const filtered =
    filter === "starred" ? posts.filter((p: any) => starredSet.has(p.id)) : posts;

  const items = filtered.map((p: any) => {
    const isStarred = starredSet.has(p.id);
    const src = mapSource(p.source ?? {});
    const publishedLabel = relativeTime(p.published_at);

    if (p.content_type === "article") {
      const article: FeedArticle = {
        id: p.id,
        contentType: "article",
        source: src,
        signalHint: p.signal_hint ?? "",
        title: p.title_zh || p.title || "",
        summaryZh: p.summary_zh ?? "",
        tags: p.tags ?? [],
        publishedLabel,
        score: p.score ?? 5,
        isRead: true,
        isStarred,
        readUrl: p.article_url ?? "",
        imageUrl: p.media_url ?? undefined,
      };
      return article;
    } else {
      const tweetUrl = p.x_tweet_id && p.source?.x_handle
        ? `https://x.com/${p.source.x_handle}/status/${p.x_tweet_id}`
        : undefined;
      const tweet: FeedTweet = {
        id: p.id,
        contentType: "tweet",
        source: src,
        relation: p.relation_type ?? "original",
        relationTarget: p.relation_target ?? undefined,
        signalHint: p.signal_hint ?? "",
        summaryZh: p.summary_zh ?? "",
        originalText: p.original_text ?? "",
        tags: p.tags ?? [],
        publishedLabel,
        score: p.score ?? 5,
        hasOpinion: p.has_opinion ?? false,
        isRead: true,
        isStarred,
        quoted: p.quoted_text
          ? { sourceName: "", handle: "", text: p.quoted_text }
          : undefined,
        media: p.media_url
          ? { thumbnailUrl: p.media_url, isVideo: p.media_is_video ?? false, aspectRatio: 1.78 }
          : undefined,
        tweetUrl,
      };
      return tweet;
    }
  });

  const total = filter === "starred" ? items.length : (count ?? 0);
  const hasMore = filter !== "starred" && (page + 1) * PAGE_SIZE < (count ?? 0);

  return NextResponse.json({ items, total, hasMore });
}

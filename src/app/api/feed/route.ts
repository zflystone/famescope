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
  // middleware 已验证 token，这里直接读 session（本地解析，不发网络请求）
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") ?? "social"; // social | news
  const filter = searchParams.get("filter") ?? "all"; // all | starred | opinion
  const page = parseInt(searchParams.get("page") ?? "0", 10);

  // 并行获取：用户追踪的信源 + 收藏状态
  const [{ data: userSources }, { data: starredRows }] = await Promise.all([
    supabase.from("user_source").select("source_id").eq("user_id", user.id),
    supabase.from("user_post_state").select("post_id").eq("user_id", user.id).eq("is_starred", true),
  ]);

  if (!userSources?.length) {
    return NextResponse.json({ items: [], total: 0, hasMore: false });
  }

  const sourceIds = userSources.map((us: any) => us.source_id);
  const starredSet = new Set((starredRows ?? []).map((r: any) => r.post_id));

  // 只展示最近 3 天的内容
  const cutoff3d = new Date();
  cutoff3d.setUTCDate(cutoff3d.getUTCDate() - 3);
  const earliestCutoff = cutoff3d.toISOString();

  const contentType = tab === "news" ? "article" : "tweet";

  // 构建查询（不用 count:exact 避免全表计数开销）
  let query = supabase
    .from("post")
    .select("*, source:source(*)")
    .in("source_id", sourceIds)
    .eq("content_type", contentType)
    .gte("published_at", earliestCutoff)
    .order("published_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (filter === "opinion" && tab === "social") {
    query = query.eq("has_opinion", true);
  }

  const { data: posts } = await query;

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

  const total = items.length;
  // 取到满页说明可能还有更多，取不满则已到底
  const hasMore = filter !== "starred" && posts.length === PAGE_SIZE;

  return NextResponse.json({ items, total, hasMore });
}

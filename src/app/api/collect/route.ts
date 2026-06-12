// POST /api/collect
// 采集指定信源的最新内容，AI 处理后存入 Supabase
// 触发方式：Vercel Cron 定时调用，或采集完立即触发实时推送检查
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { TwitterApiIoDataSource } from "@/lib/datasource/TwitterApiIoDataSource";
import { processPost } from "@/lib/ai/processPost";
import { sendPushToUser } from "@/lib/push";
import type { DbSource } from "@/types/database";

function isAuthorized(req: Request): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const dataSource = new TwitterApiIoDataSource(process.env.TWITTER_API_IO_KEY!);

  const { data: sources, error } = await supabase
    .from("source")
    .select("*")
    .order("last_fetched_at", { ascending: true, nullsFirst: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = { processed: 0, skipped: 0, errors: 0 };

  // 每个信源并行采集，但每个信源内部的 AI 处理也并行
  await Promise.all(
    (sources as DbSource[]).map(async (source) => {
      try {
        // 推文 + 文章可同时采集（org 信源两个来源都有）
        const [tweets, articles] = await Promise.all([
          source.x_handle ? dataSource.fetchTweets(source.x_handle) : [],
          source.rss_url ? dataSource.fetchArticles!(source.rss_url) : [],
        ]);
        const rawPosts = [...tweets, ...articles];

        // 批量去重：推文按 x_tweet_id，文章按 article_url
        const tweetIds = rawPosts.map((p) => p.xTweetId).filter(Boolean) as string[];
        const articleUrls = rawPosts.map((p) => p.articleUrl).filter(Boolean) as string[];
        const existingTweetIds = new Set<string>();
        const existingArticleUrls = new Set<string>();

        await Promise.all([
          tweetIds.length > 0
            ? supabase.from("post").select("x_tweet_id").in("x_tweet_id", tweetIds)
                .then(({ data }) => (data ?? []).forEach((r: { x_tweet_id: string }) => existingTweetIds.add(r.x_tweet_id)))
            : Promise.resolve(),
          articleUrls.length > 0
            ? supabase.from("post").select("article_url").in("article_url", articleUrls)
                .then(({ data }) => (data ?? []).forEach((r: { article_url: string }) => existingArticleUrls.add(r.article_url)))
            : Promise.resolve(),
        ]);

        const newPosts = rawPosts.filter((p) => {
          if (p.xTweetId) return !existingTweetIds.has(p.xTweetId);
          if (p.articleUrl) return !existingArticleUrls.has(p.articleUrl);
          return true;
        });
        results.skipped += rawPosts.length - newPosts.length;

        if (newPosts.length === 0) return;

        // 并行调用 DeepSeek 处理（控制并发 5 条，避免限流）
        const CONCURRENCY = 5;
        for (let i = 0; i < newPosts.length; i += CONCURRENCY) {
          const batch = newPosts.slice(i, i + CONCURRENCY);
          await Promise.all(
            batch.map(async (raw) => {
              try {
                const processed = await processPost(raw);
                await supabase.from("post").insert({
                  source_id: source.id,
                  content_type: raw.contentType,
                  x_tweet_id: raw.xTweetId,
                  original_text: raw.originalText,
                  relation_type: raw.relationType,
                  relation_target: raw.relationTarget,
                  quoted_tweet_id: raw.quotedTweetId,
                  quoted_text: raw.quotedText,
                  title: raw.title,
                  title_zh: processed.titleZh ?? null,
                  article_url: raw.articleUrl,
                  summary_zh: processed.summaryZh,
                  signal_hint: processed.signalHint,
                  score: processed.score,
                  tags: processed.tags,
                  domain: processed.domain,
                  has_opinion: processed.hasOpinion,
                  media_url: raw.mediaUrl,
                  media_is_video: raw.mediaIsVideo ?? false,
                  media_aspect_ratio: raw.mediaAspectRatio,
                  published_at: raw.publishedAt.toISOString(),
                });
                results.processed++;
              } catch {
                results.errors++;
              }
            })
          );
        }

        await supabase
          .from("source")
          .update({ last_fetched_at: new Date().toISOString() })
          .eq("id", source.id);

        // 实时提醒：找开启了 notify 的订阅用户，发 Web Push
        if (results.processed > 0) {
          const { data: notifyUsers } = await supabase
            .from("user_source")
            .select("user_id")
            .eq("source_id", source.id)
            .eq("notify", true);
          if (notifyUsers?.length) {
            const sourceName = source.name_zh || source.name_en || source.x_handle || "信源";
            await Promise.allSettled(
              notifyUsers.map((u: { user_id: string }) =>
                sendPushToUser(u.user_id, {
                  title: `FameScope · ${sourceName}`,
                  body: `有 ${results.processed} 条新内容`,
                  url: "/",
                })
              )
            );
          }
        }

      } catch (err) {
        console.error(`collect error for source ${source.id}:`, err);
        results.errors++;
      }
    })
  );

  return NextResponse.json(results);
}

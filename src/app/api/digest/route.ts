/* eslint-disable @typescript-eslint/no-explicit-any */
// POST /api/digest
// 为指定用户（或全部用户）生成每日简报
// 由 Vercel Cron 每天早 8 点触发
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import { DIGEST_SYSTEM_PROMPT, buildDigestPrompt } from "@/lib/prompts";
import type { DigestContent } from "@/types/database";

function isAuthorized(req: Request): boolean {
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  const ai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1",
  });
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // 获取所有用户 ID
  const { data: users } = await supabase.auth.admin.listUsers();
  if (!users?.users?.length) {
    return NextResponse.json({ message: "no users" });
  }

  let generated = 0;

  for (const user of users.users) {
    try {
      await generateDigestForUser(supabase, ai, user.id, since);
      generated++;
    } catch (err) {
      console.error(`digest error for user ${user.id}:`, err);
    }
  }

  return NextResponse.json({ generated });
}

// per-user 生成函数——保证每个用户的简报是独立的个性化内容
async function generateDigestForUser(
  supabase: ReturnType<typeof createServiceClient>,
  ai: OpenAI,
  userId: string,
  since: string
) {
  // 1. 拉取该用户的订阅信源
  const { data: userSources } = await supabase
    .from("user_source")
    .select("source_id")
    .eq("user_id", userId);

  if (!userSources?.length) return;

  const sourceIds = userSources.map((us: { source_id: string }) => us.source_id);

  // 2. 拉取过去24小时内相关 post（评分>=6，最多15条）
  const { data: posts } = await supabase
    .from("post")
    .select("*, source:source(*)")
    .in("source_id", sourceIds)
    .gte("published_at", since)
    .gte("score", 6)
    .order("score", { ascending: false })
    .limit(15);

  if (!posts?.length) return;

  // 3. 整理 highlights（高分动态）
  const highlights = posts.map((p: any) => ({
    postId: p.id,
    sourceId: p.source_id,
    sourceNameZh: p.source?.name_zh ?? null,
    sourceNameEn: p.source?.name_en ?? "",
    summaryZh: p.summary_zh ?? "",
    signalHint: p.signal_hint ?? "",
    score: p.score ?? 6,
    tags: p.tags ?? [],
  }));

  // 4. 统计各信源今日动态数
  const activityMap = new Map<string, { count: number; topSummary: string; source: any }>();
  for (const p of posts) {
    const key = p.source_id;
    if (!activityMap.has(key)) {
      activityMap.set(key, { count: 0, topSummary: p.summary_zh ?? "", source: p.source });
    }
    activityMap.get(key)!.count++;
  }
  const sourceActivity = Array.from(activityMap.values()).map((v) => ({
    sourceId: v.source.id,
    sourceNameZh: v.source.name_zh ?? null,
    sourceNameEn: v.source.name_en ?? "",
    count: v.count,
    topSummary: v.topSummary,
  }));

  // 5. 调用 DeepSeek 生成今日核心 + 信号共振
  const promptData = highlights.map((h: typeof highlights[0]) => ({
    sourceNameZh: h.sourceNameZh,
    sourceNameEn: h.sourceNameEn,
    summaryZh: h.summaryZh,
    score: h.score,
  }));

  const completion = await ai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: DIGEST_SYSTEM_PROMPT },
      { role: "user", content: buildDigestPrompt(promptData) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 512,
  });

  const aiResult = JSON.parse(completion.choices[0]?.message?.content ?? "{}");

  // 6. 拼装官方新闻（article 类型）
  const { data: newsItems } = await supabase
    .from("post")
    .select("*, source:source(*)")
    .in("source_id", sourceIds)
    .eq("content_type", "article")
    .gte("published_at", since)
    .order("score", { ascending: false })
    .limit(5);

  const officialNews = (newsItems ?? []).map((n: any) => ({
    postId: n.id,
    sourceId: n.source_id,
    title: n.title ?? "",
    summaryZh: n.summary_zh ?? "",
    articleUrl: n.article_url ?? "",
  }));

  const content: DigestContent = {
    coreConclusion: aiResult.core_conclusion ?? "",
    highlights,
    resonance: (aiResult.resonance ?? []).map((r: any) => ({
      topic: r.topic ?? "",
      description: r.description ?? "",
      sourceIds: [],
    })),
    officialNews,
    sourceActivity,
  };

  // 7. 存入数据库
  await supabase.from("digest").insert({
    user_id: userId,
    content,
  });
}

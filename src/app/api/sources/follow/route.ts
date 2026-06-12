// POST /api/sources/follow  { handle, nameEn, nameZh, company, title, type, verified, followersCount }
// PATCH /api/sources/follow { handle, notify }
// DELETE /api/sources/follow { handle }
//
// source 表是共享内容层，写入须用 serviceClient（绕过 RLS）；
// user_source 是用户行为层，用普通 userClient 写（RLS 保证只能操作自己的）。
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// 已知机构官方博客 RSS（handle 小写匹配）
const ORG_RSS: Record<string, string> = {
  openai:          "https://openai.com/blog/rss.xml",
  anthropicai:     "https://www.anthropic.com/rss.xml",
  googledeepMind:  "https://deepmind.google/blog/rss.xml",
  googledeepMindAI:"https://deepmind.google/blog/rss.xml",
  aiatmeta:        "https://ai.meta.com/blog/rss/",
  metaai:          "https://ai.meta.com/blog/rss/",
  microsoft:       "https://blogs.microsoft.com/ai/feed/",
  microsoftai:     "https://blogs.microsoft.com/ai/feed/",
  xai:             "https://x.ai/blog/rss.xml",
  mistralai:       "https://mistral.ai/feed.xml",
  huggingface:     "https://huggingface.co/blog/feed.xml",
  nvidia:          "https://blogs.nvidia.com/feed/",
};

function getRssUrl(handle: string): string | null {
  const key = handle.replace(/^@/, "").toLowerCase();
  return ORG_RSS[key] ?? null;
}

export async function POST(req: Request) {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { handle, nameEn, nameZh, company, title, type, verified, followersCount } = body;
  if (!handle) return NextResponse.json({ error: "handle required" }, { status: 400 });

  // source 表用 serviceClient 写（共享内容层，RLS 无 INSERT 策略）
  const svc = createServiceClient();
  const resolvedType = type ?? "person";
  const rssUrl = resolvedType === "org" ? getRssUrl(handle) : null;

  const { data: source, error: upsertErr } = await svc
    .from("source")
    .upsert(
      {
        x_handle: handle,
        name_en: nameEn ?? handle,
        name_zh: nameZh ?? null,
        company: company ?? null,
        title: title ?? null,
        type: resolvedType,
        x_verified: verified ?? false,
        x_followers_count: followersCount ?? 0,
        ...(rssUrl ? { rss_url: rssUrl } : {}),
      },
      { onConflict: "x_handle", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

  // user_source 用 userClient 写（RLS own-all 策略）
  const { error: followErr } = await userClient
    .from("user_source")
    .upsert(
      { user_id: user.id, source_id: source.id },
      { onConflict: "user_id,source_id", ignoreDuplicates: true }
    );

  if (followErr) return NextResponse.json({ error: followErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, sourceId: source.id });
}

// PATCH: toggle notify for a source
export async function PATCH(req: Request) {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body2 = await req.json();
  const handle = (body2.handle as string)?.replace(/^@/, "");
  const notify = body2.notify;
  if (!handle || typeof notify !== "boolean") {
    return NextResponse.json({ error: "handle and notify required" }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data: source } = await svc
    .from("source")
    .select("id")
    .eq("x_handle", handle)
    .single();

  if (!source) return NextResponse.json({ error: "source not found" }, { status: 404 });

  const { error } = await userClient
    .from("user_source")
    .update({ notify })
    .eq("user_id", user.id)
    .eq("source_id", source.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const handle = (body.handle as string)?.replace(/^@/, "");
  if (!handle) return NextResponse.json({ error: "handle required" }, { status: 400 });

  const svc = createServiceClient();
  const { data: source } = await svc
    .from("source")
    .select("id")
    .eq("x_handle", handle)
    .single();

  if (!source) return NextResponse.json({ ok: true });

  await userClient
    .from("user_source")
    .delete()
    .eq("user_id", user.id)
    .eq("source_id", source.id);

  return NextResponse.json({ ok: true });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// GET /api/discover/search?q=AI&type=domain|name
// 两步法：AI 召回候选 → TwitterAPI.io 核实真实账号数据
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

function getAI() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1",
  });
}

const TWITTER_API_BASE = "https://api.twitterapi.io/twitter";

// ── Step 1a：领域搜索 → DeepSeek 召回候选名单 ──────────────────
async function aiRecallCandidates(
  domain: string,
  type: "person" | "org"
): Promise<Array<{ nameEn: string; nameZh: string | null; company: string; title: string; likelyHandle?: string }>> {
  const prompt =
    type === "person"
      ? `列出在「${domain}」领域最有影响力的 8 位个人（创始人、科学家、投资人等）。
只返回 JSON 数组，格式：[{"nameEn":"Sam Altman","nameZh":"奥尔特曼","company":"OpenAI","title":"CEO","likelyHandle":"sama"}]
likelyHandle 填你确信的 Twitter @handle（小写，不带@），不确定填 null。
不要编造账号，只提供你确信存在的人物。公司名保留英文。`
      : `列出在「${domain}」领域最重要的 8 个公司/机构的官方 X 账号。
只返回 JSON 数组，格式：[{"nameEn":"OpenAI","nameZh":null,"company":"OpenAI","title":"官方账号","likelyHandle":"OpenAI"}]
likelyHandle 填官方 X 账号的 handle（小写，不带@），这非常重要——机构官号容易被冒名，必须填准确的 handle。
只列出真实存在的大型机构。`;

  const res = await getAI().chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 800,
  });

  const text = res.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : (Object.values(parsed)[0] as typeof parsed);
  return Array.isArray(arr) ? arr.slice(0, 8) : [];
}

// ── Step 1b：名字搜索 → DeepSeek 识别英文名 + 可能的 handle ─────
// 处理中文名（如"马斯克"）→ 返回英文名和 Twitter handle 候选
async function aiIdentifyPerson(q: string): Promise<{
  nameEn: string;
  nameZh: string | null;
  company: string;
  title: string;
  likelyHandle: string | null; // AI 推测的 Twitter handle（可能不准，还需 Twitter 核实）
} | null> {
  const res = await getAI().chat.completions.create({
    model: "deepseek-chat",
    messages: [{
      role: "user",
      content: `用户搜索「${q}」，判断这是哪位知名人物或机构。
只返回一个 JSON 对象，格式：{"nameEn":"Elon Musk","nameZh":"马斯克","company":"xAI","title":"创始人","likelyHandle":"elonmusk"}
likelyHandle 填你认为最可能的 Twitter @handle（不带@，小写），不确定填 null。
如果完全不认识这个人/机构，返回 {"nameEn":null}。`,
    }],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 200,
  });

  const text = res.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text);
  if (!parsed.nameEn) return null;
  return parsed;
}

// ── Step 2：Twitter 搜索核实（按名字搜，取粉丝最多的匹配） ────────
// 替代原来的 user/info?userName= 直接查 handle（那个接口需要精确 handle）
async function searchTwitterByName(nameEn: string, likelyHandle?: string | null): Promise<{
  handle: string;
  followersCount: number;
  verified: boolean;
  description: string;
  avatarUrl: string;
} | null> {
  try {
    // 如果 AI 给了 likely handle，先尝试直接查（最准确）
    if (likelyHandle) {
      const directRes = await fetch(
        `${TWITTER_API_BASE}/user/info?userName=${encodeURIComponent(likelyHandle)}`,
        { headers: { "X-API-Key": process.env.TWITTER_API_IO_KEY! }, cache: "no-store" }
      );
      if (directRes.ok) {
        const data = await directRes.json();
        const user = data.data ?? data.user ?? data;
        // API 返回 camelCase：userName / followersCount / profileImageUrl
        const handle = user?.userName ?? user?.screen_name;
        if (handle) {
          // user/info 返回的字段：followers / profilePicture / isBlueVerified
          const avatarRaw = user.profilePicture ?? user.profileImageUrl ?? user.profile_image_url_https ?? "";
          return {
            handle,
            followersCount: user.followers ?? user.followersCount ?? user.followers_count ?? 0,
            verified: user.isBlueVerified ?? user.isVerified ?? user.verified ?? false,
            description: user.description ?? "",
            // 去掉 _normal 后缀，拿更高分辨率头像
            avatarUrl: avatarRaw.replace("_normal.", "_400x400."),
          };
        }
      }
    }

    // user/search 端点数据不可靠，不做 fallback
    // 没有 likelyHandle 就返回 null
    return null;
  } catch {
    return null;
  }
}

// 判断输入是否像 Twitter handle（无空格，只含字母数字下划线，去掉@后）
function looksLikeHandle(q: string): boolean {
  const cleaned = q.replace(/^@/, "");
  return /^[A-Za-z0-9_]{1,50}$/.test(cleaned);
}

// 直接用 handle 查 user/info，返回结构化结果
async function lookupByHandle(handle: string): Promise<{
  handle: string; nameEn: string; nameZh: null;
  company: string; title: string;
  followersCount: number; verified: boolean;
  description: string; avatarUrl: string;
} | null> {
  const h = handle.replace(/^@/, "");
  try {
    const res = await fetch(
      `${TWITTER_API_BASE}/user/info?userName=${encodeURIComponent(h)}`,
      { headers: { "X-API-Key": process.env.TWITTER_API_IO_KEY! }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const user = data.data ?? data;
    const resolvedHandle = user?.userName ?? user?.screen_name;
    if (!resolvedHandle) return null;
    const avatarRaw = user.profilePicture ?? user.profileImageUrl ?? user.profile_image_url_https ?? "";
    return {
      handle: resolvedHandle,
      nameEn: user.name ?? resolvedHandle,
      nameZh: null,
      company: "",
      title: "",
      followersCount: user.followers ?? user.followersCount ?? user.followers_count ?? 0,
      verified: user.isBlueVerified ?? user.isVerified ?? user.verified ?? false,
      description: user.description ?? "",
      avatarUrl: avatarRaw.replace("_normal.", "_400x400."),
    };
  } catch {
    return null;
  }
}

// ── 名字搜索：优先直接 handle 查询，再 AI 识别 ───────────────────
async function searchByName(q: string) {
  // 1. 输入像 handle（无空格纯英文数字）→ 直接查，最准确
  if (looksLikeHandle(q)) {
    const direct = await lookupByHandle(q);
    if (direct) return [direct];
  }

  // 2. AI 识别中文名 / 英文全名 → 拿到 likelyHandle 再直查
  const identified = await aiIdentifyPerson(q);
  if (identified) {
    const twitter = await searchTwitterByName(identified.nameEn, identified.likelyHandle);
    if (twitter) {
      return [{
        handle: twitter.handle,
        nameEn: identified.nameEn,
        nameZh: identified.nameZh,
        company: identified.company,
        title: identified.title,
        followersCount: twitter.followersCount,
        verified: twitter.verified,
        description: twitter.description || identified.company,
        avatarUrl: twitter.avatarUrl,
      }];
    }
  }

  return [];
}

// ── 领域两步法：AI 召回 → Twitter 搜索核实 ───────────────────────
async function verifyBatch(
  candidates: Array<{ nameEn: string; nameZh: string | null; company: string; title: string; likelyHandle?: string }>,
  sourceType: "person" | "org",
  followedHandles: Set<string>
) {
  const results = await Promise.all(
    candidates.slice(0, 5).map(async (c) => {
      // 优先用 AI 给的 likelyHandle（对 org 尤其重要，防止搜到冒名账号）
      const twitter = await searchTwitterByName(c.nameEn, c.likelyHandle ?? null);
      if (!twitter) return null;
      return {
        handle: twitter.handle,
        nameEn: c.nameEn,
        nameZh: c.nameZh,
        company: c.company,
        title: c.title,
        followersCount: twitter.followersCount,
        verified: twitter.verified,
        description: twitter.description,
        avatarUrl: twitter.avatarUrl,
        type: sourceType,
        isFollowing: followedHandles.has(twitter.handle),
      };
    })
  );
  return results.filter(Boolean);
}

// ── Route Handler ────────────────────────────────────────────────
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = (searchParams.get("type") ?? "domain") as "domain" | "name";

  if (!q) return NextResponse.json({ persons: [], orgs: [] });

  // 查该用户已追踪的信源
  const { data: followed } = await supabase
    .from("user_source")
    .select("source_id, source:source(x_handle)")
    .eq("user_id", user.id);
  const followedHandles = new Set(
    (followed ?? []).map((f: any) => f.source?.x_handle).filter(Boolean)
  );

  if (type === "name") {
    const results = await searchByName(q);
    return NextResponse.json({
      persons: results.map((r: any) => ({ ...r, isFollowing: followedHandles.has(r.handle) })),
      orgs: [],
    });
  }

  // 领域搜索：AI 两步法
  const [personCandidates, orgCandidates] = await Promise.all([
    aiRecallCandidates(q, "person"),
    aiRecallCandidates(q, "org"),
  ]);

  const [persons, orgs] = await Promise.all([
    verifyBatch(personCandidates, "person", followedHandles),
    verifyBatch(orgCandidates, "org", followedHandles),
  ]);

  return NextResponse.json({ persons, orgs });
}

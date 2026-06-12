// GET /api/sources/my  — 返回当前用户追踪的所有信源（含 notify 状态）
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_source")
    .select(`
      notify,
      followed_at,
      source:source(
        id, type, name_en, name_zh, company, title,
        x_handle, avatar_tint, x_verified, x_followers_count,
        score_influence, score_relevance, score_activity
      )
    `)
    .eq("user_id", user.id)
    .order("followed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ sources: data ?? [] });
}

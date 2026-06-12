// GET /api/digest/list  — 返回当前用户的简报列表（倒序）
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("digest")
    .select("id, generated_at, content")
    .eq("user_id", user.id)
    .order("generated_at", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ digests: data ?? [] });
}

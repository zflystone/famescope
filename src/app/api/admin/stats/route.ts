import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

function isAdminEmail(email: string | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL;
  return !!adminEmail && email === adminEmail;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createServiceClient();

  const [
    { count: sourceCount },
    { count: postCount },
    { count: userSourceCount },
  ] = await Promise.all([
    service.from("source").select("*", { count: "exact", head: true }),
    service.from("post").select("*", { count: "exact", head: true }),
    service.from("user_source").select("*", { count: "exact", head: true }),
  ]);

  // 今日新增 post
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayPostCount } = await service
    .from("post")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  // 真实注册用户数（需要 count_auth_users() 函数存在于 Supabase）
  let userCount = 0;
  const { data: countData, error: countError } = await service.rpc("count_auth_users");
  if (!countError && countData != null) {
    userCount = Number(countData);
  } else {
    // 降级：用有追踪记录的去重用户数
    const { data: distinctUsers } = await service.from("user_source").select("user_id");
    userCount = new Set((distinctUsers ?? []).map((r: { user_id: string }) => r.user_id)).size;
  }

  return NextResponse.json({
    sources: sourceCount ?? 0,
    posts: postCount ?? 0,
    userSources: userSourceCount ?? 0,
    users: userCount,
    todayPosts: todayPostCount ?? 0,
  });
}

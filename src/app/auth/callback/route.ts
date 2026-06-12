import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 用户点击邮件里的登录链接后跳到这里，交换 session 后重定向
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 判断是否新用户
      const { count } = await supabase
        .from("user_source")
        .select("*", { count: "exact", head: true });

      const destination = count === 0 ? "/onboarding" : "/";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // 出错时回到登录页，带上错误提示
  return NextResponse.redirect(`${origin}/login?error=link_expired`);
}

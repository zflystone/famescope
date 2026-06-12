import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// 公开接口：返回当前是否开放注册
export async function GET() {
  const service = createServiceClient();
  const { data } = await service
    .from("system_settings")
    .select("value")
    .eq("key", "registration_enabled")
    .single();

  // 无记录时默认开放；兼容 boolean 和 string 两种存储格式
  const raw = data?.value;
  const enabled = raw == null ? true : raw !== false && raw !== "false";
  return NextResponse.json({ enabled });
}

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await req.json() as { endpoint: string; keys?: { p256dh: string; auth: string } };

  await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys?.p256dh ?? "",
      auth: sub.keys?.auth ?? "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = createServiceClient();
  const { endpoint } = await req.json() as { endpoint: string };
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}

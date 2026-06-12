import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

function isAdminEmail(email: string | undefined) {
  return !!process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createServiceClient();
  const { data } = await service
    .from("system_settings")
    .select("value")
    .eq("key", "registration_enabled")
    .single();

  const raw = data?.value;
  const registrationEnabled = raw == null ? true : raw !== false && raw !== "false";
  return NextResponse.json({ registrationEnabled });
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { registrationEnabled } = await req.json();
  const service = createServiceClient();

  await service.from("system_settings").upsert(
    { key: "registration_enabled", value: registrationEnabled, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  return NextResponse.json({ ok: true });
}

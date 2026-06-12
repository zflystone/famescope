// PATCH /api/posts/star  { postId, starred: boolean }
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, starred } = await req.json();
  if (!postId || typeof starred !== "boolean") {
    return NextResponse.json({ error: "postId and starred required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_post_state")
    .upsert(
      { user_id: user.id, post_id: postId, is_starred: starred },
      { onConflict: "user_id,post_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

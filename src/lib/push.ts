import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

let adminClient: ReturnType<typeof createClient> | null = null;

function getAdmin() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return adminClient;
}

function initVapid() {
  webpush.setVapidDetails(
    "mailto:admin@famescope.cn",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string },
) {
  initVapid();
  const admin = getAdmin();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs?.length) return;

  await Promise.allSettled(
    subs.map((sub) =>
      webpush
        .sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        )
        .catch(async (err: { statusCode?: number }) => {
          if (err.statusCode === 410) {
            // Subscription expired, remove it
            await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        }),
    ),
  );
}

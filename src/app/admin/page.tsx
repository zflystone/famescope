import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminView from "@/components/admin/AdminView";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) redirect("/");

  return <AdminView />;
}

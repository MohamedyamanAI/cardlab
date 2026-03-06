import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { isAdminEmail } from "@/lib/utils/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!isAdminEmail(user.email ?? "")) {
    redirect("/projects");
  }

  return (
    <AdminSidebar userEmail={user.email ?? ""}>
      {children}
    </AdminSidebar>
  );
}

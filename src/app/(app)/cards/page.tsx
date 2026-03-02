import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectsByUser } from "@/lib/repository/projects";
import { CardsPageClient } from "@/components/features/cards/cards-page-client";

export default async function CardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const projects = await getProjectsByUser(supabase, user.id);

  return <CardsPageClient initialProjects={projects} />;
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/shared/sign-out-button";

export default async function AppLayout({
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

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-foreground/10 p-4">
        <div className="mb-8">
          <span className="text-lg font-semibold">Cardlab</span>
        </div>
        <nav className="space-y-1">
          <Link
            href="/games"
            className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
          >
            Games
          </Link>
          <Link
            href="/cards"
            className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
          >
            Cards
          </Link>
        </nav>
      </aside>
      <div className="flex-1">
        <header className="border-b border-foreground/10">
          <div className="flex items-center justify-end px-6 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground/60">{user.email}</span>
              <SignOutButton />
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

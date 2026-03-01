"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <button
      onClick={handleSignOut}
      className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/5"
    >
      Sign out
    </button>
  );
}

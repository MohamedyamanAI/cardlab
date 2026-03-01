import Link from "next/link";
import { BlurFade } from "@/components/magicui/blur-fade";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <BlurFade delay={0}>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Authentication error
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {error || "Something went wrong during authentication."}
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1}>
        <div className="text-center text-sm">
          <Link
            href="/auth/login"
            className="font-medium text-purple-400 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </BlurFade>
    </>
  );
}

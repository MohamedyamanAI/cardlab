import Link from "next/link";
import { BlurFade } from "@/components/magicui/blur-fade";

export default function CheckEmailPage() {
  return (
    <>
      <BlurFade delay={0}>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <svg
              className="h-6 w-6 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-2 text-sm text-white/60">
            We&apos;ve sent you a confirmation link. Please check your email and
            click the link to verify your account.
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1}>
        <div className="text-center text-sm">
          <Link
            href="/auth/login"
            className="text-purple-400 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </BlurFade>
    </>
  );
}

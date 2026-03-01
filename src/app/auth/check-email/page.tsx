import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5">
          <svg
            className="h-6 w-6 text-foreground/60"
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
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-foreground/60">
          We&apos;ve sent you a confirmation link. Please check your email and
          click the link to verify your account.
        </p>
      </div>

      <div className="text-center text-sm">
        <Link
          href="/auth/login"
          className="text-foreground/60 hover:text-foreground"
        >
          Back to sign in
        </Link>
      </div>
    </>
  );
}

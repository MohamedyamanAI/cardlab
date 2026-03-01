"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword, type ForgotPasswordState } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<
    ForgotPasswordState,
    FormData
  >(resetPassword, null);

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {state?.success ? (
        <div className="space-y-4">
          <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
            Check your email for a password reset link.
          </div>
          <div className="text-center text-sm">
            <Link
              href="/auth/login"
              className="font-medium text-foreground hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/40"
              />
              {state?.errors?.email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <div className="text-center text-sm">
            <Link
              href="/auth/login"
              className="text-foreground/60 hover:text-foreground"
            >
              Back to sign in
            </Link>
          </div>
        </>
      )}
    </>
  );
}

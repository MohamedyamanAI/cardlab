"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type SignupState } from "./actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    signup,
    null
  );

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Get started with Cardlab for free.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.message && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {state.message}
          </div>
        )}

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

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/40"
          />
          {state?.errors?.password && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {state.errors.password.map((err) => (
                <p key={err}>{err}</p>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/40"
          />
          {state?.errors?.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <div className="text-center text-sm text-foreground/60">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </div>
    </>
  );
}

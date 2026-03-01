"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type SignupState } from "./actions";
import { Input } from "@/components/aceternity/aceternity-input";
import { Label } from "@/components/aceternity/aceternity-label";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BlurFade } from "@/components/magicui/blur-fade";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    signup,
    null
  );

  return (
    <>
      <BlurFade delay={0}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Get started with Cardlab for free.
          </p>
        </div>
      </BlurFade>

      <form action={formAction} className="space-y-4">
        {state?.message && (
          <BlurFade delay={0.05}>
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {state.message}
            </div>
          </BlurFade>
        )}

        <BlurFade delay={0.1}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            {state?.errors?.email && (
              <p className="text-sm text-red-400">{state.errors.email[0]}</p>
            )}
          </div>
        </BlurFade>

        <BlurFade delay={0.15}>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
            {state?.errors?.password && (
              <div className="text-sm text-red-400">
                {state.errors.password.map((err) => (
                  <p key={err}>{err}</p>
                ))}
              </div>
            )}
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
            {state?.errors?.confirmPassword && (
              <p className="text-sm text-red-400">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>
        </BlurFade>

        <BlurFade delay={0.25}>
          <ShimmerButton
            type="submit"
            disabled={pending}
            className="w-full text-sm font-medium disabled:opacity-50"
            background="rgba(124, 58, 237, 0.5)"
            shimmerColor="#a78bfa"
            borderRadius="calc(0.625rem + 16px)"
          >
            {pending ? "Creating account..." : "Sign up"}
          </ShimmerButton>
        </BlurFade>
      </form>

      <BlurFade delay={0.3}>
        <div className="text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-purple-400 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </BlurFade>
    </>
  );
}

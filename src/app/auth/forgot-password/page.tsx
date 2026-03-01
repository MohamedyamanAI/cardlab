"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword, type ForgotPasswordState } from "./actions";
import { Input } from "@/components/aceternity/aceternity-input";
import { Label } from "@/components/aceternity/aceternity-label";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BlurFade } from "@/components/magicui/blur-fade";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<
    ForgotPasswordState,
    FormData
  >(resetPassword, null);

  return (
    <>
      <BlurFade delay={0}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>
      </BlurFade>

      {state?.success ? (
        <BlurFade delay={0.1}>
          <div className="space-y-4">
            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
              Check your email for a password reset link.
            </div>
            <div className="text-center text-sm">
              <Link
                href="/auth/login"
                className="font-medium text-purple-400 hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </BlurFade>
      ) : (
        <>
          <form action={formAction} className="space-y-4">
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
                  <p className="text-sm text-red-400">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>
            </BlurFade>

            <BlurFade delay={0.15}>
              <ShimmerButton
                type="submit"
                disabled={pending}
                className="w-full text-sm font-medium disabled:opacity-50"
                background="rgba(124, 58, 237, 0.5)"
                shimmerColor="#a78bfa"
                borderRadius="calc(0.625rem + 16px)"
              >
                {pending ? "Sending..." : "Send reset link"}
              </ShimmerButton>
            </BlurFade>
          </form>

          <BlurFade delay={0.2}>
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
      )}
    </>
  );
}

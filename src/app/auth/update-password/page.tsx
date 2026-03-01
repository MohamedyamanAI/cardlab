"use client";

import { useActionState } from "react";
import { updatePassword, type UpdatePasswordState } from "./actions";
import { Input } from "@/components/aceternity/aceternity-input";
import { Label } from "@/components/aceternity/aceternity-label";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BlurFade } from "@/components/magicui/blur-fade";

export default function UpdatePasswordPage() {
  const [state, formAction, pending] = useActionState<
    UpdatePasswordState,
    FormData
  >(updatePassword, null);

  return (
    <>
      <BlurFade delay={0}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Set new password</h1>
          <p className="mt-2 text-sm text-white/60">
            Enter your new password below.
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
            <Label htmlFor="password">New password</Label>
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

        <BlurFade delay={0.15}>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
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

        <BlurFade delay={0.2}>
          <ShimmerButton
            type="submit"
            disabled={pending}
            className="w-full text-sm font-medium disabled:opacity-50"
            background="rgba(124, 58, 237, 0.5)"
            shimmerColor="#a78bfa"
            borderRadius="calc(0.625rem + 16px)"
          >
            {pending ? "Updating..." : "Update password"}
          </ShimmerButton>
        </BlurFade>
      </form>
    </>
  );
}
